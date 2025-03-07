import { useState, useEffect, useCallback, useRef } from 'react';
import { TableTransaction } from '@/lib/utils/tax/transactionConverter';
import { TEMP_YEAR, fetchSellTransactions, sortTransactions } from '@/lib/services/tax-service';
import { requestTaxReport, processTaxReportResult } from '@/lib/services/tax-service-backend';
import { TaxableEventResult } from '@/lib/models/backend/tax/tax';

export function useTaxCalculation() {
  const [sellTransactions, setSellTransactions] = useState<TableTransaction[]>([]);
  const [selectedSellTransaction, setSelectedSellTransaction] = useState<string | null>(null);
  const [sellToBuyTransactions, setSellToBuyTransactions] = useState<Record<string, string[]>>({});
  const [taxMethods, setTaxMethods] = useState<Record<string, string>>({});
  const [selectedSellTransactions, setSelectedSellTransactions] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [taxReportDetails, setTaxReportDetails] = useState<Record<string, TaxableEventResult>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingTaxReport, setIsFetchingTaxReport] = useState<boolean>(false);

  // Track the current state snapshot to avoid dependency on the actual state objects
  const stateRef = useRef({
    selectedSellTransactions: [] as string[],
    taxMethods: {} as Record<string, string>,
    sellToBuyTransactions: {} as Record<string, string[]>,
  });

  // Track if a tax report fetch is needed
  const [needsFetch, setNeedsFetch] = useState<boolean>(false);

  // Track if we're currently fetching to prevent concurrent fetches
  const isFetchingRef = useRef(false);

  // Load initial sell transactions
  useEffect(() => {
    loadSellTransactions();
  }, []);

  // Update the stateRef when these values change
  useEffect(() => {
    stateRef.current.selectedSellTransactions = selectedSellTransactions;
    stateRef.current.taxMethods = taxMethods;
    stateRef.current.sellToBuyTransactions = sellToBuyTransactions;
  }, [selectedSellTransactions, taxMethods, sellToBuyTransactions]);

  // Function to fetch tax report - NO DEPENDENCIES ON STATE
  const fetchTaxReport = useCallback(async () => {
    // Use the ref values instead of the state directly
    const {
      selectedSellTransactions: currentSelectedSellTransactions,
      taxMethods: currentTaxMethods,
      sellToBuyTransactions: currentSellToBuyTransactions,
    } = stateRef.current;

    if (currentSelectedSellTransactions.length === 0 || isFetchingRef.current) {
      setNeedsFetch(false);
      return;
    }

    console.log('Fetching tax report');

    // Set fetching flag to prevent concurrent fetches
    isFetchingRef.current = true;
    setIsFetchingTaxReport(true); // Only set tax report loading to true, not the entire table

    try {
      const taxReportResult = await requestTaxReport(
        currentSelectedSellTransactions,
        currentTaxMethods,
        currentSellToBuyTransactions
      );

      console.log('Tax report:');
      console.log(taxReportResult);

      const {
        sellToBuyTransactions: newSellToBuyTransactions,
        taxReportDetails: newTaxReportDetails,
      } = processTaxReportResult(taxReportResult);

      // Update state with results from the API - these won't trigger a new fetch
      // because we'll clear the needsFetch flag
      setSellToBuyTransactions((prevState) => ({
        ...prevState,
        ...newSellToBuyTransactions,
      }));

      setTaxReportDetails(newTaxReportDetails);
    } catch (error) {
      console.error('Error fetching tax report:', error);
    } finally {
      setIsFetchingTaxReport(false); // Only reset tax report loading
      isFetchingRef.current = false;
      setNeedsFetch(false); // Clear the fetch flag
    }
  }, []); // No dependencies - uses ref values instead

  // Only fetch when the needsFetch flag is true
  useEffect(() => {
    if (needsFetch) {
      fetchTaxReport();
    }
  }, [needsFetch, fetchTaxReport]);

  // Fetch sell transactions
  const loadSellTransactions = async () => {
    setIsLoading(true);
    try {
      const transactions = await fetchSellTransactions();
      setSellTransactions(transactions);

      // Initialize tax methods
      setTaxMethods(Object.fromEntries(transactions.map((tx) => [tx.id, tx.taxMethod])));
    } catch (error) {
      console.error('Error loading sell transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection of a sell transaction
  const handleSelectSellTransaction = (id: string) => {
    console.log('Setting sell transaction', id);
    setSelectedSellTransactions((prev) => {
      const newSelection = prev.includes(id) ? prev.filter((txId) => txId !== id) : [...prev, id];

      // Schedule a fetch after state update is applied
      setTimeout(() => setNeedsFetch(true), 0);

      return newSelection;
    });
  };

  // Toggle all sell transactions
  const handleSelectAllSellTransactions = (selected: boolean) => {
    console.log('Setting all sell transactions to', selected);
    setSelectedSellTransactions((prev) => {
      const newSelection = selected ? sellTransactions.map((tx) => tx.id) : [];

      // Schedule a fetch after state update is applied
      if (prev.length !== newSelection.length) {
        setTimeout(() => setNeedsFetch(true), 0);
      }

      return newSelection;
    });
  };

  // Update the tax method for a sell transaction
  const handleTaxMethodChange = (sellId: string, method: string) => {
    setTaxMethods((prev) => {
      const newMethods = { ...prev, [sellId]: method };

      // Schedule a fetch after state update is applied
      setTimeout(() => setNeedsFetch(true), 0);

      return newMethods;
    });
  };

  // Toggle the Configure panel for a sell transaction
  const handleConfigureClick = (id: string) => {
    setSelectedSellTransaction(id === selectedSellTransaction ? null : id);
  };

  // Save the buy transactions associated with a sell transaction
  const handleSaveBuyTransactions = (sellId: string, buyIds: string[], taxMethod: string) => {
    // Need to update both at once
    setSellToBuyTransactions((prev) => ({ ...prev, [sellId]: buyIds }));
    setTaxMethods((prev) => ({ ...prev, [sellId]: taxMethod }));

    // Schedule a fetch after both state updates are applied
    setTimeout(() => setNeedsFetch(true), 0);
  };

  // Generate the tax report
  const handleGenerateReport = async () => {
    try {
      // The report is already generated and available in taxReportDetails
      console.log('Tax report generated:', taxReportDetails);
      return { success: true, report: taxReportDetails };
    } catch (error) {
      console.error('Error generating tax report:', error);
      throw error;
    }
  };

  // Toggle the sort order/key
  const toggleSort = (key: string) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Get sorted sell transactions
  const getSortedSellTransactions = () => {
    return sortTransactions(sellTransactions, sortKey, sortOrder);
  };

  // Get buy transactions for a specific sell transaction - now from the API result
  const getBuyTransactionsForSell = (sellId: string): TableTransaction[] => {
    const taxEventResult = taxReportDetails[sellId];

    if (!taxEventResult) return [];

    // Convert the API's used buy transactions to TableTransaction format
    return taxEventResult.usedBuyTransactions.map((buyTx) => {
      const originalTx = buyTx.originalTransaction;

      return {
        id: buyTx.transactionId,
        date: originalTx.timestampText,
        source: originalTx.source,
        asset: originalTx.assetAmount.unit,
        amount: buyTx.amountUsed.amount, // Extract the amount from ExchangeAmount
        price: originalTx.assetValueFiat.amount / originalTx.assetAmount.amount,
        total: buyTx.costBasis.amount, // Extract the amount from ExchangeAmount
        taxMethod: taxMethods[sellId] || 'FIFO',
        term: buyTx.taxType === 'LONG_TERM' ? 'Long Term' : 'Short Term', // Convert enum value to term string
      };
    });
  };

  return {
    sellTransactions,
    selectedSellTransaction,
    sellToBuyTransactions,
    taxMethods,
    selectedSellTransactions,
    sortKey,
    sortOrder,
    sellReportSummaries: taxReportDetails, // Map the new tax report details to the old format
    isLoading,
    isFetchingTaxReport, // Export the new tax report loading state
    year: TEMP_YEAR,
    getSortedSellTransactions,
    handleSelectSellTransaction,
    handleSelectAllSellTransactions, // Export the select all function
    handleTaxMethodChange,
    handleConfigureClick,
    handleSaveBuyTransactions,
    handleGenerateReport,
    toggleSort,
    getBuyTransactionsForSell,
  };
}
