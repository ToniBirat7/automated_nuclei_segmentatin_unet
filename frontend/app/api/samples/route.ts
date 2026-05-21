import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/samples`);
    const data = await res.json();

    // Rewrite backend sample URLs to go through our proxy
    if (data.samples) {
      data.samples = data.samples.map((s: { name: string; url: string; description: string }) => ({
        ...s,
        url: `${BACKEND_URL}${s.url}`,
      }));
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ samples: [] });
  }
}
