import { NextResponse } from "next/server";

const SAMPLES = [
  { name: "sample_01.png", description: "Dense nuclei — high overlap" },
  { name: "sample_02.png", description: "Sparse nuclei — clear boundaries" },
  { name: "sample_03.png", description: "Mixed density — varied sizes" },
  { name: "sample_04.png", description: "High contrast fluorescence" },
  { name: "sample_05.png", description: "Low contrast brightfield" },
  { name: "sample_06.png", description: "Phase contrast imaging" },
];

export async function GET() {
  return NextResponse.json({
    samples: SAMPLES.map((s) => ({ ...s, url: `/samples/${s.name}` })),
  });
}
