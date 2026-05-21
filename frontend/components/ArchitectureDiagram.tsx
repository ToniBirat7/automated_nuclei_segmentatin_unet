"use client";

export default function ArchitectureDiagram() {
  const encoderBlocks = [
    { ch: "16", size: "256" },
    { ch: "32", size: "128" },
    { ch: "64", size: "64" },
    { ch: "128", size: "32" },
    { ch: "256", size: "16" },
  ];
  const decoderBlocks = [
    { ch: "128", size: "32" },
    { ch: "64", size: "64" },
    { ch: "32", size: "128" },
    { ch: "16", size: "256" },
  ];

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="min-w-[700px] flex flex-col items-center gap-2">
        {/* Input */}
        <div className="flex items-center gap-1">
          <div className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900 text-xs font-mono text-slate-400">
            Input 256×256×3
          </div>
        </div>

        {/* Main diagram */}
        <div className="flex items-end gap-1 relative">
          {/* Encoder */}
          {encoderBlocks.map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="flex flex-col items-center justify-center rounded-lg border border-blue-800 bg-blue-950/60 font-mono text-blue-300 text-xs"
                style={{
                  width: `${44 + i * 8}px`,
                  height: `${44 + i * 8}px`,
                }}
              >
                <span className="font-bold">{b.ch}</span>
                <span className="text-blue-500 text-[10px]">{b.size}px</span>
              </div>
              {i < 4 && (
                <div className="text-slate-600 text-[10px] font-mono">↓pool</div>
              )}
            </div>
          ))}

          {/* Separator */}
          <div className="w-3" />

          {/* Decoder */}
          {decoderBlocks.map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="text-amber-600 text-[10px] font-mono">↑up</div>
              <div
                className="flex flex-col items-center justify-center rounded-lg border border-teal-800 bg-teal-950/60 font-mono text-teal-300 text-xs"
                style={{
                  width: `${80 - i * 8}px`,
                  height: `${80 - i * 8}px`,
                }}
              >
                <span className="font-bold">{b.ch}</span>
                <span className="text-teal-500 text-[10px]">{b.size}px</span>
              </div>
            </div>
          ))}
        </div>

        {/* Skip connection legend */}
        <div className="flex items-center gap-6 mt-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-blue-700 bg-blue-950/60" />
            <span className="text-slate-500">Encoder block</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-teal-700 bg-teal-950/60" />
            <span className="text-slate-500">Decoder block</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 border-t border-dashed border-amber-600" />
            <span className="text-slate-500">Skip connection</span>
          </div>
        </div>

        {/* Output */}
        <div className="flex items-center gap-1">
          <div className="px-3 py-1.5 rounded border border-emerald-800 bg-emerald-950/40 text-xs font-mono text-emerald-400">
            Output 256×256×1 (sigmoid)
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-1 text-[11px] text-slate-500 font-mono">
          <span>~1.94M params</span>
          <span>•</span>
          <span>5 encoder + 4 decoder blocks</span>
          <span>•</span>
          <span>He Normal init</span>
          <span>•</span>
          <span>ReLU + Dropout</span>
        </div>
      </div>
    </div>
  );
}
