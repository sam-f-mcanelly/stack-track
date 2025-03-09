import { useState, useEffect } from 'react';
import {
  fetchCurrentBitcoinPrice,
  fetchHistoricalBitcoinPrices,
  calculateSatsPerDollar
} from '../services/bitcoin-service';

export type PriceDirection = 'up' | 'down' | 'neutral';

interface BitcoinData {
  price: number;
  satsPerDollar: number;
  priceChangePercent: string;
  direction: PriceDirection;
  isLoading: boolean;
  error: string | null;
}

const initialState: BitcoinData = {
  price: 0,
  satsPerDollar: 0,
  priceChangePercent: '',
  direction: 'neutral',
  isLoading: true,
  error: null
};

/**
 * Custom hook for fetching and managing Bitcoin price data
 * @param refreshInterval Interval in milliseconds to refresh data (default: 60000ms)
 */
export const useBitcoinData = (refreshInterval = 60000): BitcoinData => {
  const [bitcoinData, setBitcoinData] = useState<BitcoinData>(initialState);

  const fetchBitcoinData = async () => {
    try {
      setBitcoinData(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Fetch current and historical prices
      const currentPrice = await fetchCurrentBitcoinPrice();
      const historicalPrices = await fetchHistoricalBitcoinPrices();
      
      // Get price from 24 hours ago (last element in the prices array)
      const dayPrice = parseFloat(historicalPrices[historicalPrices.length - 1].price);
      
      // Calculate sats per dollar
      const satsPerDollar = calculateSatsPerDollar(currentPrice);
      
      // Calculate price change percentage
      const changePercent = ((currentPrice - dayPrice) / dayPrice) * 100;
      const formattedChangePercent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
      const direction: PriceDirection = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';
      
      setBitcoinData({
        price: currentPrice,
        satsPerDollar,
        priceChangePercent: formattedChangePercent,
        direction,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error in useBitcoinData:', error);
      setBitcoinData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch Bitcoin data'
      }));
    }
  };

  useEffect(() => {
    // Fetch data immediately
    fetchBitcoinData();
    
    // Set up interval for refreshing data
    const intervalId = setInterval(fetchBitcoinData, refreshInterval);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return bitcoinData;
};
