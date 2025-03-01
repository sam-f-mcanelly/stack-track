"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { NormalizedTransactionSortKey, NormalizedTransaction, NormalizedTransactionType } from "@/lib/models/transactions";
import { 
  fetchTransactions, 
  TRANSACTION_TYPES, 
  ASSET_TYPES, 
  PaginationResponse
} from "@/app/api/transactions/transactions";

export function TransactionsTable(): JSX.Element {
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [sortKey, setSortKey] = useState<NormalizedTransactionSortKey>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Filter states
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<NormalizedTransactionType[]>([]);

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, sortKey, sortOrder, selectedAssets, selectedTypes]);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result: PaginationResponse = await fetchTransactions({
        page: currentPage,
        pageSize: pageSize,
        sortBy: sortKey,
        sortOrder: sortOrder,
        assets: selectedAssets,
        types: selectedTypes
      });
      
      setTransactions(result.data);
      setTotalItems(result.total);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSort = (key: NormalizedTransactionSortKey): void => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePreviousPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleAssetChange = (asset: string): void => {
    // Toggle selection: add if not present, remove if present
    if (selectedAssets.includes(asset)) {
      setSelectedAssets(selectedAssets.filter(a => a !== asset));
    } else {
      setSelectedAssets([...selectedAssets, asset]);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleTypeChange = (type: NormalizedTransactionType): void => {
    // Toggle selection: add if not present, remove if present
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <div className="flex space-x-2">
          {/* Asset Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                Assets <Filter className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuLabel className="text-xs">Filter by Asset</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ASSET_TYPES.map((asset) => (
                <DropdownMenuItem 
                  key={asset} 
                  className="text-xs flex items-center"
                  onClick={() => handleAssetChange(asset)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedAssets.includes(asset)} 
                    onChange={() => {}} 
                    className="mr-2"
                  />
                  {asset}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Transaction Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                Types <Filter className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuLabel className="text-xs">Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TRANSACTION_TYPES.map((type) => (
                <DropdownMenuItem 
                  key={type} 
                  className="text-xs flex items-center"
                  onClick={() => handleTypeChange(type)}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.includes(type)} 
                    onChange={() => {}} 
                    className="mr-2"
                  />
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">
              <Button variant="ghost" onClick={() => toggleSort("timestamp")} className="text-xs">
                Transaction ID <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-xs">
              <Button variant="ghost" onClick={() => toggleSort("timestamp")} className="text-xs">
                Date <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-xs">
              <Button variant="ghost" onClick={() => toggleSort("type")} className="text-xs">
                Type <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-xs">
              <Button variant="ghost" onClick={() => toggleSort("transactionAmountFiat.amount")} className="text-xs">
                Amount (Fiat) <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-xs">
              <Button variant="ghost" onClick={() => toggleSort("fee.amount")} className="text-xs">
                Fee <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-xs">
              <Button variant="ghost" onClick={() => toggleSort("assetAmount.amount")} className="text-xs">
                Asset Amount <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-xs">
              <Button variant="ghost" onClick={() => toggleSort("assetValueFiat.amount")} className="text-xs">
                Asset Value (Fiat) <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-xs">
              <Button variant="ghost" onClick={() => toggleSort("source")} className="text-xs">
                Source <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-xs">
              <Button variant="ghost" onClick={() => toggleSort("filedWithIRS")} className="text-xs">
                Filed with IRS <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-xs">
                Loading...
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-xs">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-xs">{transaction.id}</TableCell>
                <TableCell className="text-xs">{transaction.timestampText}</TableCell>
                <TableCell className="text-xs">{transaction.type}</TableCell>
                <TableCell className="text-xs">{`${transaction.transactionAmountFiat.amount} ${transaction.transactionAmountFiat.unit}`}</TableCell>
                <TableCell className="text-xs">{`${transaction.fee.amount} ${transaction.fee.unit}`}</TableCell>
                <TableCell className="text-xs">{`${transaction.assetAmount.amount} ${transaction.assetAmount.unit}`}</TableCell>
                <TableCell className="text-xs">{`${transaction.assetValueFiat.amount} ${transaction.assetValueFiat.unit}`}</TableCell>
                <TableCell className="text-xs">{transaction.source}</TableCell>
                <TableCell className="text-xs">{transaction.filedWithIRS ? "Yes" : "No"}</TableCell>
                <TableCell className="text-xs">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-6 w-6 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(transaction.id)}
                        className="text-xs"
                      >
                        Copy transaction ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs">View details</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs">Edit transaction</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-2">
        <div className="text-xs text-gray-500">
          Showing {transactions.length} of {totalItems} transactions
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="text-xs"
          >
            <ChevronLeft className="h-3 w-3" />
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
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
