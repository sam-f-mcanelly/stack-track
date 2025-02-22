"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BuyTransactions } from "@/components/buy-transactions"
import type { SellReportSummary } from "@/models/tax"
import { type NormalizedTransaction, NormalizedTransactionType, TransactionSource } from "@/models/transactions"
import { convertToTableTransaction } from "@/utils/transactionConverter"
import { ReportSummary } from "@/components/report-summary"
import { ArrowUpDown } from "lucide-react"
import { TaxPageInstructions } from "@/components/tax-page-instructions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data - replace with actual API call
const mockTransactions: NormalizedTransaction[] = [
  {
    id: "1",
    source: TransactionSource.COINBASE_PRO_FILL,
    type: NormalizedTransactionType.BUY,
    transactionAmountFiat: { amount: 28000, unit: "USD" },
    fee: { amount: 28, unit: "USD" },
    assetAmount: { amount: 1, unit: "BTC" },
    assetValueFiat: { amount: 28000, unit: "USD" },
    timestamp: new Date("2024-03-15T12:00:00Z"),
    timestampText: "2024-03-15 12:00:00",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    notes: "Bought 1 BTC",
    filedWithIRS: false,
  },
  {
    id: "2",
    source: TransactionSource.COINBASE_STANDARD,
    type: NormalizedTransactionType.BUY,
    transactionAmountFiat: { amount: 3600, unit: "USD" },
    fee: { amount: 3.6, unit: "USD" },
    assetAmount: { amount: 2, unit: "ETH" },
    assetValueFiat: { amount: 3600, unit: "USD" },
    timestamp: new Date("2024-04-20T14:30:00Z"),
    timestampText: "2024-04-20 14:30:00",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    notes: "Bought 2 ETH",
    filedWithIRS: false,
  },
  {
    id: "3",
    source: TransactionSource.COINBASE_PRO_FILL,
    type: NormalizedTransactionType.SELL,
    transactionAmountFiat: { amount: 15000, unit: "USD" },
    fee: { amount: 15, unit: "USD" },
    assetAmount: { amount: 0.5, unit: "BTC" },
    assetValueFiat: { amount: 15000, unit: "USD" },
    timestamp: new Date("2024-05-10T09:45:00Z"),
    timestampText: "2024-05-10 09:45:00",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    notes: "Sold 0.5 BTC",
    filedWithIRS: false,
  },
  {
    id: "4",
    source: TransactionSource.STRIKE_MONTHLY,
    type: NormalizedTransactionType.SELL,
    transactionAmountFiat: { amount: 2200, unit: "USD" },
    fee: { amount: 2.2, unit: "USD" },
    assetAmount: { amount: 1, unit: "ETH" },
    assetValueFiat: { amount: 2200, unit: "USD" },
    timestamp: new Date("2024-06-12T16:20:00Z"),
    timestampText: "2024-06-12 16:20:00",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    notes: "Sold 1 ETH",
    filedWithIRS: false,
  },
  {
    id: "11",
    source: TransactionSource.COINBASE_PRO_FILL,
    type: NormalizedTransactionType.BUY,
    transactionAmountFiat: { amount: 28000, unit: "USD" },
    fee: { amount: 28, unit: "USD" },
    assetAmount: { amount: 1, unit: "BTC" },
    assetValueFiat: { amount: 28000, unit: "USD" },
    timestamp: new Date("2024-03-15T12:00:00Z"),
    timestampText: "2024-03-15 12:00:00",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    notes: "Bought 1 BTC",
    filedWithIRS: false,
  },
  {
    id: "12",
    source: TransactionSource.COINBASE_STANDARD,
    type: NormalizedTransactionType.BUY,
    transactionAmountFiat: { amount: 3600, unit: "USD" },
    fee: { amount: 3.6, unit: "USD" },
    assetAmount: { amount: 2, unit: "ETH" },
    assetValueFiat: { amount: 3600, unit: "USD" },
    timestamp: new Date("2024-04-20T14:30:00Z"),
    timestampText: "2024-04-20 14:30:00",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    notes: "Bought 2 ETH",
    filedWithIRS: false,
  },
  {
    id: "13",
    source: TransactionSource.COINBASE_PRO_FILL,
    type: NormalizedTransactionType.BUY,
    transactionAmountFiat: { amount: 15000, unit: "USD" },
    fee: { amount: 15, unit: "USD" },
    assetAmount: { amount: 0.5, unit: "BTC" },
    assetValueFiat: { amount: 15000, unit: "USD" },
    timestamp: new Date("2024-05-10T09:45:00Z"),
    timestampText: "2024-05-10 09:45:00",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    notes: "Sold 0.5 BTC",
    filedWithIRS: false,
  },
  {
    id: "14",
    source: TransactionSource.STRIKE_MONTHLY,
    type: NormalizedTransactionType.BUY,
    transactionAmountFiat: { amount: 2200, unit: "USD" },
    fee: { amount: 2.2, unit: "USD" },
    assetAmount: { amount: 1, unit: "ETH" },
    assetValueFiat: { amount: 2200, unit: "USD" },
    timestamp: new Date("2024-06-12T16:20:00Z"),
    timestampText: "2024-06-12 16:20:00",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    notes: "Sold 1 ETH",
    filedWithIRS: false,
  },
]

