import { useState, useEffect } from "react";
import { TableTransaction } from "@/lib/utils/tax/transactionConverter";
import { SellReportSummary } from "@/models/tax";
import {
  TEMP_YEAR,
  fetchSellTransactions,
  fetchBuyTransactionsForAssets,
  generateSellReportSummaries,
  generateTaxReport,
  sortTransactions
} from "@/lib/services/tax-service";

export function useTaxCalculation() {
  const [sellTransactions, setSellTransactions] = useState<TableTransaction[]>([]);
  const [selectedSellTransaction, setSelectedSellTransaction] = useState<string | null>(null);
  const [sellToBuyTransactions, setSellToBuyTransactions] = useState<Record<string, string[]>>({});
  const [taxMethods, setTaxMethods] = useState<Record<string, string>>({});
  const [selectedSellTransactions, setSelectedSellTransactions] = useState<string[]>([]);
  const [buyTransactionCache, setBuyTransactionCache] = useState<Record<string, TableTransaction[]>>({});
  const [sortKey, setSortKey] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sellReportSummaries, setSellReportSummaries] = useState<Record<string, SellReportSummary>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial sell transactions
  useEffect(() => {
    loadSellTransactions();
  }, []);

  // Pre-fetch buy transactions when sell transactions are loaded
  useEffect(() => {
    if (sellTransactions.length > 0) {
      const uniqueAssets = [...new Set(sellTransactions.map(tx => tx.asset))];
      loadBuyTransactionsForAssets(uniqueAssets);
    }
  }, [sellTransactions]);

  // Update sell report summaries whenever relevant state changes
  useEffect(() => {
    updateSellReportSummaries();
  }, [selectedSellTransactions, sellToBuyTransactions, taxMethods, sellTransactions, buyTransactionCache]);

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

  // Load buy transactions for specified assets
  const loadBuyTransactionsForAssets = async (assets: string[]) => {
    try {
      const buyTransactions = await fetchBuyTransactionsForAssets(assets);
      setBuyTransactionCache(buyTransactions);
    } catch (error) {
      console.error("Error loading buy transactions:", error);
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

  // Update the tax report summaries
  const updateSellReportSummaries = () => {
    const newSellReportSummaries = generateSellReportSummaries(
      selectedSellTransactions,
      sellTransactions,
      sellToBuyTransactions,
      taxMethods,
      buyTransactionCache
    );

    setSellReportSummaries(newSellReportSummaries);
  };

  // Generate the tax report
  const handleGenerateReport = async () => {
    try {
      const result = await generateTaxReport(sellReportSummaries);
      console.log("Tax report generated:", result);
      // Here you would typically update the UI to show the new report
      return result;
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

  // Get buy transactions for a specific sell transaction
  const getBuyTransactionsForSell = (sellId: string): TableTransaction[] => {
    const sellTx = sellTransactions.find(tx => tx.id === sellId);
    if (!sellTx) return [];

    return buyTransactionCache[sellTx.asset] || [];
  };

  return {
    sellTransactions,
    selectedSellTransaction,
    sellToBuyTransactions,
    taxMethods,
    selectedSellTransactions,
    buyTransactionCache,
    sortKey,
    sortOrder,
    sellReportSummaries,
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
