import { NextResponse } from "next/server"
import { mockTransactionData } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real application, you would fetch the report data from a database
  // For this example, we'll just return the mock data with a slight modification
  const modifiedData = mockTransactionData.map((tx) => ({
    ...tx,
    notes: `${tx.notes} (Loaded from report ${id})`,
  }))

  return NextResponse.json({ transactions: modifiedData })
}

