"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { NormalizedTransactionSortKey, NormalizedTransactionType } from "@/models/transactions"
import { fetchTransactions } from "@/api/transactions/transactions"
import { convertToTableTransaction } from "@/lib/utils/transactionConverter"

interface TableTransaction {
  id: string
  date: string
  source: string
  asset: string
  amount: number
  price: number
  total: number
  taxMethod: string
  term: string
}

interface BuyTransactionsProps {
  sellTransactionId: string
  asset: string
  onSave: (sellId: string, buyIds: string[], taxMethod: string) => void
  initialTaxMethod: string
  initialSelectedTransactions: string[]
}

export function BuyTransactions({
  sellTransactionId,
  asset,
  onSave,
  initialTaxMethod,
  initialSelectedTransactions,
}: BuyTransactionsProps): JSX.Element {
  const [taxMethod, setTaxMethod] = useState<string>(initialTaxMethod)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>(initialSelectedTransactions)
  const [tableTransactions, setTableTransactions] = useState<TableTransaction[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const pageSize = 5 // Show 5 transactions at a time
  
  // Sorting states
  const [sortKey, setSortKey] = useState<NormalizedTransactionSortKey>("timestamp")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Sell transaction data (mock - replace with real data)
  const sellTransaction = { total: 15000 } // Mock sell transaction data

  useEffect(() => {
    loadBuyTransactions()
  }, [asset, currentPage, pageSize, sortKey, sortOrder])

  useEffect(() => {
    console.log("Setting initial values:", { initialSelectedTransactions, initialTaxMethod })
    setSelectedTransactions(initialSelectedTransactions)
    setTaxMethod(initialTaxMethod)
  }, [initialSelectedTransactions, initialTaxMethod])

  useEffect(() => {
    console.log("selectedTransactions updated:", selectedTransactions)
  }, [selectedTransactions])

  const loadBuyTransactions = async (): Promise<void> => {
    setIsLoading(true)
    try {
      // Load transactions with fixed filters for BUY transaction type and specified asset
      const result = await fetchTransactions({
        page: currentPage,
        pageSize: pageSize,
        sortBy: sortKey,
        sortOrder: sortOrder,
        assets: [asset], // Filter by the specific asset
        types: [NormalizedTransactionType.BUY] // Only get BUY transactions
      })
      
      // Convert normalized transactions to TableTransaction format
      const convertedTransactions = result.data.map(tx => {
        const tableTx = convertToTableTransaction(tx);
        tableTx.taxMethod = taxMethod; // Set the current tax method
        return tableTx;
      })
      
      setTableTransactions(convertedTransactions)
      setTotalItems(result.total)
    } catch (error) {
      console.error("Error loading buy transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckboxChange = (id: string): void => {
    console.log("Before update - selectedTransactions:", selectedTransactions)
    console.log(`Toggling transaction: ${id}`)
    const updatedSelectedTransactions = selectedTransactions.includes(id)
      ? selectedTransactions.filter((txId) => txId !== id)
      : [...selectedTransactions, id]
    console.log("After update - selectedTransactions:", updatedSelectedTransactions)
    setSelectedTransactions(updatedSelectedTransactions)
    onSave(sellTransactionId, updatedSelectedTransactions, taxMethod)
  }

  const toggleSort = (key: NormalizedTransactionSortKey): void => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const handlePreviousPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = (): void => {
    const totalPages = Math.ceil(totalItems / pageSize)
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Calculate metadata
  const selectedTxs = tableTransactions.filter((tx) => selectedTransactions.includes(tx.id))
  const totalBuyAmount = selectedTxs.reduce((sum, tx) => sum + tx.total, 0)
  const profit = sellTransaction.total - totalBuyAmount
  const profitPercentage = totalBuyAmount > 0 ? (profit / totalBuyAmount) * 100 : 0
  const isLongTerm = selectedTxs.length > 0 ? selectedTxs.every((tx) => tx.term === "Long Term") : false
  const totalPages = Math.ceil(totalItems / pageSize)

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
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("timestamp")} className="text-xs">
                  Date <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("source")} className="text-xs">
                  Source <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("assetAmount.amount")} className="text-xs">
                  Amount <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("assetValueFiat.amount")} className="text-xs">
                  Price <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort("transactionAmountFiat.amount")} className="text-xs">
                  Total <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Term</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">Loading transactions...</TableCell>
              </TableRow>
            ) : tableTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No buy transactions found for {asset}</TableCell>
              </TableRow>
            ) : (
              tableTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTransactions.includes(tx.id)}
                      onCheckedChange={() => handleCheckboxChange(tx.id)}
                    />
                  </TableCell>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{tx.source}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>${tx.price.toFixed(2)}</TableCell>
                  <TableCell>${tx.total.toFixed(2)}</TableCell>
                  <TableCell>{tx.term}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Showing {tableTransactions.length} of {totalItems} transactions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="text-xs"
            >
              <ChevronLeft className="h-3 w-3 mr-1" />
              Previous
            </Button>
            <div className="text-xs">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="text-xs"
            >
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
