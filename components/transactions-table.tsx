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
} from "lucide-react";
import { NormalizedTransactionSortKey, type NormalizedTransaction } from "@/models/transactions";

interface PaginationResponse {
  data: NormalizedTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [sortKey, setSortKey] = useState<NormalizedTransactionSortKey>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, sortKey, sortOrder]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://192.168.68.75:3090/api/data/transactions?page=${currentPage}&pageSize=${pageSize}&sortBy=${sortKey}&sortOrder=${sortOrder}`
      );
      const result: PaginationResponse = await response.json();
      setTransactions(result.data);
      setTotalItems(result.total);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSort = (key: NormalizedTransactionSortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4">
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
