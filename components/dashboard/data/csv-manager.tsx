'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Download, Upload, FileText, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface CsvManagerProps {
  onUploadSuccess?: () => void;
  apiBaseUrl?: string;
}

export function CsvManager({
  onUploadSuccess,
  apiBaseUrl = 'http://localhost:3090/api/data',
}: CsvManagerProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({
    type: 'idle',
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
      setStatus({ type: 'idle', message: '' });
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFiles(null);
  };

  const handleUpload = async () => {
    if (!files) {
      setStatus({ type: 'error', message: 'Please select files to upload.' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'idle', message: '' });

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Files uploaded successfully!' });
        resetFileInput();
        onUploadSuccess?.();
      } else {
        const errorData = await response.json().catch(() => null);
        setStatus({
          type: 'error',
          message: errorData?.message || 'Failed to upload files. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setStatus({
        type: 'error',
        message: 'Network error occurred. Please check your connection.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch(`${apiBaseUrl}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'transactions.json';

      // Convert response to Blob
      const blob = await response.blob();

      // Create a download link and trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus({ type: 'success', message: 'Download completed successfully!' });
    } catch (error) {
      console.error('Error downloading data:', error);
      setStatus({
        type: 'error',
        message: 'Failed to download transactions. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto dark:border-gray-700">
      <CardHeader className="space-y-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 dark:opacity-5">
          <BitcoinAnimation />
        </div>
        <CardTitle className="text-2xl font-bold">Transaction Manager</CardTitle>
        <CardDescription>Upload your CSV files or download transaction data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="download" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid w-full items-center gap-4">
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only</p>
                </div>
                <Input
                  id="csv-upload"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {files && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {Array.from(files).map((file, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleUpload} disabled={!files || isUploading} className="w-full">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="download">
            <div className="flex flex-col items-center justify-center py-8">
              <BitcoinAnimation className="w-20 h-20 mb-4" />
              <p className="text-sm text-center mb-4 text-gray-600 dark:text-gray-400">
                Download your transaction data in CSV format
              </p>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="default"
                size="lg"
                className="w-full"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Transactions
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {status.type !== 'idle' && (
          <Alert
            variant={status.type === 'error' ? 'destructive' : 'default'}
            className={`mt-4 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-800' : ''}`}
          >
            {status.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <AlertTitle>{status.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Bitcoin Animation Component
function BitcoinAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="w-full h-full"
        initial={{ rotateY: 0 }}
        animate={{
          rotateY: 360,
          filter: [
            'drop-shadow(0 0 8px rgba(247, 147, 26, 0.5))',
            'drop-shadow(0 0 16px rgba(247, 147, 26, 0.3))',
            'drop-shadow(0 0 8px rgba(247, 147, 26, 0.5))',
          ],
        }}
        transition={{
          rotateY: {
            repeat: Infinity,
            duration: 6,
            ease: 'easeInOut',
          },
          filter: {
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
          },
        }}
      >
        <motion.g
          initial={{ opacity: 0.8 }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <circle cx="32" cy="32" r="30" fill="#F7931A" />
          <path
            d="M44.374 30.296c.603-4.013-2.456-6.173-6.636-7.608l1.355-5.434-3.31-.825-1.318 5.286c-.872-.217-1.766-.42-2.65-.622l1.327-5.318-3.307-.824-1.355 5.434a106.38 106.38 0 01-2.116-.498l.004-.015-4.564-1.14-.879 3.54s2.455.563 2.404.597c1.34.336 1.583 1.225 1.543 1.93l-1.545 6.202c.093.023.213.057.345.11l-.35-.087-2.165 8.682c-.164.407-.581.018-1.47-.378l-2.46.615 1.308 5.242c.772.197 1.525.403 2.27.599l-1.368 5.496 3.307.824 1.355-5.434c.904.244 1.782.47 2.646.684l-1.35 5.414 3.31.825 1.368-5.483c5.641 1.068 9.88.638 11.666-4.465 1.438-4.113-.071-6.485-3.037-8.033 2.161-.499 3.791-1.92 4.228-4.855zm-7.57 10.595c-1.023 4.113-7.935 1.89-10.175 1.331l1.817-7.286c2.24.56 9.419 1.67 8.358 5.955zm1.022-10.673c-.933 3.74-6.688 1.84-8.554 1.375l1.65-6.611c1.865.465 7.856 1.334 6.904 5.236z"
            fill="#FFFFFF"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}
