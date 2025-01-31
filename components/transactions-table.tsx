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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  type NormalizedTransaction,
  TransactionSource,
  NormalizedTransactionType,
  type ExchangeAmount,
} from "@/models/transactions";

// Mock data
const transactions: NormalizedTransaction[] = [
  {
    id: "1",
    source: TransactionSource.COINBASE_PRO_FILL,
    type: NormalizedTransactionType.BUY,
    transactionAmountFiat: { amount: 1000, unit: "USD" },
    fee: { amount: 10, unit: "USD" },
    assetAmount: { amount: 0.05, unit: "BTC" },
    assetValueFiat: { amount: 990, unit: "USD" },
    timestamp: new Date("2023-06-01T10:00:00Z"),
    timestampText: "2023-06-01 10:00:00",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    notes: "Bought Bitcoin",
    filedWithIRS: false,
  },
  {
    id: "2",
    source: TransactionSource.COINBASE_STANDARD,
    type: NormalizedTransactionType.SELL,
    transactionAmountFiat: { amount: 500, unit: "USD" },
    fee: { amount: 5, unit: "USD" },
    assetAmount: { amount: 0.025, unit: "BTC" },
    assetValueFiat: { amount: 495, unit: "USD" },
    timestamp: new Date("2023-06-02T14:30:00Z"),
    timestampText: "2023-06-02 14:30:00",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    notes: "Sold Bitcoin",
    filedWithIRS: true,
  },
  // Add more mock transactions as needed
];

type SortKey =
  | keyof NormalizedTransaction
  | "transactionAmountFiat.amount"
  | "fee.amount"
  | "assetAmount.amount"
  | "assetValueFiat.amount";

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (transactions.length > 0) {
      console.log(
        "loadData called when transactions already loaded... skipping until a force refresh"
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:90/api/data");
      const newData: NormalizedTransaction[] = await response.json();
      setTransactions(newData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortKey.includes(".")) {
      const [key, subKey] = sortKey.split(".");
      aValue = (a[key as keyof NormalizedTransaction] as ExchangeAmount)[
        subKey as keyof ExchangeAmount
      ];
      bValue = (b[key as keyof NormalizedTransaction] as ExchangeAmount)[
        subKey as keyof ExchangeAmount
      ];
    } else {
      aValue = a[sortKey as keyof NormalizedTransaction];
      bValue = b[sortKey as keyof NormalizedTransaction];
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" onClick={() => toggleSort("timestamp")}>
              Transaction ID <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => toggleSort("timestamp")}>
              Date <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => toggleSort("type")}>
              Type <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => toggleSort("transactionAmountFiat.amount")}
            >
              Amount (Fiat) <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => toggleSort("fee.amount")}>
              Fee <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => toggleSort("assetAmount.amount")}
            >
              Asset Amount <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => toggleSort("assetValueFiat.amount")}
            >
              Asset Value (Fiat) <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => toggleSort("source")}>
              Source <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => toggleSort("filedWithIRS")}>
              Filed with IRS <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTransactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.id}</TableCell>
            <TableCell>{transaction.timestampText}</TableCell>
            <TableCell>{transaction.type}</TableCell>
            <TableCell>{`${transaction.transactionAmountFiat.amount} ${transaction.transactionAmountFiat.unit}`}</TableCell>
            <TableCell>{`${transaction.fee.amount} ${transaction.fee.unit}`}</TableCell>
            <TableCell>{`${transaction.assetAmount.amount} ${transaction.assetAmount.unit}`}</TableCell>
            <TableCell>{`${transaction.assetValueFiat.amount} ${transaction.assetValueFiat.unit}`}</TableCell>
            <TableCell>{transaction.source}</TableCell>
            <TableCell>{transaction.filedWithIRS ? "Yes" : "No"}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() =>
                      navigator.clipboard.writeText(transaction.id)
                    }
                  >
                    Copy transaction ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View details</DropdownMenuItem>
                  <DropdownMenuItem>Edit transaction</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
