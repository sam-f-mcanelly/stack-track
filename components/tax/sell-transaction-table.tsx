import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableTransaction } from "@/lib/utils/transactionConverter";
import { ArrowUpDown } from "lucide-react";

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Select</TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onToggleSort("date")}>
              Date <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onToggleSort("asset")}>
              Asset <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onToggleSort("amount")}>
              Amount <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onToggleSort("price")}>
              Price <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onToggleSort("total")}>
              Total <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Tax Method</TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => onToggleSort("term")}>
              Term <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-6">
              Loading sell transactions...
            </TableCell>
          </TableRow>
        ) : transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-6">
              No sell transactions found for {year}
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                <Checkbox
                  checked={selectedTransactions.includes(tx.id)}
                  onCheckedChange={() => onSelectTransaction(tx.id)}
                />
              </TableCell>
              <TableCell>{tx.date}</TableCell>
              <TableCell>{tx.asset}</TableCell>
              <TableCell>{tx.amount}</TableCell>
              <TableCell>${tx.price.toFixed(2)}</TableCell>
              <TableCell>${tx.total.toFixed(2)}</TableCell>
              <TableCell>
                <Select
                  value={taxMethods[tx.id] || "FIFO"}
                  onValueChange={(value) => onTaxMethodChange(tx.id, value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIFO">FIFO</SelectItem>
                    <SelectItem value="LIFO">LIFO</SelectItem>
                    <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{tx.term}</TableCell>
              <TableCell>
                <Button
                  variant={taxMethods[tx.id] === "CUSTOM" ? "default" : "secondary"}
                  onClick={() => onConfigureClick(tx.id)}
                  disabled={taxMethods[tx.id] !== "CUSTOM"}
                >
                  Configure
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
