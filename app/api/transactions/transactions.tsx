// api/services/transactionService.ts
import { NormalizedTransactionSortKey, NormalizedTransaction, NormalizedTransactionType } from "@/models/transactions";

/**
 * Available transaction types based on the backend enum
 */
export const TRANSACTION_TYPES: NormalizedTransactionType[] = [
  NormalizedTransactionType.BUY,
  NormalizedTransactionType.SELL,
  NormalizedTransactionType.DEPOSIT,
  NormalizedTransactionType.WITHDRAWAL,
  NormalizedTransactionType.BROKER_CREDIT,
];

/**
 * Currently available asset types (hardcoded for now)
 */
export const ASSET_TYPES: string[] = ["BTC", "ETH"];

const API_BASE_URL = "http://192.168.68.75:3090/api";

/**
 * Response structure for paginated transaction data
 */
export interface PaginationResponse {
  data: NormalizedTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Parameters for transaction fetching with pagination and filtering
 */
export interface TransactionFetchParams {
  page?: number;
  pageSize?: number;
  sortBy?: NormalizedTransactionSortKey;
  sortOrder?: 'asc' | 'desc';
  assets?: string[];
  types?: NormalizedTransactionType[];
}

/**
 * Fetches transactions with pagination, sorting, and filtering
 * 
 * @param params - Pagination and filter parameters
 * @returns Paginated response with transaction data
 */
export async function fetchTransactions({
  page = 1,
  pageSize = 10,
  sortBy = "timestamp" as NormalizedTransactionSortKey,
  sortOrder = "desc" as 'asc' | 'desc',
  assets = [],
  types = [],
}: TransactionFetchParams): Promise<PaginationResponse> {
  try {
    // Build the base URL with pagination and sorting
    let url = `${API_BASE_URL}/data/transactions?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    
    // Add asset filter if provided
    if (assets && assets.length > 0) {
      url += `&assets=${assets.join(',')}`;
    }
    
    // Add transaction type filter if provided
    if (types && types.length > 0) {
      url += `&types=${types.join(',')}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json() as PaginationResponse;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}