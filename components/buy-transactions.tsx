"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type NormalizedTransaction, NormalizedTransactionType, TransactionSource } from "@/models/transactions"
import { convertToBuyTransaction } from "@/utils/transactionConverter"

interface BuyTransaction {
  id: number
  date: string
  amount: number
  price: number
  total: number
  isShortTerm: boolean
}

interface BuyTransactionsProps {
  sellTransactionId: string
  asset: string
  onSave: (sellId: string, buyIds: string[], taxMethod: string) => void
  initialTaxMethod: string
  initialSelectedTransactions: string[]
}

// Mock data - replace with actual API call
const mockTransactions: NormalizedTransaction[] = [
  //Example Mock Data - Replace with your actual mock data
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
    exchange: "Coinbase Pro",
    orderId: "cb-1234567890",
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
    exchange: "Coinbase",
    orderId: "cb-0987654321",
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
    exchange: "Coinbase Pro",
    orderId: "cb-2468101214",
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
    exchange: "Strike",
    orderId: "st-1357924680",
  },
]

export function BuyTransactions({
  sellTransactionId,
  asset,
  onSave,
  initialTaxMethod,
  initialSelectedTransactions,
}: BuyTransactionsProps) {
  const [taxMethod, setTaxMethod] = useState(initialTaxMethod)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(initialSelectedTransactions)
  const [buyTransactions, setBuyTransactions] = useState<BuyTransaction[]>([])

  useEffect(() => {
    // In a real application, this would be an API call
    const filteredTransactions = mockTransactions.filter(
      (tx) => tx.type === NormalizedTransactionType.BUY && tx.assetAmount.unit === asset,
    )
    const convertedTransactions = filteredTransactions.map(convertToBuyTransaction)
    setBuyTransactions(convertedTransactions)
  }, [asset])

  useEffect(() => {
    console.log("Setting initial values:", { initialSelectedTransactions, initialTaxMethod })
    setSelectedTransactions(initialSelectedTransactions)
    setTaxMethod(initialTaxMethod)
  }, [initialSelectedTransactions, initialTaxMethod])

  useEffect(() => {
    console.log("selectedTransactions updated:", selectedTransactions)
  }, [selectedTransactions])

  const handleCheckboxChange = (id: string) => {
    console.log("Before update - selectedTransactions:", selectedTransactions)
    console.log(`Toggling transaction: ${id}`)
    const updatedSelectedTransactions = selectedTransactions.includes(id)
      ? selectedTransactions.filter((txId) => txId !== id)
      : [...selectedTransactions, id]
    console.log("After update - selectedTransactions:", updatedSelectedTransactions)
    setSelectedTransactions(updatedSelectedTransactions)
    onSave(sellTransactionId, updatedSelectedTransactions, taxMethod)
  }

  // Calculate metadata
  const selectedTxs = buyTransactions.filter((tx) => selectedTransactions.includes(tx.id.toString()))
  const totalBuyAmount = selectedTxs.reduce((sum, tx) => sum + tx.total, 0)
  const sellTransaction = { total: 15000 } // Mock sell transaction data - replace with actual data
  const profit = sellTransaction.total - totalBuyAmount
  const profitPercentage = (profit / totalBuyAmount) * 100
  const isLongTerm = selectedTxs.every((tx) => !tx.isShortTerm)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Buy Transactions for {asset}</CardTitle>
            <CardDescription>
              Select buy transactions to match with sell transaction #{sellTransactionId}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-2">
          <p>
            Profit: ${profit.toFixed(2)} ({profitPercentage.toFixed(2)}%)
          </p>
          <p>Tax Filing: {isLongTerm ? "Long Term" : "Short Term"}</p>
          <div className="flex items-center space-x-2">
            <label htmlFor="tax-method">Tax Method:</label>
            <Select
              value={taxMethod}
              onValueChange={(value) => {
                setTaxMethod(value)
                onSave(sellTransactionId, selectedTransactions, value)
              }}
            >
              <SelectTrigger id="tax-method" className="w-[180px]">
                <SelectValue placeholder="Select tax method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIFO">FIFO</SelectItem>
                <SelectItem value="LIFO">LIFO</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Select</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Term</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {buyTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTransactions.includes(tx.id.toString())}
                    onCheckedChange={() => handleCheckboxChange(tx.id.toString())}
                  />
                </TableCell>
                <TableCell>{tx.date}</TableCell>
                <TableCell>{tx.amount}</TableCell>
                <TableCell>${tx.price.toFixed(2)}</TableCell>
                <TableCell>${tx.total.toFixed(2)}</TableCell>
                <TableCell>{tx.isShortTerm ? "Short Term" : "Long Term"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

