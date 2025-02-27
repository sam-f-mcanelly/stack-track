import { useState, useEffect, useCallback } from "react";
import { TableTransaction } from "@/lib/utils/tax/transactionConverter";
import { TEMP_YEAR, fetchSellTransactions, sortTransactions } from "@/lib/services/tax-service";
import { requestTaxReport, processTaxReportResult, TaxableEventResult } from "@/lib/services/tax-service-backend";

export function useTaxCalculation() {
  const [sellTransactions, setSellTransactions] = useState<TableTransaction[]>([]);
  const [selectedSellTransaction, setSelectedSellTransaction] = useState<string | null>(null);
  const [sellToBuyTransactions, setSellToBuyTransactions] = useState<Record<string, string[]>>({});
  const [taxMethods, setTaxMethods] = useState<Record<string, string>>({});
  const [selectedSellTransactions, setSelectedSellTransactions] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [taxReportDetails, setTaxReportDetails] = useState<Record<string, TaxableEventResult>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial sell transactions
  useEffect(() => {
    loadSellTransactions();
  }, []);

  // Function to fetch tax report when selections change
  const fetchTaxReport = useCallback(async () => {
    if (selectedSellTransactions.length === 0) {
      // No tax report to fetch if no sell transactions are selected
      return;
    }

    try {
      setIsLoading(true);
      const taxReportResult = await requestTaxReport(
        selectedSellTransactions,
        taxMethods,
        sellToBuyTransactions
      );
      
      const { sellToBuyTransactions: newSellToBuyTransactions, taxReportDetails: newTaxReportDetails } = 
        processTaxReportResult(taxReportResult);
      
      // Update state with results from the API
      setSellToBuyTransactions(prevState => ({
        ...prevState,
        ...newSellToBuyTransactions
      }));
      
      setTaxReportDetails(newTaxReportDetails);
    } catch (error) {
      console.error("Error fetching tax report:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSellTransactions, taxMethods, sellToBuyTransactions]);

  // Fetch tax report whenever selected sells, tax methods, or buy transactions change
  useEffect(() => {
    fetchTaxReport();
  }, [selectedSellTransactions, taxMethods, sellToBuyTransactions, fetchTaxReport]);

  // Fetch sell transactions
  const loadSellTransactions = async () => {
    setIsLoading(true);
    try {
      const transactions = await fetchSellTransactions();
      setSellTransactions(transactions);

      // Initialize tax methods
      setTaxMethods(Object.fromEntries(
        transactions.map((tx) => [tx.id, tx.taxMethod])
      ));
    } catch (error) {
      console.error("Error loading sell transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection of a sell transaction
  const handleSelectSellTransaction = (id: string) => {
    setSelectedSellTransactions((prev) =>
      prev.includes(id) ? prev.filter((txId) => txId !== id) : [...prev, id]
    );
  };

  // Update the tax method for a sell transaction
  const handleTaxMethodChange = (sellId: string, method: string) => {
    setTaxMethods((prev) => ({ ...prev, [sellId]: method }));
  };

  // Toggle the Configure panel for a sell transaction
  const handleConfigureClick = (id: string) => {
    setSelectedSellTransaction(id === selectedSellTransaction ? null : id);
  };

  // Save the buy transactions associated with a sell transaction
  const handleSaveBuyTransactions = (sellId: string, buyIds: string[], taxMethod: string) => {
    setSellToBuyTransactions((prev) => ({ ...prev, [sellId]: buyIds }));
    setTaxMethods((prev) => ({ ...prev, [sellId]: taxMethod }));
  };

  // Generate the tax report
  const handleGenerateReport = async () => {
    try {
      // The report is already generated and available in taxReportDetails
      // This function could be enhanced to create a downloadable report or to send data to another endpoint
      console.log("Tax report generated:", taxReportDetails);
      return { success: true, report: taxReportDetails };
    } catch (error) {
      console.error("Error generating tax report:", error);
      throw error;
    }
  };

  // Toggle the sort order/key
  const toggleSort = (key: string) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
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
    return taxEventResult.usedBuyTransactions.map(buyTx => {
      const originalTx = buyTx.originalTransaction;
      
      return {
        id: buyTx.transactionId,
        date: originalTx.timestampText,
        source: originalTx.source,
        asset: originalTx.assetAmount.unit,
        amount: buyTx.amountUsed, // Use the amount used from the tax calculation
        price: originalTx.assetValueFiat.amount / originalTx.assetAmount.amount,
        total: buyTx.costBasis, // Use the cost basis from the tax calculation
        taxMethod: taxMethods[sellId] || "FIFO",
        term: buyTx.taxType // Use the tax type from the calculation
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
    year: TEMP_YEAR,
    getSortedSellTransactions,
    handleSelectSellTransaction,
    handleTaxMethodChange,
    handleConfigureClick,
    handleSaveBuyTransactions,
    handleGenerateReport,
    toggleSort,
    getBuyTransactionsForSell
  };
}
