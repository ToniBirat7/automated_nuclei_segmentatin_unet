"use client";

import { useEffect, useState } from "react";
import { Download, RotateCcw } from "lucide-react";
import { SegmentationResult, base64ToUrl } from "@/lib/api";
import MetricsDisplay from "./MetricsDisplay";

interface ResultsPanelProps {
  result: SegmentationResult;
  originalFile: File;
  onReset: () => void;
}

const PANELS = [
  { key: "original", label: "Original" },
  { key: "segmentation_mask", label: "Binary Mask" },
  { key: "confidence_map", label: "Confidence Heatmap" },
  { key: "overlay_image", label: "Overlay" },
] as const;

function downloadImage(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export default function ResultsPanel({ result, originalFile, onReset }: ResultsPanelProps) {
  const [originalUrl, setOriginalUrl] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(originalFile);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [originalFile]);

  const getUrl = (key: string): string => {
    if (key === "original") return originalUrl;
    return base64ToUrl(result[key as keyof SegmentationResult] as string);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-100">Segmentation Results</h2>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700
            text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Analyze Another
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {PANELS.map(({ key, label }) => {
          const url = getUrl(key);
          const filename = `nuclei_${key}.png`;
          return (
            <div
              key={key}
              className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900"
            >
              {url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={label} className="w-full aspect-square object-cover" />
              )}
              {!url && (
                <div className="w-full aspect-square bg-slate-800 animate-pulse" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-between">
                <span className="text-xs text-slate-200 font-medium">{label}</span>
                {url && (
                  <button
                    onClick={() => downloadImage(url, filename)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                      p-1 rounded bg-slate-800/80 text-slate-300 hover:text-white"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MetricsDisplay
        nucleiCount={result.nuclei_count}
        inferenceTime={result.inference_time_ms}
      />
    </div>
  );
}
