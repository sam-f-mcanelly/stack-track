import { type ExchangeAmount } from "@/models/transactions"

/**
* Used for the tax reports. Associates a sell with buys
*/
export interface SellReportSummary {
  sellTransactionId: string
  buyTransactionIds: string[]
  sellAmountFiat: ExchangeAmount
  fee: ExchangeAmount
  assetAmount: ExchangeAmount
  profit: ExchangeAmount
  timestamp: Date
  // Whether or not the buys are enough to cover the sell
  isComplete: Boolean
}

