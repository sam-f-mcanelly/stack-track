"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface TaxReport {
  id: string
  year: number
  buyDate: string
  sellDate: string
  avgBuyPrice: number
  sellPrice: number
  relatedTransactions: string[]
}

const mockReports: TaxReport[] = [
  {
    id: "report1",
    year: 2023,
    buyDate: "2023-01-15",
    sellDate: "2023-05-10",
    avgBuyPrice: 20000,
    sellPrice: 30000,
    relatedTransactions: ["buy1", "buy2", "sell1"],
  },
  {
    id: "report2",
    year: 2023,
    buyDate: "2023-02-20",
    sellDate: "2023-06-15",
    avgBuyPrice: 22000,
    sellPrice: 28000,
    relatedTransactions: ["buy3", "sell2"],
  },
]

interface TaxReportsProps {
  onLoadReport: (reportId: string) => Promise<void>
}

export function TaxReports({ onLoadReport }: TaxReportsProps) {
  const [reports] = useState<TaxReport[]>(mockReports)
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null)

  const handleLoadReport = async (reportId: string) => {
    setLoadingReportId(reportId)
    try {
      await onLoadReport(reportId)
    } finally {
      setLoadingReportId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Report History</CardTitle>
        <CardDescription>Summary of previously generated tax reports</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Buy Date</TableHead>
              <TableHead>Sell Date</TableHead>
              <TableHead>Avg. Buy Price</TableHead>
              <TableHead>Sell Price</TableHead>
              <TableHead>Related Transactions</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.year}</TableCell>
                <TableCell>{report.buyDate}</TableCell>
                <TableCell>{report.sellDate}</TableCell>
                <TableCell>${report.avgBuyPrice.toFixed(2)}</TableCell>
                <TableCell>${report.sellPrice.toFixed(2)}</TableCell>
                <TableCell>{report.relatedTransactions.join(", ")}</TableCell>
                <TableCell>
                  <Button onClick={() => handleLoadReport(report.id)} disabled={loadingReportId === report.id}>
                    {loadingReportId === report.id ? "Loading..." : "Load"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

