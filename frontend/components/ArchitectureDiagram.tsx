"use client";

const ENCODER = [
  { ch: "16", px: "256", h: 50 },
  { ch: "32", px: "128", h: 70 },
  { ch: "64", px: "64", h: 90 },
  { ch: "128", px: "32", h: 110 },
];
const BOTTLENECK = { ch: "256", px: "16", h: 140 };
const DECODER = [
  { ch: "128", px: "32", h: 110 },
  { ch: "64", px: "64", h: 90 },
  { ch: "32", px: "128", h: 70 },
  { ch: "16", px: "256", h: 50 },
];

const BW = 52;   // block width
const GAP = 14;  // gap between blocks
const BOTTOM = 270;
const TOTAL_BLOCKS = 9;
const TOTAL_W = TOTAL_BLOCKS * BW + (TOTAL_BLOCKS - 1) * GAP + 40; // 40 padding

function blockX(index: number) {
  return 20 + index * (BW + GAP);
}

export default function ArchitectureDiagram() {
  const encBlocks = ENCODER.map((b, i) => ({ ...b, x: blockX(i), index: i }));
  const bnBlock = { ...BOTTLENECK, x: blockX(4) };
  const decBlocks = DECODER.map((b, i) => ({ ...b, x: blockX(5 + i), index: i }));

  // Skip connections: E[i] ↔ D[3-i] — match by spatial resolution
  // E0(256px)↔D3(256px), E1(128px)↔D2(128px), E2(64px)↔D1(64px), E3(32px)↔D0(32px)
  const skipPairs = ENCODER.map((enc, i) => ({
    x1: blockX(i) + BW,          // right edge of encoder block
    x2: blockX(5 + (3 - i)),     // left edge of matching decoder block
    y: BOTTOM - enc.h / 2,        // mid-height of encoder block
  }));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${TOTAL_W} 320`}
        className="w-full min-w-[580px]"
        aria-label="U-Net architecture diagram"
      >
        {/* ── Skip connections (behind blocks) ── */}
        {skipPairs.map((s, i) => (
          <line
            key={`skip-${i}`}
            x1={s.x1} y1={s.y}
            x2={s.x2} y2={s.y}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="5 3"
            opacity="0.6"
          />
        ))}

        {/* ── Encoder blocks ── */}
        {encBlocks.map((b) => (
          <g key={`enc-${b.index}`}>
            {/* Pool arrow between blocks */}
            {b.index < 3 && (
              <text
                x={b.x + BW + GAP / 2}
                y={BOTTOM + 18}
                textAnchor="middle"
                fontSize="10"
                fill="#475569"
                fontFamily="monospace"
              >
                ↓
              </text>
            )}
            <rect
              x={b.x} y={BOTTOM - b.h}
              width={BW} height={b.h}
              rx="5"
              fill="#0f172a"
              stroke="#3b82f6"
              strokeWidth="1.5"
            />
            <text x={b.x + BW / 2} y={BOTTOM - b.h / 2 - 6} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#93c5fd" fontFamily="monospace">{b.ch}</text>
            <text x={b.x + BW / 2} y={BOTTOM - b.h / 2 + 8} textAnchor="middle" fontSize="9" fill="#3b82f6" fontFamily="monospace">{b.px}px</text>
          </g>
        ))}

        {/* ── Pool arrow before bottleneck ── */}
        <text x={blockX(4) - GAP / 2} y={BOTTOM + 18} textAnchor="middle" fontSize="10" fill="#475569" fontFamily="monospace">↓</text>

        {/* ── Bottleneck ── */}
        <rect
          x={bnBlock.x} y={BOTTOM - bnBlock.h}
          width={BW} height={bnBlock.h}
          rx="5"
          fill="#0c1a2e"
          stroke="#60a5fa"
          strokeWidth="2"
        />
        <text x={bnBlock.x + BW / 2} y={BOTTOM - bnBlock.h / 2 - 6} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#93c5fd" fontFamily="monospace">{bnBlock.ch}</text>
        <text x={bnBlock.x + BW / 2} y={BOTTOM - bnBlock.h / 2 + 8} textAnchor="middle" fontSize="9" fill="#3b82f6" fontFamily="monospace">{bnBlock.px}px</text>
        <text x={bnBlock.x + BW / 2} y={BOTTOM + 18} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">bottleneck</text>

        {/* ── Decoder blocks ── */}
        {decBlocks.map((b) => (
          <g key={`dec-${b.index}`}>
            {/* Up arrow between blocks */}
            {b.index > 0 && (
              <text
                x={blockX(5 + b.index) - GAP / 2}
                y={BOTTOM + 18}
                textAnchor="middle"
                fontSize="10"
                fill="#475569"
                fontFamily="monospace"
              >
                ↑
              </text>
            )}
            {/* Up arrow from bottleneck to first decoder */}
            {b.index === 0 && (
              <text
                x={blockX(5) - GAP / 2}
                y={BOTTOM + 18}
                textAnchor="middle"
                fontSize="10"
                fill="#475569"
                fontFamily="monospace"
              >
                ↑
              </text>
            )}
            <rect
              x={b.x} y={BOTTOM - b.h}
              width={BW} height={b.h}
              rx="5"
              fill="#0a1f1e"
              stroke="#0d9488"
              strokeWidth="1.5"
            />
            <text x={b.x + BW / 2} y={BOTTOM - b.h / 2 - 6} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5eead4" fontFamily="monospace">{b.ch}</text>
            <text x={b.x + BW / 2} y={BOTTOM - b.h / 2 + 8} textAnchor="middle" fontSize="9" fill="#0d9488" fontFamily="monospace">{b.px}px</text>
          </g>
        ))}

        {/* ── Input label ── */}
        <text x={blockX(0) + BW / 2} y={BOTTOM - ENCODER[0].h - 12} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="monospace">Input</text>
        <text x={blockX(0) + BW / 2} y={BOTTOM - ENCODER[0].h - 2} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace">256×256×3</text>
        <line x1={blockX(0) + BW / 2} y1={BOTTOM - ENCODER[0].h - 1} x2={blockX(0) + BW / 2} y2={BOTTOM - ENCODER[0].h + 1} stroke="#475569" strokeWidth="1" />

        {/* ── Output label ── */}
        <text x={blockX(8) + BW / 2} y={BOTTOM - DECODER[3].h - 12} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="monospace">Output</text>
        <text x={blockX(8) + BW / 2} y={BOTTOM - DECODER[3].h - 2} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace">256×256×1</text>

        {/* ── Baseline ── */}
        <line x1="20" y1={BOTTOM + 1} x2={TOTAL_W - 20} y2={BOTTOM + 1} stroke="#1e293b" strokeWidth="1" />

        {/* ── Legend ── */}
        <g transform={`translate(20, ${BOTTOM + 32})`}>
          <rect width="10" height="10" rx="2" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="14" y="9" fontSize="10" fill="#94a3b8" fontFamily="monospace">Encoder</text>
          <rect x="80" width="10" height="10" rx="2" fill="#0a1f1e" stroke="#0d9488" strokeWidth="1.5" />
          <text x="94" y="9" fontSize="10" fill="#94a3b8" fontFamily="monospace">Decoder</text>
          <line x1="165" y1="5" x2="185" y2="5" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="190" y="9" fontSize="10" fill="#94a3b8" fontFamily="monospace">Skip connection</text>
        </g>

        {/* ── Stats ── */}
        <text x={TOTAL_W / 2} y={BOTTOM + 60} textAnchor="middle" fontSize="10" fill="#475569" fontFamily="monospace">
          ~1.94M params · 5 encoder + 4 decoder blocks · ReLU + Dropout · He Normal init
        </text>
      </svg>
    </div>
  );
}
