import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function TaxPageInstructions() {
  return (
    <Card className="relative">
      <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 rounded-tl rounded-br text-sm font-semibold shadow-md">
        Start Here
      </div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Tax Report Generation Instructions</CardTitle>
        <CardDescription>Follow these steps to generate your tax report for the current year</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="instructions">
            <AccordionTrigger className="text-lg font-semibold">View Instructions</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <p>
                  This page is designed to help you generate tax reports for the current year based on your
                  cryptocurrency transactions.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Unreported Sell Transactions</h3>
                <p>
                  The table below shows a list of all unreported sell transactions for the current year. Each sell
                  transaction needs to be configured and added to the report.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Steps to Generate a Report</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Review the list of unreported sell transactions in the table below.</li>
                  <li>Select all sell transactions you want to add to the report.</li>
                  <li>Choose a tax lot selection method (FIFO, LIFO, or Custom) for each transaction.</li>
                  <li>If using Custom, click configure to select buy transactions to associate with the sell transaction.</li>
                  <li>Repeat for all relevant sell transactions.</li>
                  <li>Click the "Generate Report" button to create your tax report.</li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Configuration Options</h3>
                <p className="mb-2">When configuring a sell transaction, you have three tax lot selection methods:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="font-semibold">FIFO (First In, First Out):</span> The oldest buy transactions are
                    used first.
                  </li>
                  <li>
                    <span className="font-semibold">LIFO (Last In, First Out):</span> The most recent buy transactions
                    are used first.
                  </li>
                  <li>
                    <span className="font-semibold">Custom:</span> You can manually select any buy transactions. Takes precedence over others
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

