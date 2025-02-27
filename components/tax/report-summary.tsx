import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, InfoIcon, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TaxableEventResult } from "@/lib/services/tax-service-backend";

interface ReportSummaryProps {
  selectedSellTransactions: string[];
  sellTransactions: any[];
  sellToBuyTransactions: Record<string, string[]>;
  taxMethods: Record<string, string>;
  onGenerateReport: () => void;
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

  useEffect(() => {
    console.log("ReportSummary props updated:", {
      selectedSellTransactions,
      sellTransactions,
      sellToBuyTransactions,
      taxMethods,
      taxReports,
    });
  }, [selectedSellTransactions, sellTransactions, sellToBuyTransactions, taxMethods, taxReports]);

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

  const toggleExpand = (id: string) => {
    console.log(`Toggling expand for sell transaction: ${id}`);
    setExpandedSells((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      console.log("New expandedSells state:", newState);
      return newState;
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tax Report Summary</CardTitle>
          <Button onClick={onGenerateReport} className="bg-green-500 hover:bg-green-600 text-white font-bold">
            Generate Report
          </Button>
        </div>
        <CardDescription>Summary of transactions selected for the tax report</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedSellTransactions.length === 0 ? (
          <p>Select a sell transaction to add it to the report</p>
        ) : (
          selectedSellTransactions.map((sellId) => {
            const sellTx = sellTransactions.find((tx) => tx.id === sellId);
            const taxReport = taxReports[sellId];
            if (!sellTx) return null;

            // Check if we have complete coverage
            const isComplete = taxReport && taxReport.usedBuyTransactions.length > 0;
            
            // Calculate total amount covered by buy transactions
            const totalCovered = taxReport?.usedBuyTransactions.reduce(
              (sum, buyTx) => sum + buyTx.amountUsed, 0
            ) || 0;

            // Determine if coverage is complete
            const hasSufficientCoverage = totalCovered >= sellTx.amount;

            return (
              <div
                key={sellId}
                className={cn(
                  "mb-4 rounded-lg p-4 relative overflow-hidden",
                  hasSufficientCoverage
                    ? "complete-card border-l-4 border-l-green-500"
                    : "incomplete-card border-2 border-red-500"
                )}
              >
                <div className="flex">
                  <div className="flex-grow">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpand(sellId)}
                    >
                      <h3 className="text-lg font-semibold">
                        Sell: {sellTx.amount} {sellTx.asset} @ ${sellTx.price.toFixed(2)}
                      </h3>
                      {expandedSells[sellId] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                    <p>Date: {sellTx.date}</p>
                    <p>Total: ${sellTx.total.toFixed(2)}</p>
                    <div className="flex items-center">
                      <span>Tax Method: {taxMethods[sellId]}</span>
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="z-50" sideOffset={5}>
                            <p>Transactions will be selected automatically</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {taxReport && (
                      <div className="mt-2">
                        <p>Proceeds: ${taxReport.proceeds.amount.toFixed(2)}</p>
                        <p>Cost Basis: ${taxReport.costBasis.amount.toFixed(2)}</p>
                        <p>Taxable Gain: ${taxReport.gain.amount.toFixed(2)}</p>
                      </div>
                    )}
                    {!hasSufficientCoverage && (
                      <div className="ml-4 flex items-center mt-2">
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 flex items-start">
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <p>
                            Note: The buys selected do not cover the entirety of this sell. The remainder will be treated as short term with a cost basis of 0
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {expandedSells[sellId] && taxReport && (
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount Used</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Cost Basis</TableHead>
                        <TableHead>Tax Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taxReport.usedBuyTransactions.map((buyTx) => {
                        const originalTx = buyTx.originalTransaction;
                        
                        return (
                          <TableRow key={buyTx.transactionId}>
                            <TableCell>{originalTx.timestampText}</TableCell>
                            <TableCell>{buyTx.amountUsed.toFixed(6)} {originalTx.assetAmount.unit}</TableCell>
                            <TableCell>
                              ${(originalTx.assetValueFiat.amount / originalTx.assetAmount.amount).toFixed(2)}
                            </TableCell>
                            <TableCell>${buyTx.costBasis.toFixed(2)}</TableCell>
                            <TableCell>{buyTx.taxType}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            );
          })
        )}
      </CardContent>
      <style jsx>{`
        .complete-card {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .complete-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        .incomplete-card {
          box-shadow: 0 4px 6px rgba(255, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .incomplete-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(255, 0, 0, 0.15);
        }
      `}</style>
      <style jsx global>{`
        .z-50 {
          z-index: 50;
        }
      `}</style>
    </Card>
  );
}
