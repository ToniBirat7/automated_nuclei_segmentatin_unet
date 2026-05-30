"use client";

import { useEffect, useState } from "react";
import { Hash, Clock, Cpu, Activity } from "lucide-react";

interface MetricsDisplayProps {
  nucleiCount: number;
  inferenceTime: number;
}

function AnimatedNumber({ target, duration = 800 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const steps = 40;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{current}</>;
}

export default function MetricsDisplay({ nucleiCount, inferenceTime }: MetricsDisplayProps) {
  const metrics = [
    {
      icon: Hash,
      label: "Nuclei Detected",
      value: nucleiCount,
      unit: "",
      color: "text-cyan-400",
      bg: "bg-cyan-950/40",
      border: "border-cyan-900",
    },
    {
      icon: Clock,
      label: "Inference Time",
      value: Math.round(inferenceTime),
      unit: "ms",
      color: "text-emerald-400",
      bg: "bg-emerald-950/40",
      border: "border-emerald-900",
    },
    {
      icon: Cpu,
      label: "Model Parameters",
      value: 194,
      unit: "× 10⁴",
      color: "text-violet-400",
      bg: "bg-violet-950/40",
      border: "border-violet-900",
    },
    {
      icon: Activity,
      label: "Val IoU Score",
      value: 88,
      unit: "%",
      color: "text-amber-400",
      bg: "bg-amber-950/40",
      border: "border-amber-900",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {metrics.map(({ icon: Icon, label, value, unit, color, bg, border }) => (
        <div
          key={label}
          className={`rounded-xl border ${border} ${bg} p-4`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-xs text-slate-400 font-medium">{label}</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${color}`}>
            <AnimatedNumber target={value} />
            <span className="text-sm ml-1 font-normal text-slate-400">{unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
