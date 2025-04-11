export interface Bar {
    OpenPrice: number;
    ClosePrice: number;
    HighPrice: number;
    LowPrice: number;
    Volume: number;
    Timestamp: string;
  }
  
  export interface Order {
    symbol: string;
    qty: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit';
    time_in_force: 'gtc' | 'ioc' | 'fok';
  }


  export interface AlpacaBar {
    Timestamp: string;    // e.g., "2023-01-01T14:30:00Z"
    OpenPrice: number;    // Opening price
    ClosePrice: number;   // Closing price
    HighPrice: number;    // Highest price in the interval
    LowPrice: number;     // Lowest price in the interval
    Volume: number;       // Trading volume
    TradeCount?: number;  // Number of trades (optional)
    VWAP?: number;        // Volume-weighted avg price (optional)
  }