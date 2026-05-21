import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/segment`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { detail: "Backend unavailable. Please try again later." },
      { status: 503 }
    );
  }
}
