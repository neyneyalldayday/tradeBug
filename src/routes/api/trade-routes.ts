import express, { Router, Request, Response } from 'express';
import { client, shouldBuy, calculateSafeQty } from '../../strategies/index'

import 'dotenv/config';

const router: Router = express.Router();


  
  // Health check endpoint
  router.get('/', (req: Request, res: Response) => {   
    res.json({ status: 'Alive', message: 'Trading bot is running!' });
  });
  
  // Endpoint to manually trigger a strategy
  router.post('/trigger-strategy', async (req: Request, res: Response) => {
    console.log("hit")
    try {
        const { symbol } = req.body;
        const tradingSymbol = symbol || 'SPY';
        
        if (await shouldBuy(tradingSymbol)) {
          const qty = await calculateSafeQty(tradingSymbol, 2); // 2% risk
          await client.createOrder({
            symbol: tradingSymbol,
            qty,
            side: 'buy',
            type: 'market',
            time_in_force: 'gtc',
          });
          res.json({ success: true, message: `Bought ${tradingSymbol}` });
        } else {
          res.json({ success: false, message: 'Buy conditions not met' });
        }
      } catch (error) {
        if (error instanceof Error) {
          res.status(500).json({ success: false, error: error.message });
        } else {
          res.status(500).json({ success: false, error: "Unknown error" });
        }
      }
  });

  router.post('/webhook', async (req: Request, res: Response): Promise<void> => {  

   try {
    const { symbol, action } = req.body; // e.g., { "symbol": "BTCUSD", "action": "buy" }
    
    if (!symbol || !['buy', 'sell'].includes(action)) {
      res.status(400).json({ error: 'Invalid symbol or action'});
      return;
    }
    const qty = symbol.endsWith('USD') ? 0.01 : 1;

    await client.createOrder({
        symbol: symbol.toUpperCase(),
        qty,
        side: action,
        type: 'market',
        time_in_force: 'gtc',
    });

    res.json({ success: true });
    } catch (error) {
        const err = error as { response?: {data?: any}, message: string};
    console.error("Order error: ", err.response?.data || err.message)
   }
  });


  




export default router;