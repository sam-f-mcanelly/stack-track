import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  ArrowUpDown, 
  ListChecks, 
  Clock, 
  History, 
  Settings, 
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TaxPageInstructions() {
  return (
    <Card className="overflow-hidden border-t-4 border-t-blue-500 dark:border-t-blue-600 shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-green-600 dark:text-green-500" />
            <CardTitle>Tax Report Guide</CardTitle>
          </div>
          <Badge variant="outline" className="bg-white-50 text-black-700 border-blue-200 dark:bg-white-900/30 dark:text-back-400 dark:border-blue-800 px-3">
            2024 Tax Year
          </Badge>
        </div>
        <CardDescription className="mt-1">
          Generate accurate tax reports for your cryptocurrency transactions in just a few steps
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 pb-4 pt-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="instructions" className="border-none">
            <AccordionTrigger className="py-3 px-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center text-sm font-medium">
                <ListChecks className="h-4 w-4 mr-2 text-green-600 dark:text-green-500" />
                Quick Start Guide
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 text-sm">
                {/* Introduction */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                  <p>
                    This tool helps you generate tax reports by matching sell transactions with their corresponding buy transactions
                    using different accounting methods. Follow the steps below to prepare your cryptocurrency tax report.
                  </p>
                </div>
                
                {/* Steps */}
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center text-base">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600 dark:text-green-500" />
                    Steps to Generate a Report
                  </h3>
                  
                  <div className="ml-2 space-y-3">
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 text-xs font-bold mr-3">1</div>
                      <div>
                        <p className="font-medium">Select transactions to report</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Check the boxes next to the sell transactions you want to include in your tax report.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 text-xs font-bold mr-3">2</div>
                      <div>
                        <p className="font-medium">Choose tax methods for each transaction</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Select FIFO, LIFO, or CUSTOM from the dropdown for each transaction.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 text-xs font-bold mr-3">3</div>
                      <div>
                        <p className="font-medium">Configure custom selections (if needed)</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">If using CUSTOM method, click Configure to select specific buy transactions.</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-400 text-xs font-bold mr-3">4</div>
                      <div>
                        <p className="font-medium">Generate your report</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Click the "Generate Report" button to calculate gains/losses and create your report.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tax Methods Explanation */}
                <div>
                  <h3 className="font-medium flex items-center text-base">
                    <Settings className="h-4 w-4 mr-2 text-green-600 dark:text-green-500" />
                    Tax Methods Explained
                  </h3>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-500" />
                        <h4 className="font-medium">FIFO</h4>
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 ml-1 text-slate-400 dark:text-slate-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px]">First In, First Out - Oldest purchases are used first. Often results in lower taxes if asset has appreciated over time.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Oldest buy transactions are used first. Typically results in more long-term gains.</p>
                    </div>
                    
                    <div className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <History className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-500" />
                        <h4 className="font-medium">LIFO</h4>
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 ml-1 text-slate-400 dark:text-slate-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px]">Last In, First Out - Newest purchases are used first. May result in more short-term gains.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Newest buy transactions are used first. May minimize gains during market downturns.</p>
                    </div>
                    
                    <div className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <ArrowUpDown className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-500" />
                        <h4 className="font-medium">CUSTOM</h4>
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 ml-1 text-slate-400 dark:text-slate-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-[200px]">Custom selection lets you manually choose which buy transactions to match with each sell.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Manually select buy transactions. Offers most control over tax optimization.</p>
                    </div>
                  </div>
                </div>
                
                {/* Important notes */}
                <div className="bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500 dark:border-orange-600 p-3 rounded-r-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 dark:text-orange-300">Important Tax Notes</h4>
                      <ul className="mt-1 text-orange-800 dark:text-orange-300 space-y-1 list-disc pl-4">
                        <li>If you don't have enough buy transactions to cover a sell, the uncovered portion will be treated as having a $0 cost basis.</li>
                        <li>Assets held for more than one year qualify for long-term capital gains rates.</li>
                        <li>This report is for informational purposes. Consult a tax professional for advice.</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Report summary explanation */}
                <div>
                  <h3 className="font-medium flex items-center text-base">
                    <Calendar className="h-4 w-4 mr-2 text-green-600 dark:text-green-500" />
                    Report Summary Features
                  </h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    After generating your report, you'll see a summary of each transaction showing:
                  </p>
                  <ul className="mt-2 space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-400">
                    <li>Total proceeds from sales</li>
                    <li>Cost basis of the assets sold</li>
                    <li>Calculated gain or loss</li>
                    <li>Tax type (short-term or long-term)</li>
                    <li>Detailed breakdown of which buy transactions were used</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
