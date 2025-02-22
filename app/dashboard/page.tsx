"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CsvUploader } from "@/components/csv-uploader";
import { CsvDownloader } from "@/components/csv-downloader";
import { ComingSoon } from "@/components/coming-soon";
import { TransactionsTable } from "@/components/transactions-table";
import { useEffect, useState } from "react";
import { ExchangeAmount } from "@/models/transactions";
import OverViewChart from "@/components/overview-chart";

export default function DashboardPage() {
  const [portfolioValue, setPortfolioValue] = useState<ExchangeAmount>();

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      const response = await fetch(
        "http://192.168.68.75:3090/api/metadata/portfolio_value/USD"
      );
      const newData: ExchangeAmount = await response.json();
      setPortfolioValue(newData);
    } catch (error) {
      console.error("Error loading portfolio value:", error);
    }
  };

  return (
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
                <CardTitle className="text-sm font-medium">
                  Total BTC
                </CardTitle>
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
                <div className="text-2xl font-bold">2.77558904</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last month
                </p>
              </CardContent>
            </Card>
            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Portfolio Value
                </CardTitle>
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
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: portfolioValue?.unit || "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(portfolioValue?.amount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month [FAKE]
                </p>
              </CardContent>
            </Card>
            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Addresses
                </CardTitle>
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
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Assets
                </CardTitle>
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
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="card">
              <CardHeader>
                <CardTitle>CSV Uploader</CardTitle>
                <CardDescription>
                  Upload your transaction CSV files here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CsvUploader onUploadSuccess={loadPortfolioData} />
              </CardContent>
            </Card>
            <Card className="card">
              <CardHeader>
                <CardTitle>CSV Downloader</CardTitle>
                <CardDescription>
                  Download your normalized transactions as CSV.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CsvDownloader />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <Card className="card">
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                A comprehensive list of all your cryptocurrency transactions.
              </CardDescription>
            </CardHeader>
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
  );
}
