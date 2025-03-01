export interface NormalizedTransaction {
  id: string
  source: TransactionSource
  type: NormalizedTransactionType
  transactionAmountFiat: ExchangeAmount
  fee: ExchangeAmount
  assetAmount: ExchangeAmount
  assetValueFiat: ExchangeAmount
  timestamp: Date
  timestampText: string
  address: string
  notes: string
  filedWithIRS: boolean
}

export enum TransactionSource {
  COINBASE_PRO_FILL = "COINBASE_PRO_FILL",
  COINBASE_STANDARD = "COINBASE_STANDARD",
  STRIKE_MONTHLY = "STRIKE_MONTHLY",
  STRIKE_ANNUAL = "STRIKE_ANNUAL",
}

export enum NormalizedTransactionType {
  BUY = "BUY",
  SELL = "SELL",
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  BROKER_CREDIT = "BROKER_CREDIT",
}

export interface ExchangeAmount {
  amount: number
  unit: string
}

export type NormalizedTransactionSortKey =
  | keyof NormalizedTransaction
  | "transactionAmountFiat.amount"
  | "fee.amount"
  | "assetAmount.amount"
  | "assetValueFiat.amount";
