import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableTransaction } from "@/lib/utils/tax/transactionConverter";
import { 
  Clock, 
  History, 
  ArrowUpDown as CustomIcon,
  Settings, 
  Calendar,
  BarChart2,
  DollarSign,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SellTransactionTableProps {
  transactions: TableTransaction[];
  isLoading: boolean;
  year: number;
  selectedTransactions: string[];
  taxMethods: Record<string, string>;
  sortKey: string;
  sortOrder: "asc" | "desc";
  onSelectTransaction: (id: string) => void;
  onTaxMethodChange: (id: string, method: string) => void;
  onConfigureClick: (id: string) => void;
  onToggleSort: (key: string) => void;
  // Optional prop for tax report loading state
  isFetchingTaxReport?: boolean;
  // New prop for selecting all transactions
  onSelectAllTransactions?: (selected: boolean, transactionIds?: string[]) => void;
}

export const SellTransactionTable: React.FC<SellTransactionTableProps> = ({
  transactions,
  isLoading,
  year,
  selectedTransactions,
  taxMethods,
  sortKey,
  sortOrder,
  onSelectTransaction,
  onTaxMethodChange,
  onConfigureClick,
  onToggleSort,
  isFetchingTaxReport = false,
  onSelectAllTransactions
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const totalPages = Math.ceil(transactions.length / pageSize);
  
  // Reset to first page when transactions change
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  // Get current page of transactions
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return transactions.slice(startIndex, endIndex);
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Format numbers for better readability
  const formatNumber = (num: number, decimals: number = 8) => {
    // For very small amounts, show more decimals
    if (Math.abs(num) < 0.01) {
      return num.toFixed(decimals);
    }
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
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

  // Get tax method icon
  const getTaxMethodIcon = (method: string) => {
    switch (method) {
      case "FIFO":
        return <Clock className="h-3 w-3 mr-1" />;
      case "LIFO":
        return <History className="h-3 w-3 mr-1" />;
      case "CUSTOM":
        return <CustomIcon className="h-3 w-3 mr-1" />;
      default:
        return <Clock className="h-3 w-3 mr-1" />;
    }
  };

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Calculate if current page has all items selected
  const isCurrentPageAllSelected = () => {
    const currentItems = getCurrentPageItems();
    return (
      currentItems.length > 0 &&
      currentItems.every(tx => selectedTransactions.includes(tx.id))
    );
  };

  // Select/deselect all transactions on the current page
  const toggleSelectCurrentPage = (selected: boolean) => {
    if (!onSelectAllTransactions) return;
    
    if (selected) {
      // When selecting all on current page, we pass the IDs to add
      const currentItems = getCurrentPageItems();
      const currentIds = currentItems.map(tx => tx.id);
      onSelectAllTransactions(true, currentIds);
    } else {
      // When deselecting all on current page, we pass the IDs to remove
      const currentItems = getCurrentPageItems();
      const currentIds = currentItems.map(tx => tx.id);
      onSelectAllTransactions(false, currentIds);
    }
  };

  // Check if pagination should be shown
  const showPagination = !isLoading && transactions.length > 0;
  const currentItems = getCurrentPageItems();

  return (
    <div className="rounded-lg border dark:border-gray-700 overflow-hidden">
      {/* Show tax report loading state if applicable */}
      {isFetchingTaxReport && selectedTransactions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 text-center text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <span>Calculating tax report...</span>
          </div>
        </div>
      )}
      
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
          <TableRow>
            <TableHead className="w-[40px] text-center p-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center">
                      {!isLoading && currentItems.length > 0 && onSelectAllTransactions && (
                        <Checkbox 
                          checked={isCurrentPageAllSelected()}
                          indeterminate={
                            currentItems.some(tx => selectedTransactions.includes(tx.id)) &&
                            !isCurrentPageAllSelected()
                          }
                          onCheckedChange={(checked) => {
                            toggleSelectCurrentPage(!!checked);
                          }}
                          aria-label="Select all transactions on current page"
                        />
                      )}
                      {(isLoading || currentItems.length === 0 || !onSelectAllTransactions) && (
                        <span className="sr-only">Select</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select all transactions on current page</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleSort("date")}
                className={cn(
                  "p-1 h-auto text-xs font-medium flex items-center",
                  sortKey === "date" 
                    ? "text-slate-900 dark:text-slate-100" 
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <Calendar className="h-3.5 w-3.5 mr-1 inline-block" />
                Date {getSortIcon("date")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleSort("asset")}
                className={cn(
                  "p-1 h-auto text-xs font-medium flex items-center",
                  sortKey === "asset" 
                    ? "text-slate-900 dark:text-slate-100" 
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <Tag className="h-3.5 w-3.5 mr-1 inline-block" />
                Asset {getSortIcon("asset")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleSort("amount")}
                className={cn(
                  "p-1 h-auto text-xs font-medium flex items-center",
                  sortKey === "amount" 
                    ? "text-slate-900 dark:text-slate-100" 
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <BarChart2 className="h-3.5 w-3.5 mr-1 inline-block" />
                Amount {getSortIcon("amount")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleSort("price")}
                className={cn(
                  "p-1 h-auto text-xs font-medium flex items-center",
                  sortKey === "price" 
                    ? "text-slate-900 dark:text-slate-100" 
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <DollarSign className="h-3.5 w-3.5 mr-1 inline-block" />
                Price {getSortIcon("price")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleSort("total")}
                className={cn(
                  "p-1 h-auto text-xs font-medium flex items-center",
                  sortKey === "total" 
                    ? "text-slate-900 dark:text-slate-100" 
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                <DollarSign className="h-3.5 w-3.5 mr-1 inline-block" />
                Total {getSortIcon("total")}
              </Button>
            </TableHead>
            <TableHead className="w-[160px]">
              <div className="text-xs font-medium flex items-center text-slate-600 dark:text-slate-400">
                <Settings className="h-3.5 w-3.5 mr-1 inline-block" />
                Tax Method
              </div>
            </TableHead>
            <TableHead className="w-[100px]">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24">
                <div className="flex flex-col items-center justify-center text-center py-6 space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 dark:border-green-400"></div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading transactions...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">No sell transactions found</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">There are no unreported sell transactions for {year}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            currentItems.map((tx) => (
              <TableRow key={tx.id} className={cn(
                selectedTransactions.includes(tx.id) 
                  ? "bg-green-50 dark:bg-green-900/20" 
                  : "",
                "hover:bg-orange-50 dark:hover:bg-orange-800/50 transition-colors"
              )}>
                <TableCell className="py-2">
                  <Checkbox
                    checked={selectedTransactions.includes(tx.id)}
                    onCheckedChange={() => onSelectTransaction(tx.id)}
                    className={selectedTransactions.includes(tx.id) 
                      ? "border-green-500 text-green-500 dark:border-green-500 dark:text-green-500" 
                      : ""}
                  />
                </TableCell>
                <TableCell className="py-2 font-medium text-sm">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className="font-medium dark:border-gray-600">
                    {tx.asset}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 text-sm text-right font-mono">
                  {formatNumber(tx.amount)}
                </TableCell>
                <TableCell className="py-2 text-sm text-right font-mono">
                  ${formatNumber(tx.price, 2)}
                </TableCell>
                <TableCell className="py-2 text-sm font-medium text-right font-mono">
                  ${formatNumber(tx.total, 2)}
                </TableCell>
                <TableCell className="py-2">
                  <Select
                    value={taxMethods[tx.id] || "FIFO"}
                    onValueChange={(value) => onTaxMethodChange(tx.id, value)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Select method">
                        <div className="flex items-center">
                          {getTaxMethodIcon(taxMethods[tx.id] || "FIFO")}
                          <span>{taxMethods[tx.id] || "FIFO"}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIFO" className="text-xs">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          FIFO
                        </div>
                      </SelectItem>
                      <SelectItem value="LIFO" className="text-xs">
                        <div className="flex items-center">
                          <History className="h-3 w-3 mr-1" />
                          LIFO
                        </div>
                      </SelectItem>
                      <SelectItem value="MAX_PROFIT" className="text-xs">
                        <div className="flex items-center">
                          <CustomIcon className="h-3 w-3 mr-1" />
                          MAX_PROFIT
                        </div>
                      </SelectItem>
                      <SelectItem value="MIN_PROFIT" className="text-xs">
                        <div className="flex items-center">
                          <CustomIcon className="h-3 w-3 mr-1" />
                          MIN_PROFIT
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="py-2">
                  <Button
                    variant={taxMethods[tx.id] === "CUSTOM" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onConfigureClick(tx.id)}
                    disabled={taxMethods[tx.id] !== "CUSTOM"}
                    className={cn(
                      "h-8 text-xs px-2",
                      taxMethods[tx.id] === "CUSTOM" 
                        ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                        : "text-slate-500 dark:text-slate-400 dark:border-slate-600"
                    )}
                  >
                    <Settings className="h-3.5 w-3.5 mr-1" />
                    Configure
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Pagination Controls */}
      {showPagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-gray-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, transactions.length)}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * pageSize, transactions.length)}</span> of{" "}
            <span className="font-medium">{transactions.length}</span> transactions
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-xs font-medium mx-2">
              Page {currentPage} of {totalPages}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
