import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TableTransaction } from "@/lib/utils/tax/transactionConverter";
import { TaxableEventResult, TaxReportResult, TaxType, UsedBuyTransaction } from "@/lib/models/backend/tax/tax";
import { ExchangeAmount } from "@/lib/models/transactions";
import { formatValue } from "@/lib/utils/formatter";
import { generatePdfTaxReport } from "@/lib/services/tax-service-backend";

interface ReportSummaryProps {
  selectedSellTransactions: string[];
  sellTransactions: TableTransaction[];
  sellToBuyTransactions: Record<string, string[]>;
  taxMethods: Record<string, string>;
  onGenerateReport: () => Promise<any>;
  taxReports: Record<string, TaxableEventResult>;
}

export function ReportSummary({
  selectedSellTransactions,
  sellTransactions,
  taxMethods,
  onGenerateReport,
  taxReports,
}: ReportSummaryProps) {
  const [expandedSells, setExpandedSells] = useState<Record<string, boolean>>({});
  const [newlyUpdatedTaxReports, setNewlyUpdatedTaxReports] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const previousTaxReportKeys = useRef<string[]>([]);
  
  // Initialize expanded state for newly selected transactions - all collapsed by default
  useEffect(() => {
    setExpandedSells((prevExpanded) => {
      const newExpandedSells = { ...prevExpanded };
      selectedSellTransactions.forEach((id) => {
        if (!(id in newExpandedSells)) {
          newExpandedSells[id] = false; // Make sure they're all collapsed by default
        }
      });
      return newExpandedSells;
    });
  }, [selectedSellTransactions]);
  
  // Track newly updated tax reports but don't auto-expand them
  useEffect(() => {
    const currentTaxReportKeys = Object.keys(taxReports);
    
    // Find newly added tax reports
    const newReports = currentTaxReportKeys.filter(
      key => !previousTaxReportKeys.current.includes(key) && taxReports[key]
    );
    
    // Find updated tax reports
    const updatedReports = new Set<string>();
    newReports.forEach(key => updatedReports.add(key));
    
    if (updatedReports.size > 0) {
      // Mark these reports as newly updated for highlighting without expanding them
      setNewlyUpdatedTaxReports(updatedReports);
      
      // Clear the highlighting after 3 seconds
      setTimeout(() => {
        setNewlyUpdatedTaxReports(new Set());
      }, 3000);
    }
    
    // Update the ref with current keys for next comparison
    previousTaxReportKeys.current = currentTaxReportKeys;
  }, [taxReports]);

  const toggleExpand = (id: string) => {
    setExpandedSells((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // First generate the report data
      const reportResult = await onGenerateReport();
      
      // Construct a TaxReportResult from the returned report data
      const taxReportResult: TaxReportResult = {
        requestId: `report-${Date.now()}`,
        results: Object.values(taxReports)
      };
      
      // Call the API to generate the PDF
      const pdfBlob = await generatePdfTaxReport(taxReportResult);
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crypto-tax-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      return reportResult;
    } catch (error) {
      console.error("Error generating PDF report:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Calculate total profit/loss for all selected transactions
  const totalGain = Object.values(taxReports)
    .reduce((sum, report) => sum + (report?.gain?.amount || 0), 0);
  
  const totalProceeds = Object.values(taxReports)
    .reduce((sum, report) => sum + (report?.proceeds?.amount || 0), 0);
  
  // Format currency with proper symbol - handles both number and ExchangeAmount
  const formatCurrency = (amount: number | ExchangeAmount, currency?: string) => {
    // Handle ExchangeAmount object
    if (typeof amount === 'object' && amount !== null && 'amount' in amount) {
      const symbol = amount.unit === "USD" ? "$" : "";
      return `${symbol}${amount.amount.toFixed(2)}`;
    }
    
    // Handle number
    const symbol = currency === "USD" ? "$" : "";
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="py-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600 dark:text-green-500" />
              Tax Report Summary
            </CardTitle>
            {selectedSellTransactions.length > 0 && taxReports && Object.keys(taxReports).length > 0 && (
              <div className="mt-1 flex items-center text-sm">
                <div className="mr-4">
                  <span className="text-slate-500 dark:text-slate-400">Total Proceeds:</span>
                  <span className="ml-1 font-semibold">${totalProceeds.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Total Gain/Loss:</span>
                  <span className={cn(
                    "ml-1 font-semibold",
                    totalGain > 0 ? "text-green-600 dark:text-green-500" : 
                    totalGain < 0 ? "text-red-600 dark:text-red-500" : ""
                  )}>
                    ${totalGain.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <Button 
            onClick={handleGenerateReport} 
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white font-bold transition-all"
            disabled={selectedSellTransactions.length === 0 || isGenerating}
            size="sm"
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </div>
        <CardDescription className="text-xs mt-1">Summary of transactions selected for the tax report</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 px-3 pb-3">
        {selectedSellTransactions.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Select a sell transaction to add it to the report</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedSellTransactions.map((sellId) => {
              const sellTx = sellTransactions.find((tx) => tx.id === sellId);
              const taxReport = taxReports[sellId];
              const isNewlyUpdated = newlyUpdatedTaxReports.has(sellId);
              const isExpanded = expandedSells[sellId];
              
              if (!sellTx) return null;

              // Check if we have a tax report and buy transactions
              const hasTaxReport = !!taxReport;
              
              // If we have a report, determine if all sells are covered
              const hasSufficientCoverage = hasTaxReport && 
                (!taxReport.uncoveredSellAmount || taxReport.uncoveredSellAmount.amount === 0);
              
              // Use sell transaction data from either the report or the UI
              const assetName = hasTaxReport 
                ? taxReport.sellTransaction.assetAmount.unit 
                : sellTx.asset;
              
              // Calculate gain/loss percentage if we have the data
              const gainPercentage = hasTaxReport && taxReport.costBasis.amount !== 0
                ? (taxReport.gain.amount / taxReport.costBasis.amount) * 100
                : 0;

              return (
                <div
                  key={sellId}
                  className={cn(
                    "rounded border overflow-hidden transition-all duration-300",
                    isNewlyUpdated 
                      ? "animate-pulse-theme border-blue-400 dark:border-blue-600" 
                      : hasTaxReport && hasSufficientCoverage
                        ? "border-l-3 border-l-green-500 dark:border-l-green-600 border-t-gray-200 border-r-gray-200 border-b-gray-200 dark:border-t-gray-700 dark:border-r-gray-700 dark:border-b-gray-700" 
                        : hasTaxReport && !hasSufficientCoverage
                          ? "border-orange-300 dark:border-orange-600"
                          : "border-gray-200 dark:border-gray-700"
                  )}
                >
                  {/* Compact header - always visible */}
                  <div
                    className={cn(
                      "py-2 px-3 cursor-pointer",
                      hasTaxReport && hasSufficientCoverage 
                        ? "bg-gradient-to-r from-green-50 to-white dark:from-green-950/30 dark:to-transparent" 
                        : hasTaxReport && !hasSufficientCoverage
                          ? "bg-gradient-to-r from-orange-50 to-white dark:from-orange-950/30 dark:to-transparent"
                          : "bg-white dark:bg-transparent"
                    )}
                    onClick={() => toggleExpand(sellId)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {hasTaxReport 
                                ? `${taxReport.sellTransaction.assetAmount.amount} ${assetName}`
                                : `${sellTx.amount} ${assetName}`}
                            </span>
                            {hasTaxReport && hasSufficientCoverage ? (
                              <CheckCircle className="h-4 w-4 ml-1 text-green-500 dark:text-green-400" />
                            ) : hasTaxReport && !hasSufficientCoverage ? (
                              <AlertCircle className="h-4 w-4 ml-1 text-orange-500 dark:text-orange-400" />
                            ) : null}
                            {isNewlyUpdated && (
                              <Badge className="ml-1 text-xs py-0 px-1 h-5" variant="default">New</Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {hasTaxReport 
                              ? taxReport.sellTransaction.timestampText 
                              : sellTx.date} · {taxMethods[sellId]}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {hasTaxReport ? (
                          <>
                            <Badge className={cn(
                              "text-xs",
                              taxReport.gain.amount > 0 
                                ? "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800" 
                                : "bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800"
                            )}>
                              {taxReport.gain.amount > 0 ? "+" : ""}{formatValue(taxReport.gain.amount, taxReport.gain.unit)}
                            </Badge>
                          </>
                        ) : (
                          <div className="text-xs">
                            @ ${sellTx.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      {/* Stats summary */}
                      {hasTaxReport && (
                        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
                          <div className="p-2 text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Proceeds</div>
                            <div className="font-medium">
                              {formatValue(taxReport.proceeds.amount, taxReport.proceeds.unit)}
                            </div>
                          </div>
                          <div className="p-2 text-center">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Cost Basis</div>
                            <div className="font-medium">
                              {formatValue(taxReport.costBasis.amount, taxReport.costBasis.unit)}
                            </div>
                          </div>
                          <div className={cn(
                            "p-2 text-center",
                            taxReport.gain.amount > 0 
                              ? "bg-green-50 dark:bg-green-950/30" 
                              : taxReport.gain.amount < 0 
                                ? "bg-red-50 dark:bg-red-950/30" 
                                : ""
                          )}>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Gain/Loss</div>
                            <div className={cn(
                              "font-medium",
                              taxReport.gain.amount > 0 
                                ? "text-green-600 dark:text-green-500" 
                                : taxReport.gain.amount < 0 
                                  ? "text-red-600 dark:text-red-500" 
                                  : ""
                            )}>
                              {formatValue(taxReport.gain.amount, taxReport.gain.unit)} ({gainPercentage.toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Warning for uncovered sells */}
                      {hasTaxReport && !hasSufficientCoverage && taxReport.uncoveredSellAmount && (
                        <div className="p-2 bg-orange-50 dark:bg-orange-950/30 border-b border-orange-200 dark:border-orange-900 text-sm">
                          <div className="flex items-start">
                            <AlertCircle className="h-4 w-4 mr-1 text-orange-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-orange-800 dark:text-orange-300">
                                <strong>Uncovered:</strong> {taxReport.uncoveredSellAmount.amount.toFixed(6)} {taxReport.uncoveredSellAmount.unit}
                                {taxReport.uncoveredSellValue && (
                                  <span> ({formatValue(taxReport.uncoveredSellValue.amount, taxReport.uncoveredSellValue.unit)})</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Buy transactions table */}
                      {hasTaxReport && taxReport.usedBuyTransactions.length > 0 && (
                        <div className="p-2">
                          <div className="text-xs font-medium mb-1">Used Buy Transactions</div>
                          <div className="overflow-x-auto">
                            <Table className="w-full text-xs">
                              <TableHeader>
                                <TableRow className="h-7">
                                  <TableHead className="py-1">Date</TableHead>
                                  <TableHead className="py-1">Amount</TableHead>
                                  <TableHead className="py-1">Price</TableHead>
                                  <TableHead className="py-1">Cost Basis</TableHead>
                                  <TableHead className="py-1">Tax Type</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {taxReport.usedBuyTransactions.map((buyTx: UsedBuyTransaction) => {
                                  const originalTx = buyTx.originalTransaction;
                                  
                                  return (
                                    <TableRow key={buyTx.transactionId} className="h-7">
                                      <TableCell className="py-1">{originalTx.timestampText}</TableCell>
                                      <TableCell className="py-1">
                                        {buyTx.amountUsed.amount.toFixed(6)}
                                      </TableCell>
                                      <TableCell className="py-1">
                                        {formatValue(
                                          originalTx.assetValueFiat.amount,
                                          originalTx.assetValueFiat.unit
                                        )}
                                      </TableCell>
                                      <TableCell className="py-1">
                                        {formatValue(buyTx.costBasis.amount, buyTx.costBasis.unit)}
                                      </TableCell>
                                      <TableCell className="py-1">
                                        <Badge variant="outline" className={cn(
                                          "text-xs py-0 px-1 h-5",
                                          buyTx.taxType === TaxType.LONG_TERM 
                                            ? "border-green-500 text-green-700 dark:border-green-600 dark:text-green-400"
                                            : "border-blue-500 text-blue-700 dark:border-blue-600 dark:text-blue-400"
                                        )}>
                                          {buyTx.taxType}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <style jsx global>{`
        .animate-pulse-theme {
          animation: pulse-theme 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse-theme {
          0%, 100% {
            background-color: hsl(var(--card));
          }
          50% {
            background-color: hsl(var(--muted));
          }
        }
        
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </Card>
  );
}
