"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronDown, ChevronUp, Microscope, Zap, Target, Brain } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import SampleImages from "@/components/SampleImages";
import ResultsPanel from "@/components/ResultsPanel";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import PerformanceTable from "@/components/PerformanceTable";
import { segmentImage, SegmentationResult } from "@/lib/api";

const HERO_METRICS = [
  { label: "Accuracy", value: "97.5%", icon: Target, color: "text-cyan-400" },
  { label: "IoU Score", value: "0.88", icon: Zap, color: "text-emerald-400" },
  { label: "Inference", value: "~99ms", icon: Zap, color: "text-violet-400" },
  { label: "Parameters", value: "1.94M", icon: Brain, color: "text-amber-400" },
];

export default function Home() {
  const [result, setResult] = useState<SegmentationResult | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techOpen, setTechOpen] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setOriginalFile(file);
    setIsProcessing(true);

    try {
      const res = await segmentImage(file);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Segmentation failed. Is the backend running?");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleReset = () => {
    setResult(null);
    setOriginalFile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">

        {/* === HERO === */}
        <motion.section
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          {/* Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="px-3 py-1 text-xs font-mono border border-slate-700 rounded-full text-slate-400 bg-slate-900/60">
              KEC Conference 2025
            </span>
            <span className="px-3 py-1 text-xs font-mono border border-cyan-900 rounded-full text-cyan-400 bg-cyan-950/40">
              InJET Published
            </span>
            <a
              href="https://doi.org/10.3126/injet.v2i2.78595"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-xs font-mono border border-slate-700 rounded-full text-slate-500 hover:text-slate-300 bg-slate-900/60 flex items-center gap-1 transition-colors"
            >
              DOI <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Microscope className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Automated Nuclei
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                Segmentation
              </span>
            </h1>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Deep learning U-Net model for automated cell nucleus detection in microscopy images.
              Upload your image and get instant segmentation masks with confidence heatmaps.
            </p>
          </div>

          {/* Metric strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {HERO_METRICS.map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* === UPLOAD / RESULTS === */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {result && originalFile ? (
              <ResultsPanel
                key="results"
                result={result}
                originalFile={originalFile}
                onReset={handleReset}
              />
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <UploadZone onFileSelect={handleFile} isProcessing={isProcessing} />

                {/* Processing indicator */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-cyan-900 bg-cyan-950/30"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-cyan-300 font-mono">
                        Segmenting nuclei...
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-xl border border-red-900 bg-red-950/30 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <SampleImages onSelect={handleFile} isProcessing={isProcessing} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* === MODEL ARCHITECTURE === */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <h2 className="text-sm font-mono text-slate-500 uppercase tracking-widest">
              Architecture
            </h2>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-1">U-Net Architecture</h3>
            <p className="text-sm text-slate-500 mb-6">
              Symmetric encoder-decoder with skip connections. 1.94M trainable parameters.
              Input 256×256 RGB → Output 256×256 binary mask.
            </p>
            <ArchitectureDiagram />
          </div>
        </section>

        {/* === PERFORMANCE === */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <h2 className="text-sm font-mono text-slate-500 uppercase tracking-widest">
              Performance
            </h2>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <PerformanceTable />
          </div>
        </section>

        {/* === TECHNICAL DETAILS (COLLAPSIBLE) === */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <button
            onClick={() => setTechOpen(!techOpen)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-800/30 transition-colors"
          >
            <span className="text-sm font-mono text-slate-400 uppercase tracking-widest">
              Technical Details
            </span>
            {techOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <AnimatePresence>
            {techOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-6 border-t border-slate-800">
                  <div className="grid sm:grid-cols-2 gap-6 pt-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Preprocessing Pipeline</h4>
                      <ol className="space-y-1 text-sm text-slate-500">
                        <li className="flex gap-2"><span className="text-cyan-600 font-mono">1.</span> Resize to 256×256 (LANCZOS)</li>
                        <li className="flex gap-2"><span className="text-cyan-600 font-mono">2.</span> Gaussian filter σ=1.5 (noise reduction)</li>
                        <li className="flex gap-2"><span className="text-cyan-600 font-mono">3.</span> Normalize pixel values ÷ 255</li>
                        <li className="flex gap-2"><span className="text-cyan-600 font-mono">4.</span> Forward pass through U-Net</li>
                        <li className="flex gap-2"><span className="text-cyan-600 font-mono">5.</span> Threshold at 0.5 → binary mask</li>
                        <li className="flex gap-2"><span className="text-cyan-600 font-mono">6.</span> Count connected components</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Explainability</h4>
                      <div className="space-y-3 text-sm text-slate-500">
                        <div>
                          <span className="text-amber-400 font-medium">Grad-CAM</span> — attention heatmaps showing
                          which regions influenced predictions. Consistently highlights nuclear boundaries (red)
                          vs background (blue).
                        </div>
                        <div>
                          <span className="text-violet-400 font-medium">LRP</span> — pixel-wise relevance
                          propagation. Mean relevance 0.45, confidence score 0.902. Confirms model
                          focuses on biologically meaningful nuclear features.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Dataset</h4>
                    <p className="text-sm text-slate-500">
                      2018 Kaggle Data Science Bowl nuclei dataset — 740 microscopy images (670 train / 10 val / 60 test).
                      Stratified sampling across imaging modalities and nuclear densities. Mean 71±9 nuclei per image.
                      ~27% of images contain significant nuclear overlap.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* === FOOTER === */}
        <footer className="text-center space-y-2 pb-8">
          <p className="text-xs text-slate-600 font-mono">
            Birat Gautam · Prakash Gautam · Sunway College Kathmandu
          </p>
          <p className="text-xs text-slate-700 font-mono">
            InJET Special Issue, KEC Conference 2025 ·{" "}
            <a
              href="https://doi.org/10.3126/injet.v2i2.78595"
              className="text-slate-600 hover:text-slate-400 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              DOI: 10.3126/injet.v2i2.78595
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
