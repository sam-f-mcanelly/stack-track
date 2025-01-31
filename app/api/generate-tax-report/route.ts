import { NextResponse } from "next/server"
import type { TaxReportInput } from "@/utils/taxReportGenerator"

export async function POST(request: Request) {
  const body: TaxReportInput = await request.json()

  // Process the tax report input
  console.log("Received tax report input:", body)

  // In a real application, you would perform calculations and generate the report here
  const mockReport = {
    id: "generated-report-" + Date.now(),
    generatedAt: new Date().toISOString(),
    totalTaxableGain: 0,
    transactions: body.sellTransactions.map((tx) => ({
      ...tx,
      taxableGain: tx.total - tx.amount * tx.price,
    })),
  }

  // Calculate total taxable gain
  mockReport.totalTaxableGain = mockReport.transactions.reduce((sum, tx) => sum + tx.taxableGain, 0)

  return NextResponse.json(mockReport)
}

