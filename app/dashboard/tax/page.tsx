"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BuyTransactions } from "@/components/tax/buy-transactions"
import type { SellReportSummary } from "@/models/tax"
import { type NormalizedTransaction, NormalizedTransactionType, NormalizedTransactionSortKey } from "@/models/transactions"
import { convertToTableTransaction, TableTransaction } from "@/lib/utils/transactionConverter"
import { ReportSummary } from "@/components/tax/report-summary"
import { ArrowUpDown } from "lucide-react"
import { TaxPageInstructions } from "@/components/tax/tax-page-instructions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchTransactions } from "@/api/transactions/transactions"

// Temporary year constant, should be made configurable in future
const TEMP_YEAR = 2024;

export default function TaxPage() {
  const [sellTransactions, setSellTransactions] = useState<TableTransaction[]>([])
  const [selectedSellTransaction, setSelectedSellTransaction] = useState<string | null>(null)
  const [sellToBuyTransactions, setSellToBuyTransactions] = useState<Record<string, string[]>>({})
  const [taxMethods, setTaxMethods] = useState<Record<string, string>>({})
  const [selectedSellTransactions, setSelectedSellTransactions] = useState<string[]>([])
  const [buyTransactionCache, setBuyTransactionCache] = useState<Record<string, TableTransaction[]>>({})
  const [sortKey, setSortKey] = useState<string>("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [sellReportSummaries, setSellReportSummaries] = useState<Record<string, SellReportSummary>>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch sell transactions on initial load
  useEffect(() => {
    fetchSellTransactions();
  }, []);

  // Fetch sell transactions from the API
  const fetchSellTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://192.168.68.75:3090/api/data/sells/${TEMP_YEAR}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const transactions: NormalizedTransaction[] = await response.json();
      const convertedSellTransactions = transactions.map(convertToTableTransaction);
      
      setSellTransactions(convertedSellTransactions);
      setTaxMethods(Object.fromEntries(
        convertedSellTransactions.map((tx) => [tx.id, tx.taxMethod])
      ));
      
    } catch (err) {
      console.error('Failed to fetch sell transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fetch buy transactions for each asset type for better performance
  useEffect(() => {
    const uniqueAssets = [...new Set(sellTransactions.map(tx => tx.asset))];
    
    const fetchBuyTransactionsForAssets = async () => {
      const assetBuyTransactionsMap: Record<string, TableTransaction[]> = {};
      
      for (const asset of uniqueAssets) {
        try {
          // Fetch all buy transactions for this asset (with a large page size)
          const result = await fetchTransactions({
            page: 1,
            pageSize: 1000, // Large number to get all transactions
            sortBy: "timestamp" as NormalizedTransactionSortKey,
            sortOrder: "asc",
            assets: [asset],
            types: [NormalizedTransactionType.BUY]
          });
          
          // Convert and store in the cache
          const convertedTransactions = result.data.map(tx => {
            const tableTx = convertToTableTransaction(tx);
            return tableTx;
          });
          
          assetBuyTransactionsMap[asset] = convertedTransactions;
        } catch (error) {
          console.error(`Error prefetching buy transactions for ${asset}:`, error);
        }
      }
      
      setBuyTransactionCache(assetBuyTransactionsMap);
    };
    
    if (sellTransactions.length > 0) {
      fetchBuyTransactionsForAssets();
    }
  }, [sellTransactions]);

  // Debugging logs
  useEffect(() => {
    console.log("sellTransactions updated:", sellTransactions);
  }, [sellTransactions]);

  useEffect(() => {
    console.log("buyTransactionCache updated:", buyTransactionCache);
  }, [buyTransactionCache]);

  useEffect(() => {
    console.log("taxMethods updated:", taxMethods);
  }, [taxMethods]);

  useEffect(() => {
    console.log("selectedSellTransactions updated:", selectedSellTransactions);
  }, [selectedSellTransactions]);

  useEffect(() => {
    console.log("sellToBuyTransactions updated:", sellToBuyTransactions);
  }, [sellToBuyTransactions]);

  const handleConfigureClick = (id: string) => {
    setSelectedSellTransaction(id === selectedSellTransaction ? null : id);
  };

  const handleSaveBuyTransactions = (sellId: string, buyIds: string[], taxMethod: string) => {
    console.log(`Updating for sellId: ${sellId}, buyIds:`, buyIds, "taxMethod:", taxMethod);
    console.log("Before update - sellToBuyTransactions:", sellToBuyTransactions);
    
    // Update the mapping of sell transactions to buy transactions
    setSellToBuyTransactions((prev) => {
      const updated = { ...prev, [sellId]: buyIds };
      console.log("After update - sellToBuyTransactions:", updated);
      return updated;
    });
    
    // Update the tax method for this sell transaction
    setTaxMethods((prev) => ({ ...prev, [sellId]: taxMethod }));
  };

  const handleTaxMethodChange = (sellId: string, method: string) => {
    setTaxMethods((prev) => ({ ...prev, [sellId]: method }));
  };

  const handleSelectSellTransaction = (id: string) => {
    setSelectedSellTransactions((prev) => 
      prev.includes(id) ? prev.filter((txId) => txId !== id) : [...prev, id]
    );
  };

  const handleGenerateReport = async () => {
    console.log("Generating report with data:", sellReportSummaries);
    try {
      const response = await fetch("/api/generate-tax-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.values(sellReportSummaries)),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tax report");
      }

      const result = await response.json();
      console.log("Tax report generated:", result);
      // Here you would typically update the UI to show the new report
    } catch (error) {
      console.error("Error generating tax report:", error);
      // Here you would typically show an error message to the user
    }
  };

  // Update sell report summaries whenever relevant state changes
  useEffect(() => {
    updateSellReportSummaries();
  }, [selectedSellTransactions, sellToBuyTransactions, taxMethods, sellTransactions, buyTransactionCache]);

  /**
   * Determines if a sell transaction is complete based on its tax method
   * 
   * For CUSTOM tax method: Checks if the manually selected buy transactions cover the sold amount
   * For automatic methods (FIFO/LIFO): Validates if enough buy transactions exist to cover this sell
   * 
   * @param sellTransaction The sell transaction to check
   * @param buyTransactions The associated buy transactions (only used for CUSTOM method)
   * @param assetBuyTransactions All available buy transactions for this asset
   * @param otherSellsOfSameAsset Other sell transactions of the same asset that are selected
   * @param taxMethod The tax method (FIFO, LIFO, CUSTOM)
   * @returns boolean indicating if the sell is complete
   */
  const isSellComplete = (
    sellTransaction: TableTransaction,
    buyTransactions: TableTransaction[],
    assetBuyTransactions: TableTransaction[],
    otherSellsOfSameAsset: TableTransaction[],
    taxMethod: string
  ): boolean => {
    // For CUSTOM tax method, check if manually selected buy transactions cover the sold amount
    if (taxMethod === "CUSTOM") {
      // If no buy transactions are selected, sell is incomplete
      if (buyTransactions.length === 0) {
        return false;
      }
      
      // Sum up the total amount of the asset from associated buy transactions
      const totalBuyAmount = buyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      // The sell is complete if the buy transactions cover at least the sell amount
      return totalBuyAmount >= sellTransaction.amount;
    }
    
    // For automatic tax methods (FIFO, LIFO), check if enough buy transactions exist
    
    // Get all buy transactions for this asset
    const allBuysForAsset = [...assetBuyTransactions];
    
    // Sort by date based on tax method
    if (taxMethod === "FIFO") {
      allBuysForAsset.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (taxMethod === "LIFO") {
      allBuysForAsset.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    // Calculate the total amount needed for all sells of this asset (including this one)
    const totalSellAmount = otherSellsOfSameAsset.reduce((sum, tx) => sum + tx.amount, 0) + sellTransaction.amount;
    
    // Calculate the total available buy amount
    const totalAvailableBuyAmount = allBuysForAsset.reduce((sum, tx) => sum + tx.amount, 0);
    
    // The sell is complete if enough buy transactions exist to cover all sells
    return totalAvailableBuyAmount >= totalSellAmount;
  };

  const updateSellReportSummaries = () => {
    console.log("Updating sell reports...");
    const newSellReportSummaries: Record<string, SellReportSummary> = {};
    
    // First, group selected sell transactions by asset
    const sellsByAsset: Record<string, TableTransaction[]> = {};
    
    selectedSellTransactions.forEach(sellId => {
      const sellTransaction = sellTransactions.find(tx => tx.id === sellId);
      if (!sellTransaction) return;
      
      if (!sellsByAsset[sellTransaction.asset]) {
        sellsByAsset[sellTransaction.asset] = [];
      }
      
      sellsByAsset[sellTransaction.asset].push(sellTransaction);
    });
    
    // Now process each sell with awareness of other sells of the same asset
    selectedSellTransactions.forEach((sellId) => {
      const sellTransaction = sellTransactions.find(tx => tx.id === sellId);
      
      if (!sellTransaction) return;
      
      // Get the buy transactions associated with this sell
      const buyIds = sellToBuyTransactions[sellId] || [];
      const allBuyTransactions: TableTransaction[] = [];
      
      // Get all buy transactions from the cache
      Object.values(buyTransactionCache).forEach(txList => {
        allBuyTransactions.push(...txList);
      });
      
      // Get available buy transactions for this asset
      const assetBuyTransactions = buyTransactionCache[sellTransaction.asset] || [];
      
      // Get other sells of the same asset (excluding this one)
      const otherSellsOfSameAsset = sellsByAsset[sellTransaction.asset]
        .filter(tx => tx.id !== sellId);
      
      // Filter to just the ones associated with this sell
      const associatedBuyTransactions = allBuyTransactions.filter(
        tx => buyIds.includes(tx.id)
      );
      
      // Calculate profit
      const buyTotal = associatedBuyTransactions.reduce(
        (sum, tx) => sum + tx.total, 0
      );
      const profitAmount = sellTransaction.total - buyTotal;
      
      // Get the tax method for this sell
      const taxMethod = taxMethods[sellId] || "FIFO";
      
      // Determine if the sell is complete based on tax method
      const isComplete = isSellComplete(
        sellTransaction, 
        associatedBuyTransactions,
        assetBuyTransactions,
        otherSellsOfSameAsset,
        taxMethod
      );
      
      newSellReportSummaries[sellId] = {
        sellTransactionId: sellId,
        buyTransactionIds: buyIds,
        sellAmountFiat: {
          amount: sellTransaction.total,
          unit: "USD",
        },
        fee: {
          amount: 2.0, // Example fee - should come from actual transaction
          unit: "USD",
        },
        assetAmount: {
          amount: sellTransaction.amount,
          unit: sellTransaction.asset,
        },
        profit: {
          amount: profitAmount,
          unit: "USD",
        },
        timestamp: new Date(sellTransaction.date),
        isComplete: isComplete,
      };
    });
    
    console.log("New sell reports:", newSellReportSummaries);
    setSellReportSummaries(newSellReportSummaries);
  };

  // Sort the sell transactions based on current sort settings
  const sortedSellTransactions = [...sellTransactions].sort((a, b) => {
    let aValue = a[sortKey as keyof typeof a];
    let bValue = b[sortKey as keyof typeof b];

    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: string) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Get buy transactions for the currently selected sell transaction
  const getBuyTransactionsForSell = (sellId: string): TableTransaction[] => {
    const sellTx = sellTransactions.find(tx => tx.id === sellId);
    if (!sellTx) return [];
    
    return buyTransactionCache[sellTx.asset] || [];
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight gradient-bg text-transparent bg-clip-text">Tax</h2>
      </div>
      <div className="mb-6">
        <TaxPageInstructions />
      </div>
      <ReportSummary
        selectedSellTransactions={selectedSellTransactions}
        sellTransactions={sellTransactions}
        sellToBuyTransactions={sellToBuyTransactions}
        taxMethods={taxMethods}
        buyTransactions={Object.values(buyTransactionCache).flat()}
        onGenerateReport={handleGenerateReport}
        taxReports={sellReportSummaries}
      />
      <Card>
        <CardHeader>
          <CardTitle>Unreported Sell Transactions</CardTitle>
          <CardDescription>Configure tax lots for your sell transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("date")}>
                    Date <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("asset")}>
                    Asset <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("amount")}>
                    Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("price")}>
                    Price <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("total")}>
                    Total <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Tax Method</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => toggleSort("term")}>
                    Term <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    Loading sell transactions...
                  </TableCell>
                </TableRow>
              ) : sortedSellTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    No sell transactions found for {TEMP_YEAR}
                  </TableCell>
                </TableRow>
              ) : (
                sortedSellTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSellTransactions.includes(tx.id)}
                        onCheckedChange={() => handleSelectSellTransaction(tx.id)}
                      />
                    </TableCell>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.asset}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>${tx.price.toFixed(2)}</TableCell>
                    <TableCell>${tx.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={taxMethods[tx.id] || "FIFO"}
                        onValueChange={(value) => handleTaxMethodChange(tx.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIFO">FIFO</SelectItem>
                          <SelectItem value="LIFO">LIFO</SelectItem>
                          <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{tx.term}</TableCell>
                    <TableCell>
                      <Button
                        variant={taxMethods[tx.id] === "CUSTOM" ? "default" : "secondary"}
                        onClick={() => handleConfigureClick(tx.id)}
                        disabled={taxMethods[tx.id] !== "CUSTOM"}
                      >
                        Configure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedSellTransaction && (
        <BuyTransactions
          sellTransactionId={selectedSellTransaction}
          asset={sellTransactions.find((tx) => tx.id === selectedSellTransaction)?.asset || ""}
          onSave={handleSaveBuyTransactions}
          initialTaxMethod={taxMethods[selectedSellTransaction] || "FIFO"}
          initialSelectedTransactions={sellToBuyTransactions[selectedSellTransaction] || []}
          // Pass sell transaction details for accurate profit calculations
          sellAmount={sellTransactions.find((tx) => tx.id === selectedSellTransaction)?.amount || 0}
          sellTotal={sellTransactions.find((tx) => tx.id === selectedSellTransaction)?.total || 0}
          sellPrice={sellTransactions.find((tx) => tx.id === selectedSellTransaction)?.price || 0}
        />
      )}
    </div>
  )
}
