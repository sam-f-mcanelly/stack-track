// tax-api-service.ts
import { TaxTreatment, TaxReportRequest, TaxableEventParameters } from "@/models/backend/tax/tax";
import { NormalizedTransaction } from "@/models/transactions";

export interface ExchangeAmount {
  amount: number;
  unit: string;
}

export interface UsedBuyTransaction {
  transactionId: string;
  amountUsed: number;
  costBasis: number;
  taxType: string; // Could be enum if we have the type definitions
  originalTransaction: NormalizedTransaction;
}

export interface TaxableEventResult {
  sellTransactionId: string;
  proceeds: ExchangeAmount;
  costBasis: ExchangeAmount;
  gain: ExchangeAmount;
  sellTransaction: NormalizedTransaction;
  usedBuyTransactions: UsedBuyTransaction[];
}

export interface TaxReportResult {
  requestId: string;
  results: TaxableEventResult[];
}

/**
 * Requests a tax report from the backend API
 * 
 * @param selectedSellTransactions Array of selected sell transaction IDs
 * @param taxMethods Record mapping sell transaction IDs to tax methods
 * @param sellToBuyTransactions Record mapping sell transaction IDs to arrays of buy transaction IDs
 * @returns Tax report result from the API
 */
export async function requestTaxReport(
  selectedSellTransactions: string[],
  taxMethods: Record<string, string>,
  sellToBuyTransactions: Record<string, string[]>
): Promise<TaxReportResult> {
  if (selectedSellTransactions.length === 0) {
    return { requestId: "none", results: [] };
  }

  // Create taxable events for each selected sell transaction
  const taxableEvents: TaxableEventParameters[] = selectedSellTransactions.map((sellId) => {
    const taxMethod = taxMethods[sellId] || "FIFO";
    
    // Only include buy transaction IDs if we're using CUSTOM tax method
    const buyIds = taxMethod === "CUSTOM" ? sellToBuyTransactions[sellId] : undefined;
    
    return {
      sellId,
      taxTreatment: taxMethod as TaxTreatment,
      buyTransactionIds: buyIds
    };
  });

  // Create the request object
  const requestId = `request-${Date.now()}`;
  const taxReportRequest: TaxReportRequest = {
    requestId,
    taxableEvents
  };

  try {
    const response = await fetch(`http://192.168.68.75:3090/api/tax/request_report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taxReportRequest) // Send directly in the request body
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
  
    return await response.json() as TaxReportResult;
  } catch (error) {
    console.error("Error requesting tax report:", error);
    throw error;
  }
}

/**
 * Converts a TaxReportResult to a more usable format for the UI
 * 
 * @param taxReportResult Result from the API
 * @returns Processed tax report data for the UI
 */
export function processTaxReportResult(taxReportResult: TaxReportResult): {
  sellToBuyTransactions: Record<string, string[]>;
  taxReportDetails: Record<string, TaxableEventResult>;
} {
  const sellToBuyTransactions: Record<string, string[]> = {};
  const taxReportDetails: Record<string, TaxableEventResult> = {};

  taxReportResult.results.forEach(result => {
    const sellId = result.sellTransactionId;
    
    // Extract buy transaction IDs
    sellToBuyTransactions[sellId] = result.usedBuyTransactions.map(buyTx => buyTx.transactionId);
    
    // Store the full result for detailed rendering
    taxReportDetails[sellId] = result;
  });

  return {
    sellToBuyTransactions,
    taxReportDetails
  };
}
