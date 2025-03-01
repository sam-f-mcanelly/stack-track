import { NormalizedTransaction, NormalizedTransactionType, NormalizedTransactionSortKey } from "@/lib/models/transactions";
import { TableTransaction, convertToTableTransaction } from "@/lib/utils/tax/transactionConverter";
import { SellReportSummary } from "@/lib/models/tax";
import { fetchTransactions } from "@/app/api/transactions/transactions";

// Temporary year constant, should be made configurable in future
export const TEMP_YEAR = 2024;

/**
 * Fetches sell transactions for a specific year
 */
export const fetchSellTransactions = async (): Promise<TableTransaction[]> => {
  try {
    const response = await fetch(`http://192.168.68.75:3090/api/data/sells/${TEMP_YEAR}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const transactions: NormalizedTransaction[] = await response.json();
    return transactions.filter(transaction => !transaction.filedWithIRS).map(convertToTableTransaction);
  } catch (err) {
    console.error('Failed to fetch sell transactions:', err);
    return [];
  }
};

/**
 * Fetches buy transactions for specified assets
 */
export const fetchBuyTransactionsForAssets = async (
  assets: string[]
): Promise<Record<string, TableTransaction[]>> => {
  const assetBuyTransactionsMap: Record<string, TableTransaction[]> = {};

  for (const asset of assets) {
    try {
      // Fetch all buy transactions for this asset (with a large page size)
      const result = await fetchTransactions({
        page: 1,
        pageSize: 1000, // Large number to get all transactions
        sortBy: "timestamp" as NormalizedTransactionSortKey,
        sortOrder: "asc",
        assets: [asset],
        types: [NormalizedTransactionType.BUY]
      });

      // Convert and store in the cache
      const convertedTransactions = result.data
        .filter(tx => !tx.filedWithIRS)
        .map(tx => {
          const tableTx = convertToTableTransaction(tx);
          return tableTx;
        });

      assetBuyTransactionsMap[asset] = convertedTransactions;
    } catch (error) {
      console.error(`Error prefetching buy transactions for ${asset}:`, error);
      assetBuyTransactionsMap[asset] = [];
    }
  }

  return assetBuyTransactionsMap;
};

/**
 * Determines if a sell transaction is complete based on its tax method
 */
export const isSellComplete = (
  sellTransaction: TableTransaction,
  buyTransactions: TableTransaction[],
  assetBuyTransactions: TableTransaction[],
  otherSellsOfSameAsset: TableTransaction[],
  taxMethod: string
): boolean => {
  // For CUSTOM tax method, check if manually selected buy transactions cover the sold amount
  if (taxMethod === "CUSTOM") {
    // If no buy transactions are selected, sell is incomplete
    if (buyTransactions.length === 0) {
      return false;
    }

    // Sum up the total amount of the asset from associated buy transactions
    const totalBuyAmount = buyTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // The sell is complete if the buy transactions cover at least the sell amount
    return totalBuyAmount >= sellTransaction.amount;
  }

  // For automatic tax methods (FIFO, LIFO), check if enough buy transactions exist

  // Get all buy transactions for this asset
  const allBuysForAsset = [...assetBuyTransactions];

  // Sort by date based on tax method
  if (taxMethod === "FIFO") {
    allBuysForAsset.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (taxMethod === "LIFO") {
    allBuysForAsset.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Calculate the total amount needed for all sells of this asset (including this one)
  const totalSellAmount = otherSellsOfSameAsset.reduce((sum, tx) => sum + tx.amount, 0) + sellTransaction.amount;

  // Calculate the total available buy amount
  const totalAvailableBuyAmount = allBuysForAsset.reduce((sum, tx) => sum + tx.amount, 0);

  // The sell is complete if enough buy transactions exist to cover all sells
  return totalAvailableBuyAmount >= totalSellAmount;
};

/**
 * Generates tax report summaries for selected sell transactions
 */
export const generateSellReportSummaries = (
  selectedSellTransactions: string[],
  sellTransactions: TableTransaction[],
  sellToBuyTransactions: Record<string, string[]>,
  taxMethods: Record<string, string>,
  buyTransactionCache: Record<string, TableTransaction[]>
): Record<string, SellReportSummary> => {
  const sellReportSummaries: Record<string, SellReportSummary> = {};

  // First, group selected sell transactions by asset
  const sellsByAsset: Record<string, TableTransaction[]> = {};

  selectedSellTransactions.forEach(sellId => {
    const sellTransaction = sellTransactions.find(tx => tx.id === sellId);
    if (!sellTransaction) return;

    if (!sellsByAsset[sellTransaction.asset]) {
      sellsByAsset[sellTransaction.asset] = [];
    }

    sellsByAsset[sellTransaction.asset].push(sellTransaction);
  });

  // Now process each sell with awareness of other sells of the same asset
  selectedSellTransactions.forEach((sellId) => {
    const sellTransaction = sellTransactions.find(tx => tx.id === sellId);

    if (!sellTransaction) return;

    // Get the buy transactions associated with this sell
    const buyIds = sellToBuyTransactions[sellId] || [];
    const allBuyTransactions: TableTransaction[] = [];

    // Get all buy transactions from the cache
    Object.values(buyTransactionCache).forEach(txList => {
      allBuyTransactions.push(...txList);
    });

    // Get available buy transactions for this asset
    const assetBuyTransactions = buyTransactionCache[sellTransaction.asset] || [];

    // Get other sells of the same asset (excluding this one)
    const otherSellsOfSameAsset = sellsByAsset[sellTransaction.asset]
      .filter(tx => tx.id !== sellId);

    // Filter to just the ones associated with this sell
    const associatedBuyTransactions = allBuyTransactions.filter(
      tx => buyIds.includes(tx.id)
    );

    // Calculate profit
    const buyTotal = associatedBuyTransactions.reduce(
      (sum, tx) => sum + tx.total, 0
    );
    const profitAmount = sellTransaction.total - buyTotal;

    // Get the tax method for this sell
    const taxMethod = taxMethods[sellId] || "FIFO";

    // Determine if the sell is complete based on tax method
    const isComplete = isSellComplete(
      sellTransaction,
      associatedBuyTransactions,
      assetBuyTransactions,
      otherSellsOfSameAsset,
      taxMethod
    );

    sellReportSummaries[sellId] = {
      sellTransactionId: sellId,
      buyTransactionIds: buyIds,
      sellAmountFiat: {
        amount: sellTransaction.total,
        unit: "USD",
      },
      fee: {
        amount: 2.0, // Example fee - should come from actual transaction
        unit: "USD",
      },
      assetAmount: {
        amount: sellTransaction.amount,
        unit: sellTransaction.asset,
      },
      profit: {
        amount: profitAmount,
        unit: "USD",
      },
      timestamp: new Date(sellTransaction.date),
      isComplete: isComplete,
    };
  });

  return sellReportSummaries;
};

/**
 * Generates the tax report by submitting data to the API
 */
export const generateTaxReport = async (sellReportSummaries: Record<string, SellReportSummary>) => {
  try {
    const response = await fetch("/api/generate-tax-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.values(sellReportSummaries)),
    });

    if (!response.ok) {
      throw new Error("Failed to generate tax report");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating tax report:", error);
    throw error;
  }
};

/**
 * Sort transactions based on provided key and order
 */
export const sortTransactions = <T extends Record<string, any>>(
  transactions: T[],
  sortKey: string,
  sortOrder: "asc" | "desc"
): T[] => {
  return [...transactions].sort((a, b) => {
    let aValue = a[sortKey];
    let bValue = b[sortKey];

    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
};