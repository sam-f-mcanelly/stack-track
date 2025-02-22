import { type NormalizedTransaction, NormalizedTransactionType, TransactionSource } from "@/models/transactions"

export interface TaxLotRelation {
  buyTransactionId: string
  sellTransactionId: string
  amount: number
}

export interface ExtendedTransaction extends NormalizedTransaction {
  taxLotRelations?: TaxLotRelation[]
}

export const mockTransactionData: ExtendedTransaction[] = [
  {
    id: "buy1",
    source: TransactionSource.COINBASE_PRO_FILL,
    type: NormalizedTransactionType.BUY,
    transactionAmountFiat: { amount: 10000, unit: "USD" },
    fee: { amount: 50, unit: "USD" },
    assetAmount: { amount: 0.5, unit: "BTC" },
    assetValueFiat: { amount: 10000, unit: "USD" },
    timestamp: new Date("2023-01-15T10:00:00Z"),
    timestampText: "2023-01-15 10:00:00",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    notes: "Initial BTC purchase",
    filedWithIRS: false,
  },
  {
    id: "buy2",
    source: TransactionSource.COINBASE_PRO_FILL,
    type: NormalizedTransactionType.BUY,
    transactionAmountFiat: { amount: 5000, unit: "USD" },
    fee: { amount: 25, unit: "USD" },
    assetAmount: { amount: 0.2, unit: "BTC" },
    assetValueFiat: { amount: 5000, unit: "USD" },
    timestamp: new Date("2023-02-20T14:30:00Z"),
    timestampText: "2023-02-20 14:30:00",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    notes: "Second BTC purchase",
    filedWithIRS: false,
  },
  {
    id: "sell1",
    source: TransactionSource.COINBASE_PRO_FILL,
    type: NormalizedTransactionType.SELL,
    transactionAmountFiat: { amount: 12000, unit: "USD" },
    fee: { amount: 60, unit: "USD" },
    assetAmount: { amount: 0.4, unit: "BTC" },
    assetValueFiat: { amount: 12000, unit: "USD" },
    timestamp: new Date("2023-05-10T09:15:00Z"),
    timestampText: "2023-05-10 09:15:00",
    address: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    notes: "Partial BTC sale",
    filedWithIRS: false,
    taxLotRelations: [
      { buyTransactionId: "buy1", sellTransactionId: "sell1", amount: 0.3 },
      { buyTransactionId: "buy2", sellTransactionId: "sell1", amount: 0.1 },
    ],
  },
]

