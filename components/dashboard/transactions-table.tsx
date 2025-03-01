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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  ClipboardCopy,
  Eye,
  Edit,
  FileText,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NormalizedTransactionSortKey, NormalizedTransaction, NormalizedTransactionType } from "@/lib/models/transactions";
import { 
  fetchTransactions, 
  TRANSACTION_TYPES, 
  ASSET_TYPES, 
  PaginationResponse
} from "@/app/api/transactions/transactions";
import { formatValue } from "@/lib/utils/formatter";

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

  // Get sort icon with appropriate direction
  const getSortIcon = (key: string) => {
    if (sortKey === key) {
      return (
        <Badge variant="outline" className="ml-1 p-0 h-5 w-5 flex items-center justify-center dark:border-gray-600">
          {sortOrder === "asc" ? "↑" : "↓"}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <div className="flex space-x-2">
          {/* Asset Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-8 px-2 flex items-center">
                <Tag className="mr-1 h-3.5 w-3.5" />
                Assets <Filter className="ml-1 h-3.5 w-3.5" />
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
              <Button variant="outline" size="sm" className="text-xs h-8 px-2 flex items-center">
                <FileText className="mr-1 h-3.5 w-3.5" />
                Types <Filter className="ml-1 h-3.5 w-3.5" />
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
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-8 px-2 flex items-center" 
            onClick={() => loadData()}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="text-xs w-[200px]">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("id")} 
                  className={cn(
                    "p-1 h-auto text-xs font-medium flex items-center",
                    sortKey === "id" 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <FileText className="h-3.5 w-3.5 mr-1 inline-block" />
                  Transaction ID {getSortIcon("id")}
                </Button>
              </TableHead>
              <TableHead className="text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("timestamp")} 
                  className={cn(
                    "p-1 h-auto text-xs font-medium flex items-center",
                    sortKey === "timestamp" 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5 mr-1 inline-block" />
                  Date {getSortIcon("timestamp")}
                </Button>
              </TableHead>
              <TableHead className="text-xs w-[80px]">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("type")} 
                  className={cn(
                    "p-1 h-auto text-xs font-medium flex items-center",
                    sortKey === "type" 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Tag className="h-3.5 w-3.5 mr-1 inline-block" />
                  Type {getSortIcon("type")}
                </Button>
              </TableHead>
              <TableHead className="text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("transactionAmountFiat.amount")} 
                  className={cn(
                    "p-1 h-auto text-xs font-medium flex items-center",
                    sortKey === "transactionAmountFiat.amount" 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <DollarSign className="h-3.5 w-3.5 mr-1 inline-block" />
                  Amount (Fiat) {getSortIcon("transactionAmountFiat.amount")}
                </Button>
              </TableHead>
              <TableHead className="text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("fee.amount")} 
                  className={cn(
                    "p-1 h-auto text-xs font-medium flex items-center",
                    sortKey === "fee.amount" 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <DollarSign className="h-3.5 w-3.5 mr-1 inline-block" />
                  Fee {getSortIcon("fee.amount")}
                </Button>
              </TableHead>
              <TableHead className="text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("assetAmount.amount")} 
                  className={cn(
                    "p-1 h-auto text-xs font-medium flex items-center",
                    sortKey === "assetAmount.amount" 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Tag className="h-3.5 w-3.5 mr-1 inline-block" />
                  Asset Amount {getSortIcon("assetAmount.amount")}
                </Button>
              </TableHead>
              <TableHead className="text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("assetValueFiat.amount")} 
                  className={cn(
                    "p-1 h-auto text-xs font-medium flex items-center",
                    sortKey === "assetValueFiat.amount" 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <DollarSign className="h-3.5 w-3.5 mr-1 inline-block" />
                  Asset Value (Fiat) {getSortIcon("assetValueFiat.amount")}
                </Button>
              </TableHead>
              <TableHead className="text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("source")} 
                  className={cn(
                    "p-1 h-auto text-xs font-medium flex items-center",
                    sortKey === "source" 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Tag className="h-3.5 w-3.5 mr-1 inline-block" />
                  Source {getSortIcon("source")}
                </Button>
              </TableHead>
              <TableHead className="text-xs">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleSort("filedWithIRS")} 
                  className={cn(
                    "p-1 h-auto text-xs font-medium flex items-center",
                    sortKey === "filedWithIRS" 
                      ? "text-slate-900 dark:text-slate-100" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <FileText className="h-3.5 w-3.5 mr-1 inline-block" />
                  Filed with IRS {getSortIcon("filedWithIRS")}
                </Button>
              </TableHead>
              <TableHead className="text-xs w-[100px]">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24">
                  <div className="flex flex-col items-center justify-center text-center py-6 space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 dark:border-green-400"></div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Loading transactions...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24">
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">No transactions found</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">Try clearing filters or changing the search criteria</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="text-xs py-2 font-medium">
                    <span className="max-w-[180px] inline-block">{transaction.id}</span>
                  </TableCell>
                  <TableCell className="text-xs py-2 font-medium">
                    {transaction.timestampText}
                  </TableCell>
                  <TableCell className="text-xs py-2 text-center">
                    <Badge variant="outline" className="font-medium dark:border-gray-600">
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">
                    {formatValue(transaction.transactionAmountFiat.amount, transaction.transactionAmountFiat.unit)}
                  </TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">
                    {formatValue(transaction.fee.amount, transaction.fee.unit)}
                  </TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">
                    {formatValue(transaction.assetAmount.amount, transaction.assetAmount.unit)}
                  </TableCell>
                  <TableCell className="text-xs py-2 text-right font-mono">
                    {formatValue(transaction.assetValueFiat.amount, transaction.assetValueFiat.unit)}
                  </TableCell>
                  <TableCell className="text-xs py-2">
                    <Badge variant="outline" className="font-medium dark:border-gray-600">
                      {transaction.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs py-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        transaction.filedWithIRS 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                      )}
                    >
                      {transaction.filedWithIRS ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs py-2">
                    <TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(transaction.id)}
                            className="text-xs flex items-center"
                          >
                            <ClipboardCopy className="h-3.5 w-3.5 mr-2" />
                            Copy transaction ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs flex items-center">
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs flex items-center">
                            <Edit className="h-3.5 w-3.5 mr-2" />
                            Edit transaction
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
            className="text-xs h-8"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <div className="text-xs">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="text-xs h-8"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
