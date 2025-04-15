import * as ti from 'technicalindicators'; 
import  Alpaca  from '@alpacahq/alpaca-trade-api';
import { AlpacaBar } from '../types'
import { setTimeout } from 'timers/promises';

export const client = new Alpaca({
    keyId: process.env.ALPACA_KEY,
    secretKey: process.env.ALPACA_SECRET,
    paper: true,
    verbose: true,
  });

export async function getBarsArray(
    symbol: string,
    timeframe: string = '1D',
    limit: number = 1
    ): Promise<AlpacaBar[]> {
    const bars = client.getBarsV2(symbol, { timeframe, limit });
    const barArray: AlpacaBar[] = [];


    for await (const bar of bars){
        barArray.push(bar);
    }

    return barArray;
  }



// Example: Only buy if RSI < 30 (oversold) and price > 200-day SMA
export async function shouldBuy(symbol: string): Promise<boolean> {
try {
    await setTimeout(500);
    const bars = await getBarsArray(symbol, '1D', 200);
    if (bars.length < 200) {
        console.warn(`Only  ${bars.length} bars available for ${symbol}`);
        return false;
    }

    const closes = bars.map(bar => bar.ClosePrice);
    
    const rsi = ti.RSI.calculate({
        values: closes,
        period: 14
      });
      
      // Calculate SMA (period 200)
      const sma = ti.SMA.calculate({
        values: closes,
        period: 200
      });

    const lastRSI = rsi[rsi.length - 1];
    const lastClose = closes[closes.length - 1];
    const lastSMA = sma[sma.length - 1];

    console.log(`RSI: ${lastRSI}, Close: ${lastClose}, SMA200: ${lastSMA}`);
    const volumeOk = bars[bars.length-1].Volume > 1_000_000;
    return (lastRSI < 30 && lastClose > lastSMA && volumeOk);
} catch (error) {
    console.error(`Error in shouldIBuy for ${symbol}: `, error);
    return false;    
}
}


// Risk: Never risk >2% of account per trade
export async function calculateSafeQty(
    symbol: string,
    riskPercent: number
  ): Promise<number> {
    try {
      const [account, bars] = await Promise.all([
        client.getAccount(),
        getBarsArray(symbol, '1D', 1),
      ]);
  
      if (!bars.length) throw new Error('No price data available');
  
      const equity = parseFloat(account.equity);
      const riskAmount = equity * (riskPercent / 100);
      const lastClose = bars[0].ClosePrice;
      const stopLossDistance = lastClose * 0.05; // 5% stop-loss
  
      return Math.floor(riskAmount / stopLossDistance);
    } catch (error) {
      console.error(`Error calculating quantity for ${symbol}:`, error);
      return 0;
    }
  }

//   async function backtestStrategy(symbol: string): Promise<{ winRate: number }> {
//     const bars = await getBarsArray(symbol, '1D', 1000); // 1000 days of data
//     let wins = 0, losses = 0;
    
//     for (let i = 200; i < bars.length; i++) {
//       const historicalData = bars.slice(i - 200, i);
//       const shouldBuy = /* Your strategy logic */;
      
//       if (shouldBuy) {
//         const futureReturn = (bars[i + 5].ClosePrice / bars[i].ClosePrice) - 1;
//         futureReturn > 0 ? wins++ : losses++;
//       }
//     }
    
//     return { winRate: wins / (wins + losses) };
//   }