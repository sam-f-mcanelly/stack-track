import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, InfoIcon, AlertCircle, CheckCircle, DollarSign } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TableTransaction } from "@/lib/utils/tax/transactionConverter";
import { TaxableEventResult, TaxType, UsedBuyTransaction } from "@/models/backend/tax/tax";
import { ExchangeAmount } from "@/models/transactions";

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
  sellToBuyTransactions,
  taxMethods,
  onGenerateReport,
  taxReports,
}: ReportSummaryProps) {
  const [expandedSells, setExpandedSells] = useState<Record<string, boolean>>({});
  const [newlyUpdatedTaxReports, setNewlyUpdatedTaxReports] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const previousTaxReportKeys = useRef<string[]>([]);
  
  // Initialize expanded state for newly selected transactions
  useEffect(() => {
    setExpandedSells((prevExpanded) => {
      const newExpandedSells = { ...prevExpanded };
      selectedSellTransactions.forEach((id) => {
        if (!(id in newExpandedSells)) {
          newExpandedSells[id] = false;
        }
      });
      return newExpandedSells;
    });
  }, [selectedSellTransactions]);
  
  // Auto-expand when new tax reports are generated
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
      // Auto-expand the newly updated reports
      setExpandedSells(prev => {
        const newState = { ...prev };
        updatedReports.forEach(id => {
          newState[id] = true;
        });
        return newState;
      });
      
      // Mark these reports as newly updated for highlighting
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
      await onGenerateReport();
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
      <CardHeader className="bg-gradient-to-r from-slate-100 to-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-green-600" />
              Tax Report Summary
            </CardTitle>
            {selectedSellTransactions.length > 0 && taxReports && Object.keys(taxReports).length > 0 && (
              <div className="mt-2 flex items-center">
                <div className="mr-4">
                  <span className="text-sm text-slate-500">Total Proceeds:</span>
                  <span className="ml-1 font-semibold">${totalProceeds.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Total Gain/Loss:</span>
                  <span className={cn(
                    "ml-1 font-semibold",
                    totalGain > 0 ? "text-green-600" : totalGain < 0 ? "text-red-600" : ""
                  )}>
                    ${totalGain.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <Button 
            onClick={handleGenerateReport} 
            className="bg-green-600 hover:bg-green-700 text-white font-bold transition-all"
            disabled={selectedSellTransactions.length === 0 || isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
        </div>
        <CardDescription>Summary of transactions selected for the tax report</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {selectedSellTransactions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-slate-500">Select a sell transaction to add it to the report</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedSellTransactions.map((sellId) => {
              const sellTx = sellTransactions.find((tx) => tx.id === sellId);
              const taxReport = taxReports[sellId];
              const isNewlyUpdated = newlyUpdatedTaxReports.has(sellId);
              
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
                    "rounded-lg border transition-all duration-300 overflow-hidden",
                    isNewlyUpdated 
                      ? "animate-pulse-light border-blue-400 shadow-md shadow-blue-100" 
                      : hasTaxReport && hasSufficientCoverage
                        ? "border-l-4 border-l-green-500 border-t-gray-200 border-r-gray-200 border-b-gray-200" 
                        : hasTaxReport && !hasSufficientCoverage
                          ? "border-orange-300"
                          : "border-gray-200"
                  )}
                >
                  <div className={cn(
                    "p-4",
                    hasTaxReport && hasSufficientCoverage 
                      ? "bg-gradient-to-r from-green-50 to-white" 
                      : hasTaxReport && !hasSufficientCoverage
                        ? "bg-gradient-to-r from-orange-50 to-white"
                        : "bg-white"
                  )}>
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleExpand(sellId)}
                        >
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold">
                              Sell: {hasTaxReport 
                                ? `${taxReport.sellTransaction.assetAmount.amount} ${assetName}`
                                : `${sellTx.amount} ${assetName}`} 
                              @ {hasTaxReport 
                                ? formatCurrency(taxReport.sellTransaction.assetValueFiat.amount / 
                                    taxReport.sellTransaction.assetAmount.amount)
                                : `$${sellTx.price.toFixed(2)}`}
                            </h3>
                            {hasTaxReport && hasSufficientCoverage ? (
                              <CheckCircle className="h-5 w-5 ml-2 text-green-500" />
                            ) : hasTaxReport && !hasSufficientCoverage ? (
                              <AlertCircle className="h-5 w-5 ml-2 text-orange-500" />
                            ) : null}
                            {isNewlyUpdated && (
                              <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">Updated</Badge>
                            )}
                          </div>
                          <div className="flex items-center">
                            {hasTaxReport && (
                              <Badge className={cn(
                                "mr-3",
                                taxReport.gain.amount > 0 
                                  ? "bg-green-500 hover:bg-green-600" 
                                  : "bg-red-500 hover:bg-red-600"
                              )}>
                                {taxReport.gain.amount > 0 ? "+" : ""}{taxReport.gain.amount.toFixed(2)} ({gainPercentage.toFixed(1)}%)
                              </Badge>
                            )}
                            {expandedSells[sellId] ? (
                              <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="h-5 w-5 transition-transform duration-200" />
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-slate-500">Date:</p>
                            <p>{hasTaxReport 
                              ? taxReport.sellTransaction.timestampText 
                              : sellTx.date}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Total:</p>
                            <p>{hasTaxReport 
                              ? formatCurrency(taxReport.sellTransaction.assetValueFiat)
                              : `$${sellTx.total.toFixed(2)}`}</p>
                          </div>
                          <div>
                            <div className="flex items-center">
                              <p className="text-sm text-slate-500">Tax Method:</p>
                              <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <InfoIcon className="h-4 w-4 ml-1 text-slate-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={5}>
                                    <p>Determines how buy transactions are selected</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <p>{taxMethods[sellId]}</p>
                          </div>
                          
                          {hasTaxReport && taxReport.usedBuyTransactions.length > 0 && (
                            <div>
                              <p className="text-sm text-slate-500">Predominant Tax Type:</p>
                              <Badge variant="outline" className={
                                taxReport.usedBuyTransactions[0].taxType === TaxType.LONG_TERM 
                                  ? "border-green-500 text-green-700"
                                  : "border-blue-500 text-blue-700"
                              }>
                                {taxReport.usedBuyTransactions[0].taxType}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {hasTaxReport && (
                          <div className="mt-4 grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-sm text-slate-500">Proceeds:</p>
                              <p className="text-lg font-medium">
                                {formatCurrency(taxReport.proceeds)}
                              </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-sm text-slate-500">Cost Basis:</p>
                              <p className="text-lg font-medium">
                                {formatCurrency(taxReport.costBasis)}
                              </p>
                            </div>
                            <div className={cn(
                              "p-3 rounded-lg",
                              taxReport.gain.amount > 0 
                                ? "bg-green-50" 
                                : taxReport.gain.amount < 0 
                                  ? "bg-red-50" 
                                  : "bg-slate-50"
                            )}>
                              <p className="text-sm text-slate-500">Taxable Gain:</p>
                              <p className={cn(
                                "text-lg font-medium",
                                taxReport.gain.amount > 0 
                                  ? "text-green-600" 
                                  : taxReport.gain.amount < 0 
                                    ? "text-red-600" 
                                    : ""
                              )}>
                                {formatCurrency(taxReport.gain)}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {hasTaxReport && !hasSufficientCoverage && taxReport.uncoveredSellAmount && (
                          <div className="mt-4 flex items-center">
                            <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 p-3 rounded-r-lg flex items-start w-full">
                              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                              <div>
                                <p>
                                  <strong>Uncovered amount:</strong> {taxReport.uncoveredSellAmount.amount.toFixed(6)} {taxReport.uncoveredSellAmount.unit}
                                </p>
                                {taxReport.uncoveredSellValue && (
                                  <p>
                                    <strong>Value:</strong> {formatCurrency(taxReport.uncoveredSellValue)}
                                  </p>
                                )}
                                <p className="mt-1">
                                  The uncovered portion will be treated as short term with a cost basis of $0.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedSells[sellId] && hasTaxReport && taxReport.usedBuyTransactions.length > 0 && (
                    <div className={cn(
                      "overflow-hidden transition-all duration-300",
                      expandedSells[sellId] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="p-4 bg-white">
                        <h4 className="text-md font-medium mb-3">Used Buy Transactions</h4>
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader className="bg-slate-100">
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount Used</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Cost Basis</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Tax Type</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {taxReport.usedBuyTransactions.map((buyTx: UsedBuyTransaction) => {
                                const originalTx = buyTx.originalTransaction;
                                
                                return (
                                  <TableRow key={buyTx.transactionId} className="hover:bg-slate-50">
                                    <TableCell>{originalTx.timestampText}</TableCell>
                                    <TableCell>
                                      {buyTx.amountUsed.amount.toFixed(6)} {buyTx.amountUsed.unit}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(
                                        originalTx.assetValueFiat.amount / originalTx.assetAmount.amount
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(buyTx.costBasis)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">{originalTx.source}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={
                                        buyTx.taxType === TaxType.LONG_TERM 
                                          ? "border-green-500 text-green-700"
                                          : "border-blue-500 text-blue-700"
                                      }>
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      
      <style jsx global>{`
        .animate-pulse-light {
          animation: pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse-light {
          0%, 100% {
            background-color: white;
          }
          50% {
            background-color: rgb(239, 246, 255);
          }
        }
      `}</style>
    </Card>
  );
}
