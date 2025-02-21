"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CsvUploader() {
  const [files, setFiles] = useState<FileList | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files)
    }
  }

  const handleUpload = async () => {
    if (!files) {
      alert("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://192.168.68.75:3090/api/data/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Files uploaded successfully.");
      } else {
        alert("Failed to upload files.");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("An error occurred while uploading files.");
    }
  }

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Input id="picture" type="file" multiple accept=".csv" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={!files}>
        Upload
      </Button>
    </div>
  )
}

