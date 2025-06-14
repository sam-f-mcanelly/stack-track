'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComingSoon } from '@/components/shared/coming-soon';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { useEffect, useState } from 'react';
import { ExchangeAmount } from '@/lib/models/transactions';
import OverViewChart from '@/components/dashboard/charts/overview-chart';
import { CsvManager } from '@/components/dashboard/data/csv-manager';
import { useBitcoinData } from '@/lib/hooks/use-bitcoin-data';
import AddressDisplay from '@/components/dashboard/data/address-display';
import AccumulationChart, {
  AccumulationDataPoint,
} from '@/components/dashboard/charts/accumulation-chart';

export default function DashboardPage(): JSX.Element {
  // Portfolio data state
  const [portfolioValue, setPortfolioValue] = useState<ExchangeAmount | undefined>(undefined);
  const [bitcoinHoldings, setBitcoinHoldings] = useState<number>(0);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [btcAccumulationData, setBtcAccumulationData] = useState<AccumulationDataPoint[]>([]);

  // Use our custom Bitcoin data hook
  const {
    price: bitcoinPrice,
    satsPerDollar,
    priceChangePercent,
    direction: priceDirection,
    isLoading: isBitcoinDataLoading,
  } = useBitcoinData();

  useEffect(() => {
    loadPortfolioData();
    loadBitcoinHoldings();
    loadBitcoinAddresses();
    loadBtcAccumulation();
  }, []);

  // Interface for Bitcoin holdings API response
  interface BitcoinHoldingsResponse {
    assetAmount: {
      amount: number;
      unit: string;
    };
  }

  const loadPortfolioData = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:3090/api/metadata/portfolio_value/USD');
      const newData: ExchangeAmount = await response.json();
      setPortfolioValue(newData);
    } catch (error) {
      console.error('Error loading portfolio value:', error);
    }
  };

  const loadBitcoinHoldings = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:3090/api/metadata/holdings/BTC');
      const data: BitcoinHoldingsResponse = await response.json();

      // Assuming the API returns the holdings in a format that includes an amount property
      if (data && typeof data.assetAmount.amount === 'number') {
        setBitcoinHoldings(data.assetAmount.amount);
      }
    } catch (error) {
      console.error('Error loading Bitcoin holdings:', error);
    }
  };

  const loadBtcAccumulation = async (): Promise<void> => {
    try {
      // Get accumulation data for the past 180 days (approximately 6 months)
      const days = 180;
      const response = await fetch(`http://localhost:3090/api/metadata/accumulation/BTC/${days}`);
      const data: number[] = await response.json();

      // Format data for the chart (assuming data is an array of values)
      const formattedData: AccumulationDataPoint[] = data.map((amount, index) => ({
        date: index, // Simple index for x-axis
        amount: amount, // The BTC amount at that point in time
      }));

      setBtcAccumulationData(formattedData);
    } catch (error) {
      console.error('Error loading BTC accumulation data:', error);
    }
  };

  const loadBitcoinAddresses = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:3090/api/metadata/addresses/BTC');
      const data: string[] = await response.json();

      if (Array.isArray(data)) {
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error loading Bitcoin addresses:', error);
    }
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight gradient-bg text-transparent bg-clip-text">
            Dashboard
          </h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sats per Dollar</CardTitle>
                  <img
                    src="/btc-icon.png"
                    alt="Bitcoin Logo"
                    width="18"
                    height="18"
                    className="object-contain"
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isBitcoinDataLoading
                      ? 'Loading...'
                      : satsPerDollar.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    BTC:{' '}
                    <span
                      className={
                        priceDirection === 'up'
                          ? 'price-up'
                          : priceDirection === 'down'
                            ? 'price-down'
                            : ''
                      }
                    >
                      $
                      {bitcoinPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      {priceChangePercent}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span
                      className={
                        priceDirection === 'down'
                          ? 'price-up'
                          : priceDirection === 'up'
                            ? 'price-down'
                            : ''
                      }
                    >
                      {/* Sats go up when price goes down and vice versa */}
                      {priceDirection === 'down' ? '+' : priceDirection === 'up' ? '-' : ''}
                      {Math.abs(parseFloat(priceChangePercent)).toFixed(2)}% sats/$ in 24h
                    </span>
                  </p>
                  <div className="bitcoin-animation-container">
                    <div className="bitcoin-sparkle"></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total BTC</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{bitcoinHoldings.toFixed(8)}</div>
                  <div className="mt-2">
                    <AccumulationChart data={btcAccumulationData} />
                  </div>
                </CardContent>
              </Card>
              <Card className="card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: portfolioValue?.unit || 'USD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(portfolioValue?.amount || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month [FAKE]</p>
                </CardContent>
              </Card>
              <Card className="card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{addresses.length}</div>
                  <AddressDisplay addresses={addresses} />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="card col-span-10">
                <CardHeader>
                  <CardTitle>Chart</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <OverViewChart />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <CsvManager
                onUploadSuccess={() => {
                  loadPortfolioData();
                  loadBitcoinHoldings();
                  loadBitcoinAddresses();
                  loadBtcAccumulation();
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <Card className="card">
              <CardContent>
                <TransactionsTable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <ComingSoon
              title="Analytics"
              description="Gain insights into your cryptocurrency portfolio performance."
            />
          </TabsContent>
          <TabsContent value="notifications" className="space-y-4">
            <ComingSoon
              title="Notifications"
              description="Stay updated with important alerts and information about your portfolio."
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
