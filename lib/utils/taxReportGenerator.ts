import type { convertToTableTransaction } from "@/lib/utils/transactionConverter"

interface TaxReportInput {
  sellTransactions: {
    id: string
    date: string
    asset: string
    amount: number
    price: number
    total: number
    taxMethod: string
    term: string
    relatedBuyTransactions: string[]
  }[]
}

export function generateTaxReport(
  selectedSellTransactions: string[],
  sellToBuyTransactions: Record<string, string[]>,
  taxMethods: Record<string, string>,
  sellTransactions: ReturnType<typeof convertToTableTransaction>[],
): TaxReportInput {
  const reportInput: TaxReportInput = {
    sellTransactions: [],
  }

  for (const sellId of selectedSellTransactions) {
    const sellTx = sellTransactions.find((tx) => tx.id === sellId)
    if (sellTx) {
      reportInput.sellTransactions.push({
        id: sellTx.id,
        date: sellTx.date,
        asset: sellTx.asset,
        amount: sellTx.amount,
        price: sellTx.price,
        total: sellTx.total,
        taxMethod: taxMethods[sellId] || "FIFO",
        term: sellTx.term,
        relatedBuyTransactions: sellToBuyTransactions[sellId] || [],
      })
    }
  }

  return reportInput
}

