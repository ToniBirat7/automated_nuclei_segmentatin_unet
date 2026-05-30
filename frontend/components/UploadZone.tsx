"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, ImageIcon, AlertCircle, FileImage } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) return;
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length > 0) {
        setError(rejected[0].errors[0].message);
        return;
      }
      if (accepted.length > 0) {
        setSelectedFile(accepted[0]);
        onFileSelect(accepted[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isProcessing,
  });

  if (isProcessing && selectedFile && previewUrl) {
    return (
      <div className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-200 truncate">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatBytes(selectedFile.size)}</p>
          </div>
          <FileImage className="w-5 h-5 text-cyan-400 flex-shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
          isDragActive
            ? "border-cyan-400 bg-cyan-950/20"
            : "border-slate-700 hover:border-cyan-600 bg-slate-900/50"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center py-16 px-8 gap-4">
          <div className={`p-4 rounded-full ${isDragActive ? "bg-cyan-900/40" : "bg-slate-800"}`}>
            {isDragActive ? (
              <ImageIcon className="w-10 h-10 text-cyan-400" />
            ) : (
              <Upload className="w-10 h-10 text-slate-400" />
            )}
          </div>

          <div className="text-center">
            <p className={`text-lg font-medium ${isDragActive ? "text-cyan-300" : "text-slate-200"}`}>
              {isDragActive ? "Release to analyze" : "Drop microscopy image here"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              or <span className="text-cyan-400 underline underline-offset-2">click to browse</span>
            </p>
          </div>

          <div className="flex gap-2 mt-2">
            {["PNG", "JPG", "TIFF", "BMP"].map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 text-xs font-mono text-slate-400 border border-slate-700 rounded"
              >
                {fmt}
              </span>
            ))}
            <span className="px-2 py-0.5 text-xs font-mono text-slate-500 border border-slate-800 rounded">
              max 10MB
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
