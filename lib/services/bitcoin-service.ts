/**
 * Service for Bitcoin-related API calls
 */

export interface BitcoinPrice {
  price: string;
  time: string;
}

export interface BitcoinPriceResponse {
  data: {
    base: string;
    currency: string;
    amount?: string;
    prices?: BitcoinPrice[];
  };
}

/**
 * Fetches the current Bitcoin price in USD from Coinbase
 */
export const fetchCurrentBitcoinPrice = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
    const data: BitcoinPriceResponse = await response.json();

    if (!data.data.amount) {
      throw new Error('Invalid response from Coinbase API');
    }

    return parseFloat(data.data.amount);
  } catch (error) {
    console.error('Error fetching current Bitcoin price:', error);
    throw error;
  }
};

/**
 * Fetches historical Bitcoin prices for the past day from Coinbase
 */
export const fetchHistoricalBitcoinPrices = async (): Promise<BitcoinPrice[]> => {
  try {
    const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/historic?period=day');
    const data: BitcoinPriceResponse = await response.json();

    if (!data.data.prices || !Array.isArray(data.data.prices)) {
      throw new Error('Invalid response from Coinbase API');
    }

    return data.data.prices;
  } catch (error) {
    console.error('Error fetching historical Bitcoin prices:', error);
    throw error;
  }
};

/**
 * Calculates sats per dollar based on Bitcoin price
 * @param bitcoinPrice Bitcoin price in USD
 */
export const calculateSatsPerDollar = (bitcoinPrice: number): number => {
  // 1 BTC = 100,000,000 sats
  return 100000000 / bitcoinPrice;
};
