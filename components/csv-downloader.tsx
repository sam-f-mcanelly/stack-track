"use client"

import { Button } from "@/components/ui/button"

export function CsvDownloader() {
  const handleDownload = () => {
    // Here you would typically fetch the data from your server
    // and generate a CSV file
    console.log("Downloading CSV")
  }

  return <Button onClick={handleDownload}>Download Transactions</Button>
}

