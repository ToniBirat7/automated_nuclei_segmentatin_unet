"use client";

import { motion } from "framer-motion";

export default function PerformanceTable() {
  const sotas = [
    { model: "DeepLabV3+", accuracy: 91.2, precision: 88.7, recall: 89.1, iou: 80.5 },
    { model: "DeepResNet", accuracy: 94.6, precision: 88.6, recall: 81.7, iou: 85.3 },
    { model: "Proposed U-Net", accuracy: 97.5, precision: 94.5, recall: 95.1, iou: 88.2, highlight: true },
  ];

  const splits = [
    { split: "Original", train: 670, val: 10, test: 60, iou: 0.88 },
    { split: "80-10-10", train: 592, val: 74, test: 74, iou: 0.85 },
    { split: "70-20-10", train: 518, val: 148, test: 74, iou: 0.83 },
  ];

  return (
    <div className="space-y-8">
      {/* SOTA comparison */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3 font-mono">
          Comparison with State-of-the-Art
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                {["Model", "Accuracy", "Precision", "Recall", "IoU"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sotas.map((row, i) => (
                <motion.tr
                  key={row.model}
                  className={`border-b border-slate-800/50 ${
                    row.highlight
                      ? "bg-cyan-950/30 border-l-2 border-l-cyan-500"
                      : "bg-slate-900/30"
                  }`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <td className={`px-4 py-3 font-medium ${row.highlight ? "text-cyan-300" : "text-slate-300"}`}>
                    {row.model}
                    {row.highlight && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-cyan-900/60 text-cyan-400 rounded font-mono">
                        OURS
                      </span>
                    )}
                  </td>
                  {[row.accuracy, row.precision, row.recall, row.iou].map((v, j) => (
                    <td key={j} className={`px-4 py-3 font-mono ${row.highlight ? "text-cyan-200 font-semibold" : "text-slate-400"}`}>
                      {v}%
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset split robustness */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3 font-mono">
          Robustness Across Dataset Splits
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                {["Split", "Train", "Val", "Test", "IoU"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {splits.map((row, i) => (
                <motion.tr
                  key={row.split}
                  className="border-b border-slate-800/50 bg-slate-900/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <td className="px-4 py-3 text-slate-300 font-medium">{row.split}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{row.train}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{row.val}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{row.test}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">{row.iou}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
