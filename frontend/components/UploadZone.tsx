"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null);
      if (rejected.length > 0) {
        setError(rejected[0].errors[0].message);
        return;
      }
      if (accepted.length > 0) onFileSelect(accepted[0]);
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

        {/* Animated scanning border when dragging */}
        {isDragActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-cyan-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

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

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-3 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
