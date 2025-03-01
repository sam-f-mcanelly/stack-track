import { ExchangeAmount, NormalizedTransaction } from "@/models/transactions";

export enum TaxTreatment {
    FIFO = 'FIFO',
    LIFO = 'LIFO',
    CUSTOM = 'CUSTOM',
    MAX_PROFIT = 'MAX_PROFIT',
    MIN_PROFIT = 'MIN_PROFIT'
}

export enum TaxType {
    SHORT_TERM = "SHORT_TERM",
    LONG_TERM = "LONG_TERM"
}

export interface TaxableEventParameters {
    sellId: string;
    taxTreatment: TaxTreatment;
    buyTransactionIds?: string[];
}

export interface TaxReportRequest {
    requestId: string;
    taxableEvents: TaxableEventParameters[];
}

export interface UsedBuyTransaction {
    transactionId: string;
    amountUsed: ExchangeAmount; // Fixed: This should be ExchangeAmount
    costBasis: ExchangeAmount;  // Fixed: This should be ExchangeAmount
    taxType: TaxType;
    originalTransaction: NormalizedTransaction;
}
  
export interface TaxableEventResult {
    sellTransactionId: string;
    proceeds: ExchangeAmount;
    costBasis: ExchangeAmount;
    gain: ExchangeAmount;
    sellTransaction: NormalizedTransaction;
    usedBuyTransactions: UsedBuyTransaction[];
    uncoveredSellAmount?: ExchangeAmount;
    uncoveredSellValue?: ExchangeAmount;
}
  
export interface TaxReportResult {
    requestId: string;
    results: TaxableEventResult[];
}
  
  // Helper for transforming API responses to match UI needs
export function processTaxReportResult(
    taxReportResult: TaxReportResult
  ): {
    sellToBuyTransactions: Record<string, string[]>;
    taxReportDetails: Record<string, TaxableEventResult>;
  } {
    const sellToBuyTransactions: Record<string, string[]> = {};
    const taxReportDetails: Record<string, TaxableEventResult> = {};
  
    // Process each tax result
    taxReportResult.results.forEach((result) => {
      const sellId = result.sellTransactionId;
      
      // Create a mapping from sell IDs to buy IDs
      sellToBuyTransactions[sellId] = result.usedBuyTransactions.map(
        (buyTx) => buyTx.transactionId
      );
      
      // Store the full result details
      taxReportDetails[sellId] = result;
    });
  
    return {
      sellToBuyTransactions,
      taxReportDetails,
    };
}