export interface SegmentationResult {
  segmentation_mask: string;
  overlay_image: string;
  confidence_map: string;
  nuclei_count: number;
  inference_time_ms: number;
}

export interface SampleImage {
  name: string;
  url: string;
  description: string;
}

export async function segmentImage(file: File): Promise<SegmentationResult> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/segment", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchSamples(): Promise<SampleImage[]> {
  const res = await fetch("/api/samples");
  if (!res.ok) return [];
  const data = await res.json();
  return data.samples || [];
}

export function base64ToUrl(b64: string): string {
  return `data:image/png;base64,${b64}`;
}