export default function TaxPage() {
  const [sellTransactions, setSellTransactions] = useState<ReturnType<typeof convertToTableTransaction>[]>([])
  const [selectedSellTransaction, setSelectedSellTransaction] = useState<string | null>(null)
  const [sellToBuyTransactions, setSellToBuyTransactions] = useState<Record<string, string[]>>({})
  const [taxMethods, setTaxMethods] = useState<Record<string, string>>({})
  const [selectedSellTransactions, setSelectedSellTransactions] = useState<string[]>([])
  const [buyTransactions, setBuyTransactions] = useState<ReturnType<typeof convertToTableTransaction>[]>([])
  const [sortKey, setSortKey] = useState<string>("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  // TODO: migrate other states to this
  const [sellReportSummaries, setSellReportSummaries] = useState<Record<string, SellReportSummary>>({})

  useEffect(() => {
    console.log("Initializing transactions...")
    // In a real application, this would be an API call
    const filteredSellTransactions = mockTransactions.filter((tx) => tx.type === NormalizedTransactionType.SELL)
    const convertedSellTransactions = filteredSellTransactions.map(convertToTableTransaction)
    setSellTransactions(convertedSellTransactions)
    setTaxMethods(Object.fromEntries(convertedSellTransactions.map((tx) => [tx.id, tx.taxMethod])))

    const filteredBuyTransactions = mockTransactions.filter((tx) => tx.type === NormalizedTransactionType.BUY)
    const convertedBuyTransactions = filteredBuyTransactions.map(convertToTableTransaction)
    setBuyTransactions(convertedBuyTransactions)
  }, [])

  useEffect(() => {
    console.log("sellTransactions updated:", sellTransactions)
  }, [sellTransactions])

  useEffect(() => {
    console.log("buyTransactions updated:", buyTransactions)
  }, [buyTransactions])

  useEffect(() => {
    console.log("taxMethods updated:", taxMethods)
  }, [taxMethods])

  useEffect(() => {
    console.log("selectedSellTransactions updated:", selectedSellTransactions)
  }, [selectedSellTransactions])

  const handleConfigureClick = (id: string) => {
    setSelectedSellTransaction(id === selectedSellTransaction ? null : id)
  }

  const handleSaveBuyTransactions = (sellId: string, buyIds: string[], taxMethod: string) => {
    console.log(`Updating for sellId: ${sellId}, buyIds:`, buyIds, "taxMethod:", taxMethod)
    console.log("Before update - sellToBuyTransactions:", sellToBuyTransactions)
    console.log(`Updating for sellId: ${sellId}, buyIds:`, buyIds)
    setSellToBuyTransactions((prev) => {
      const updated = { ...prev, [sellId]: buyIds }
      console.log("After update - sellToBuyTransactions:", updated)
      return updated
    })
    setTaxMethods((prev) => ({ ...prev, [sellId]: taxMethod }))
  }

  const handleTaxMethodChange = (sellId: string, method: string) => {
    setTaxMethods((prev) => ({ ...prev, [sellId]: method }))
  }

  const handleSelectSellTransaction = (id: string) => {
    setSelectedSellTransactions((prev) => (prev.includes(id) ? prev.filter((txId) => txId !== id) : [...prev, id]))
  }

  const handleGenerateReport = async () => {
    console.log("Generating report with data:", sellReportSummaries)
    try {
      const response = await fetch("/api/generate-tax-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.values(sellReportSummaries)),
      })

      if (!response.ok) {
        throw new Error("Failed to generate tax report")
      }

      const result = await response.json()
      console.log("Tax report generated:", result)
      // Here you would typically update the UI to show the new report
    } catch (error) {
      console.error("Error generating tax report:", error)
      // Here you would typically show an error message to the user
    }
  }

  useEffect(() => {
    console.log("sellToBuyTransactions updated:", sellToBuyTransactions)
  }, [sellToBuyTransactions])

  useEffect(() => {
    updateSellReportSummaries()
  }, [selectedSellTransactions, sellToBuyTransactions, taxMethods, sellTransactions])

  const updateSellReportSummaries = () => {
    console.log("Updating sell reports...")
    const newSellReportSummaries: Record<string, SellReportSummary> = {}
    selectedSellTransactions.forEach((sellId) => {
      newSellReportSummaries[sellId] = {
        sellTransactionId: sellId,
        buyTransactionIds: sellToBuyTransactions[sellId],
        sellAmountFiat: {
          amount: 50000.0,
          unit: "USD",
        },
        fee: {
          amount: 2.0,
          unit: "USD",
        },
        assetAmount: {
          amount: 1.0,
          unit: "BTC",
        },
        profit: {
          amount: 20000.0,
          unit: "USD",
        },
        timestamp: new Date(),
        isComplete: sellId == "3",
      }
    })
    console.log("New sell reports:", newSellReportSummaries)
    setSellReportSummaries(newSellReportSummaries)
  }

  useEffect(() => {
    console.log("SellReportSummaries updated:", sellReportSummaries)
  }, [sellReportSummaries])

  const sortedSellTransactions = [...sellTransactions].sort((a, b) => {
    let aValue = a[sortKey as keyof typeof a]
    let bValue = b[sortKey as keyof typeof b]

    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const toggleSort = (key: string) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

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
        buyTransactions={buyTransactions}
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
              {sortedSellTransactions.map((tx) => (
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
              ))}
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
        />
      )}
    </div>
  )
}

