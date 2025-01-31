import type { ExtendedTransaction } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TransactionDetailsProps {
  transactions: ExtendedTransaction[]
}

export function TransactionDetails({ transactions }: TransactionDetailsProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Tax Lot Relations</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.type}</TableCell>
            <TableCell>{`${transaction.assetAmount.amount} ${transaction.assetAmount.unit}`}</TableCell>
            <TableCell>{`$${transaction.transactionAmountFiat.amount.toFixed(2)}`}</TableCell>
            <TableCell>{transaction.timestampText}</TableCell>
            <TableCell>
              {transaction.taxLotRelations ? (
                <ul>
                  {transaction.taxLotRelations.map((relation) => (
                    <li key={`${relation.buyTransactionId}-${relation.sellTransactionId}`}>
                      {`Buy ${relation.buyTransactionId}: ${relation.amount} ${transaction.assetAmount.unit}`}
                    </li>
                  ))}
                </ul>
              ) : (
                "N/A"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

