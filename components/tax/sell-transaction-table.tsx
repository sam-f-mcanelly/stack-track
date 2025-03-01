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
        <Badge variant="outline" className="ml-1 p-0 h-5 w-5 flex items-center justify-center">
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

  // Get term badge
  const getTermBadge = (term: string) => {
    if (term === "Long Term") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Long Term
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Short Term
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[40px] text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="sr-only">Select</span>
                    <Checkbox className="opacity-0" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select transactions for tax reporting</p>
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
                  sortKey === "date" ? "text-slate-900" : "text-slate-600"
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
                  sortKey === "asset" ? "text-slate-900" : "text-slate-600"
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
                  sortKey === "amount" ? "text-slate-900" : "text-slate-600"
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
                  sortKey === "price" ? "text-slate-900" : "text-slate-600"
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
                  sortKey === "total" ? "text-slate-900" : "text-slate-600"
                )}
              >
                <DollarSign className="h-3.5 w-3.5 mr-1 inline-block" />
                Total {getSortIcon("total")}
              </Button>
            </TableHead>
            <TableHead>
              <div className="text-xs font-medium flex items-center text-slate-600">
                <Settings className="h-3.5 w-3.5 mr-1 inline-block" />
                Tax Method
              </div>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onToggleSort("term")}
                className={cn(
                  "p-1 h-auto text-xs font-medium flex items-center",
                  sortKey === "term" ? "text-slate-900" : "text-slate-600"
                )}
              >
                <Clock className="h-3.5 w-3.5 mr-1 inline-block" />
                Term {getSortIcon("term")}
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">
              <span className="text-xs font-medium text-slate-600">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24">
                <div className="flex flex-col items-center justify-center text-center py-6 space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                  <p className="text-sm text-slate-600">Loading transactions...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-slate-600 font-medium">No sell transactions found</p>
                  <p className="text-sm text-slate-500">There are no unreported sell transactions for {year}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id} className={cn(
                selectedTransactions.includes(tx.id) ? "bg-green-50" : "",
                "hover:bg-slate-50 transition-colors"
              )}>
                <TableCell className="py-2">
                  <Checkbox
                    checked={selectedTransactions.includes(tx.id)}
                    onCheckedChange={() => onSelectTransaction(tx.id)}
                    className={selectedTransactions.includes(tx.id) ? "border-green-500 text-green-500" : ""}
                  />
                </TableCell>
                <TableCell className="py-2 font-medium text-sm">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell className="py-2">
                  <Badge variant="outline" className="font-medium">
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
                    <SelectTrigger className="w-[90px] h-8 text-xs">
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
                      <SelectItem value="CUSTOM" className="text-xs">
                        <div className="flex items-center">
                          <CustomIcon className="h-3 w-3 mr-1" />
                          CUSTOM
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="py-2">
                  {getTermBadge(tx.term)}
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
                        ? "bg-green-600 hover:bg-green-700"
                        : "text-slate-500"
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
