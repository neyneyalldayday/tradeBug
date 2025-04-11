import { Router } from 'express';
const router = Router();
import  { Request, Response } from 'express';
import  Alpaca  from '@alpacahq/alpaca-trade-api';
import { AlpacaBar } from '../../types.js'
import 'dotenv/config';

const client = new Alpaca({
    keyId: process.env.ALPACA_KEY || 'YOUR_API_KEY',
    secretKey: process.env.ALPACA_SECRET || 'YOUR_SECRET_KEY',
    paper: true,
  });
  
  // Health check endpoint
  router.get('/', (req: Request, res: Response) => {
    res.json({ status: 'Alive', message: 'Trading bot is running!' });
  });
  
  // Endpoint to manually trigger a strategy
  router.post('/trigger-strategy', async (req: Request, res: Response) => {
    try {
      const { symbol } = req.body;
      await checkSPY(symbol || 'SPY'); // Reusable strategy function
      res.json({ success: true, message: `Strategy executed for ${symbol}` });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ success: false, error: error.message });
        } else {
            res.status(500).json({success: false, error: "Unknown error"})
        }
      
    }
  });

  router.post('/webhook', async (req: Request, res: Response) => {
    const { symbol, action } = req.body; // e.g., { "symbol": "BTCUSD", "action": "buy" }
    
    if (action === 'buy') {
      await client.createOrder({
        symbol,
        qty: 1,
        side: 'buy',
        type: 'market',
      });
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  });

  async function getBarsArray(symbol: string): Promise<AlpacaBar[]> {
    const bars = client.getBarsV2(symbol, { timeframe: 'iDay', limit: 1 });
    const barArray: AlpacaBar[] = [];


    for await (const bar of bars){
        barArray.push(bar);
    }

    return barArray;
  }
  
  // Strategy logic (reusable)
  async function checkSPY(symbol: string): Promise<void> {
    
    const barArray = await getBarsArray(symbol);    
    const latestBar: any = barArray[0];

    if(!latestBar){
        throw new Error('No Bars returned form API');
    }


    const pctChange = (latestBar.ClosePrice - latestBar.OpenPrice) / latestBar.OpenPrice;
  
    if (pctChange < -0.02) {
      await client.createOrder({
        symbol,
        qty: 1,
        side: 'buy',
        type: 'market',
        time_in_force: 'gtc',
      });
      console.log(`Bought ${symbol} on dip!`);
    }
  }




export default router;