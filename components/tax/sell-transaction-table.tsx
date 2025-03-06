import React from "react";
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
  onSelectAllTransactions?: (selected: boolean) => void;
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
            <TableHead className="w-[40px] text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center">
                      {!isLoading && transactions.length > 0 && onSelectAllTransactions && (
                        <Checkbox 
                          checked={
                            transactions.length > 0 && 
                            selectedTransactions.length === transactions.length &&
                            selectedTransactions.length > 0
                          }
                          indeterminate={
                            selectedTransactions.length > 0 && 
                            selectedTransactions.length < transactions.length
                          }
                          onCheckedChange={(checked) => {
                            onSelectAllTransactions(!!checked);
                          }}
                          aria-label="Select all transactions"
                        />
                      )}
                      {(isLoading || transactions.length === 0 || !onSelectAllTransactions) && (
                        <span className="sr-only">Select</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select all transactions for tax reporting</p>
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
            transactions.map((tx) => (
              <TableRow key={tx.id} className={cn(
                selectedTransactions.includes(tx.id) 
                  ? "bg-green-50 dark:bg-green-900/20" 
                  : "",
                "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
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
    </div>
  );
};
