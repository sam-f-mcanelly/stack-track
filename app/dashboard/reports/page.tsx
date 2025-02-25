"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionFlowchart } from "@/components/tax/transaction-flowchart"
import { TransactionDetails } from "@/components/tax/transaction-details"
import { mockTransactionData } from "@/lib/mock-data"
import { TaxReports } from "@/components/tax/tax-reports"
import { toast } from "@/components/ui/use-toast"

export default function ReportsPage() {
  const [transactions, setTransactions] = useState(mockTransactionData)

  const handleLoadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/tax-report/${reportId}`)
      if (!response.ok) {
        throw new Error("Failed to load tax report")
      }
      const data = await response.json()
      setTransactions(data.transactions)
      toast({
        title: "Report Loaded",
        description: `Tax report ${reportId} has been loaded successfully.`,
      })
    } catch (error) {
      console.error("Error loading tax report:", error)
      toast({
        title: "Error",
        description: "Failed to load tax report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight gradient-bg text-transparent bg-clip-text">
          Tax Report History
        </h2>
      </div>
      <TaxReports onLoadReport={handleLoadReport} />
      <Card>
        <CardHeader>
          <CardTitle>Tax Relationships</CardTitle>
          <CardDescription>
            Visualize the relationships between buy and sell transactions for tax purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionFlowchart transactions={transactions} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>Detailed information about each transaction and its tax implications.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionDetails transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  )
}

