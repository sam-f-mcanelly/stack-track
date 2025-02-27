"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BuyTransactions } from "@/components/tax/buy-transactions"
import { ReportSummary } from "@/components/tax/report-summary"
import { TaxPageInstructions } from "@/components/tax/tax-page-instructions"
import { SellTransactionTable } from "@/components/tax/sell-transaction-table"
import { useTaxCalculation } from "@/lib/hooks/use-tax-calculation"

export default function TaxPage() {
  const {
    sellTransactions,
    selectedSellTransaction,
    sellToBuyTransactions,
    taxMethods,
    selectedSellTransactions,
    sortKey,
    sortOrder,
    sellReportSummaries,
    isLoading,
    year,
    getSortedSellTransactions,
    handleSelectSellTransaction,
    handleTaxMethodChange,
    handleConfigureClick,
    handleSaveBuyTransactions,
    handleGenerateReport,
    toggleSort,
    getBuyTransactionsForSell
  } = useTaxCalculation();

  // Get the sorted transactions
  const sortedSellTransactions = getSortedSellTransactions();

  // Get the currently selected sell transaction
  const currentSellTransaction = sellTransactions.find(
    (tx) => tx.id === selectedSellTransaction
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight gradient-bg text-transparent bg-clip-text">Tax</h2>
      </div>
      
      <div className="mb-6">
        <TaxPageInstructions />
      </div>
      
      <ReportSummary
        selectedSellTransactions={selectedSellTransactions}
        sellTransactions={sellTransactions}
        sellToBuyTransactions={sellToBuyTransactions}
        taxMethods={taxMethods}
        onGenerateReport={handleGenerateReport}
        taxReports={sellReportSummaries}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Unreported Sell Transactions</CardTitle>
          <CardDescription>Configure tax lots for your sell transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <SellTransactionTable
            transactions={sortedSellTransactions}
            isLoading={isLoading}
            year={year}
            selectedTransactions={selectedSellTransactions}
            taxMethods={taxMethods}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSelectTransaction={handleSelectSellTransaction}
            onTaxMethodChange={handleTaxMethodChange}
            onConfigureClick={handleConfigureClick}
            onToggleSort={toggleSort}
          />
        </CardContent>
      </Card>
      
      {selectedSellTransaction && currentSellTransaction && (
        <BuyTransactions
          sellTransactionId={selectedSellTransaction}
          asset={currentSellTransaction.asset}
          onSave={handleSaveBuyTransactions}
          initialTaxMethod={taxMethods[selectedSellTransaction] || "FIFO"}
          initialSelectedTransactions={sellToBuyTransactions[selectedSellTransaction] || []}
          // Pass sell transaction details for accurate profit calculations
          sellAmount={currentSellTransaction.amount}
          sellTotal={currentSellTransaction.total}
          sellPrice={currentSellTransaction.price}
        />
      )}
    </div>
  )
}
