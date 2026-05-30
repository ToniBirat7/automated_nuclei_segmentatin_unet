"use client";

import { useEffect, useState } from "react";
import { fetchSamples, SampleImage } from "@/lib/api";

const FALLBACK_SAMPLES: SampleImage[] = [
  { name: "sample_01.png", url: "/samples/sample_01.png", description: "Dense nuclei — fluorescence" },
  { name: "sample_02.png", url: "/samples/sample_02.png", description: "Dense nuclei — high overlap" },
  { name: "sample_03.png", url: "/samples/sample_03.png", description: "Mixed density — varied sizes" },
  { name: "sample_04.png", url: "/samples/sample_04.png", description: "High contrast brightfield" },
  { name: "sample_05.png", url: "/samples/sample_05.png", description: "Fluorescence — medium density" },
  { name: "sample_06.png", url: "/samples/sample_06.png", description: "Phase contrast imaging" },
];

interface SampleImagesProps {
  onSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function SampleImages({ onSelect, isProcessing }: SampleImagesProps) {
  const [samples, setSamples] = useState<SampleImage[]>(FALLBACK_SAMPLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSamples()
      .then((s) => {
        if (s.length > 0) setSamples(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (sample: SampleImage) => {
    if (isProcessing || !sample.url) return;
    try {
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const file = new File([blob], sample.name, { type: blob.type || "image/png" });
      onSelect(file);
    } catch {
      // silently ignore if sample fetch fails
    }
  };

  return (
    <div className="w-full">
      <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest font-mono">
        Or try a sample image
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-slate-800 animate-pulse border border-slate-800"
              />
            ))
          : samples.map((sample) => (
              <button
                key={sample.name}
                onClick={() => handleSelect(sample)}
                disabled={isProcessing || !sample.url}
                className={`group relative aspect-square rounded-lg overflow-hidden border border-slate-800
                  hover:border-cyan-600 hover:scale-105 transition-all duration-200
                  ${isProcessing ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                  ${!sample.url ? "opacity-30 cursor-not-allowed" : ""}`}
                title={sample.description}
              >
                {sample.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sample.url}
                    alt={sample.description}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-slate-600 text-xs font-mono">{sample.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-cyan-900/0 group-hover:bg-cyan-900/30 transition-colors" />
              </button>
            ))}
      </div>
    </div>
  );
}
