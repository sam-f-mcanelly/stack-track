"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { NormalizedTransactionSortKey, NormalizedTransactionType } from "@/models/transactions"
import { fetchTransactions } from "@/app/api/transactions/transactions"
import { convertToTableTransaction, TableTransaction } from "@/lib/utils/tax/transactionConverter"

interface BuyTransactionsProps {
  sellTransactionId: string
  asset: string
  onSave: (sellId: string, buyIds: string[], taxMethod: string) => void
  initialTaxMethod: string
  initialSelectedTransactions: string[]
  // Added props for accurate profit calculations
  sellAmount: number
  sellTotal: number
  sellPrice: number
}

export function BuyTransactions({
  sellTransactionId,
  asset,
  onSave,
  initialTaxMethod,
  initialSelectedTransactions,
  sellAmount,
  sellTotal,
  sellPrice,
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

  useEffect(() => {
    loadBuyTransactions()
  }, [asset, currentPage, pageSize, sortKey, sortOrder])

  useEffect(() => {
    console.log("Setting initial values:", { initialSelectedTransactions, initialTaxMethod })
    setSelectedTransactions(initialSelectedTransactions)
    setTaxMethod(initialTaxMethod) // Still track the tax method internally, but don't show UI for it
  }, [initialSelectedTransactions, initialTaxMethod])

  // Calculate metadata with actual sell transaction data using cached selections
  const [selectedTransactionsCache, setSelectedTransactionsCache] = useState<TableTransaction[]>([])
  
  // Update the cache of selected transactions whenever selections change
  useEffect(() => {
    // When selected transactions change, we need to fetch any that aren't in the current page
    const fetchMissingSelectedTransactions = async () => {
      // First filter out transactions we already have on current page
      const currentPageSelectedTxs = tableTransactions.filter(tx => selectedTransactions.includes(tx.id))
      
      // Keep track of IDs we've found on the current page
      const foundIds = new Set(currentPageSelectedTxs.map(tx => tx.id))
      
      // Find IDs that need to be fetched
      const missingIds = selectedTransactions.filter(id => !foundIds.has(id))
      
      if (missingIds.length === 0) {
        // All selected transactions are on the current page
        setSelectedTransactionsCache(currentPageSelectedTxs)
        return
      }
      
      // We need to fetch the missing transactions
      try {
        // For each missing ID, we would ideally fetch it individually
        // But for simplicity's sake, we'll fetch all transactions for this asset
        // In a real app you might want a more efficient solution with a specific endpoint
        const result = await fetchTransactions({
          page: 1,
          pageSize: 1000, // Large number to hopefully get all transactions
          sortBy: "timestamp",
          sortOrder: "asc",
          assets: [asset],
          types: [NormalizedTransactionType.BUY]
        })
        
        const convertedTransactions = result.data.map(tx => {
          const tableTx = convertToTableTransaction(tx)
          tableTx.taxMethod = taxMethod
          return tableTx
        })
        
        // Filter down to just the missing transactions
        const fetchedMissingTxs = convertedTransactions.filter(tx => missingIds.includes(tx.id))
        
        // Combine with the current page selections
        setSelectedTransactionsCache([...currentPageSelectedTxs, ...fetchedMissingTxs])
      } catch (error) {
        console.error("Error fetching missing selected transactions:", error)
        // At least use what we have on the current page
        setSelectedTransactionsCache(currentPageSelectedTxs)
      }
    }
    
    fetchMissingSelectedTransactions()
  }, [selectedTransactions, tableTransactions, asset])

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

  // Calculate metadata with actual sell transaction data
  const selectedTxs = selectedTransactionsCache
  
  // Cost basis: total cost of the buy transactions
  const totalBuyAmount = selectedTxs.reduce((sum, tx) => sum + tx.total, 0)
  
  // Total asset amount purchased from selected buy transactions
  const totalBuyAssetAmount = selectedTxs.reduce((sum, tx) => sum + tx.amount, 0)
  
  // Calculate weighted average buy price if there are selected transactions
  const avgBuyPrice = totalBuyAssetAmount > 0 ? totalBuyAmount / totalBuyAssetAmount : 0
  
  // Calculate profit based on sell price and avg buy price
  const profit = sellTotal - totalBuyAmount
  
  // Calculate profit percentage based on cost basis
  const profitPercentage = totalBuyAmount > 0 ? (profit / totalBuyAmount) * 100 : 0
  
  // Determine if all selected transactions are long term
  const isLongTerm = selectedTxs.length > 0 ? selectedTxs.every((tx) => tx.term === "Long Term") : false
  
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Calculate coverage percentage - how much of the sell amount is covered by selected buys
  const coveragePercentage = (totalBuyAssetAmount / sellAmount) * 100
  const isCoverageComplete = totalBuyAssetAmount >= sellAmount

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
          <p>
            Coverage: {coveragePercentage.toFixed(2)}% 
            {!isCoverageComplete && (
              <span className="text-red-500 ml-2">
                (Need {(sellAmount - totalBuyAssetAmount).toFixed(6)} more {asset})
              </span>
            )}
          </p>
          <p>Tax Filing: {isLongTerm ? "Long Term" : "Short Term"}</p>
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
