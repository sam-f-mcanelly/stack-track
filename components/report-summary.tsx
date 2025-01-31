import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { SellReportSummary } from "@/models/tax"
import { ChevronDown, ChevronRight, InfoIcon, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ReportSummaryProps {
  selectedSellTransactions: string[]
  sellTransactions: any[]
  sellToBuyTransactions: Record<string, string[]>
  taxMethods: Record<string, string>
  buyTransactions: any[]
  onGenerateReport: () => void
  taxReports: Record<string, SellReportSummary>
}

export function ReportSummary({
  selectedSellTransactions,
  sellTransactions,
  sellToBuyTransactions,
  taxMethods,
  buyTransactions,
  onGenerateReport,
  taxReports,
}: ReportSummaryProps) {
  const [expandedSells, setExpandedSells] = useState<Record<string, boolean>>({})

  useEffect(() => {
    console.log("ReportSummary props updated:", {
      selectedSellTransactions,
      sellTransactions,
      sellToBuyTransactions,
      taxMethods,
      buyTransactions,
      taxReports,
    })
  }, [selectedSellTransactions, sellTransactions, sellToBuyTransactions, taxMethods, buyTransactions, taxReports])

  useEffect(() => {
    setExpandedSells((prevExpanded) => {
      const newExpandedSells = { ...prevExpanded }
      selectedSellTransactions.forEach((id) => {
        if (!(id in newExpandedSells)) {
          newExpandedSells[id] = false
        }
      })
      return newExpandedSells
    })
  }, [selectedSellTransactions])

  const toggleExpand = (id: string) => {
    console.log(`Toggling expand for sell transaction: ${id}`)
    setExpandedSells((prev) => {
      const newState = { ...prev, [id]: !prev[id] }
      console.log("New expandedSells state:", newState)
      return newState
    })
  }

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
            const sellTx = sellTransactions.find((tx) => tx.id === sellId)
            const taxReport = taxReports[sellId]
            if (!sellTx) return null

            return (
              <div
                key={sellId}
                className={cn(
                  "mb-4 rounded-lg p-4 relative overflow-hidden",
                  taxReport?.isComplete
                    ? "complete-card border-l-4 border-l-green-500"
                    : "incomplete-card border-2 border-red-500",
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
                        <p>Taxable Gain: ${taxReport.profit.amount.toFixed(2)}</p>
                      </div>
                    )}
                    {!taxReport?.isComplete && (
                    <div className="ml-4 flex items-center">
                      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p>
                          Note: The buys selected do not cover the entirety of this sell. Please configure more buys.
                        </p>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
                {expandedSells[sellId] && (
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(sellToBuyTransactions[sellId] || []).map((buyId) => {
                        const buyTx = buyTransactions.find((tx) => tx.id.toString() === buyId)
                        if (!buyTx) return null

                        return (
                          <TableRow key={buyId}>
                            <TableCell>{buyTx.date}</TableCell>
                            <TableCell>{buyTx.amount}</TableCell>
                            <TableCell>${buyTx.price.toFixed(2)}</TableCell>
                            <TableCell>${buyTx.total.toFixed(2)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            )
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
  )
}

