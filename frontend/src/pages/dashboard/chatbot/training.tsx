import React, { useState } from 'react';
import DashboardLayout from '@layouts/DashboardLayout';
import { chatbotApi } from '@api/endpoints';
import { UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Training() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const res: any = await chatbotApi.uploadDocument(file);
      setStatus({ type: 'success', message: res?.message || 'File processed successfully!' });
      setFile(null);
    } catch (err: any) {
      setStatus({ type: 'error', message: err?.response?.data?.error || 'Failed to upload document.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Training Center</h1>
          <p className="text-gray-500">Upload documents (PDF, DOCX, TXT) to bulk-train the AI Chatbot.</p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-100">
          <Link href="/dashboard/chatbot" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md">
            Overview Settings
          </Link>
          <Link href="/dashboard/chatbot/knowledge" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md">
            Manage Knowledge Base
          </Link>
          <Link href="/dashboard/chatbot/training" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md">
            Upload Documents
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-6">
          <div 
            className="border-2 border-dashed border-primary-200 bg-primary-50/30 hover:bg-primary-50 transition-colors rounded-2xl p-12 text-center cursor-pointer relative"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
              }
            }}
          >
            <input 
              type="file" 
              accept=".pdf,.docx,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center text-primary-500 mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Drag & Drop or Click to Upload</h3>
              <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, DOCX, TXT. Max size: 10MB</p>
            </div>
          </div>

          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={handleUpload}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors"
              >
                {loading ? 'Processing...' : 'Train AI Now'}
              </button>
            </div>
          )}

          {status.type === 'success' && (
            <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold">Training Complete</p>
                <p className="text-sm">{status.message}</p>
                <Link href="/dashboard/chatbot/knowledge" className="text-emerald-700 underline text-sm mt-2 block font-medium">
                  Review extracted knowledge
                </Link>
              </div>
            </div>
          )}

          {status.type === 'error' && (
            <div className="mt-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold">Processing Failed</p>
                <p className="text-sm">{status.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
