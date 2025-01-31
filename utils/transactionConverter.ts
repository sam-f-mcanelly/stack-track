import { type NormalizedTransaction, NormalizedTransactionType, ExchangeAmount } from "../models/transactions"

interface TableTransaction {
  id: string
  date: string
  asset: string
  amount: number
  price: number
  total: number
  taxMethod: string
  term: string
}

interface BuyTransaction {
  id: number
  date: string
  amount: number
  price: number
  total: number
  isShortTerm: boolean
}

export function convertToTableTransaction(transaction: NormalizedTransaction): TableTransaction {
  const isBuy = transaction.type === NormalizedTransactionType.BUY
  const isSell = transaction.type === NormalizedTransactionType.SELL

  if (!isBuy && !isSell) {
    throw new Error("Only BUY and SELL transactions can be converted to table transactions")
  }

  const amount = transaction.assetAmount.amount
  const price = transaction.assetValueFiat.amount / amount
  const total = transaction.transactionAmountFiat.amount

  return {
    id: transaction.id,
    date: transaction.timestampText,
    asset: transaction.assetAmount.unit,
    amount,
    price,
    total,
    taxMethod: "FIFO", // Default tax method, can be updated later
    term: getTermFromTimestamp(transaction.timestamp),
  }
}

function getTermFromTimestamp(timestamp: Date): string {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  return timestamp < oneYearAgo ? "Long Term" : "Short Term"
}

export function convertToBuyTransaction(transaction: NormalizedTransaction): BuyTransaction {
  if (transaction.type !== NormalizedTransactionType.BUY) {
    throw new Error("Only BUY transactions can be converted to BuyTransaction")
  }

  const tableTransaction = convertToTableTransaction(transaction)

  return {
    id: Number.parseInt(tableTransaction.id),
    date: tableTransaction.date,
    amount: tableTransaction.amount,
    price: tableTransaction.price,
    total: tableTransaction.total,
    isShortTerm: tableTransaction.term === "Short Term",
  }
}

