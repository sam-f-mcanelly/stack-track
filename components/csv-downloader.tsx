"use client";

import { Button } from "@/components/ui/button";

export function CsvDownloader() {
  const handleDownload = async () => {
    try {
      const response = await fetch("http://localhost:90/api/data/download", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : "transactions.json";

      // Convert response to Blob
      const blob = await response.blob();

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  return <Button onClick={handleDownload}>Download Transactions</Button>;
}
