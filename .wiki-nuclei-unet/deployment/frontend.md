---
name: frontend
tags: [deployment, frontend, nextjs, ui]
last_updated: 2026-05-22
---

# Frontend Design — Next.js 14

## Stack

- **Next.js 14** App Router
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — accessible component primitives
- **react-dropzone** — drag and drop file upload
- **framer-motion** — smooth animations and transitions
- **lucide-react** — icon library

## Visual Design Language

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0a0f` | Page background |
| Surface | `#0f0f1a` | Card/panel backgrounds |
| Border | `#1a1a2e` | Subtle borders |
| Accent | `#00d4ff` | Active states, highlights |
| Success | `#00ff88` | Nuclei overlay color |
| Warning | `#ffaa00` | Confidence indicators |
| Text Primary | `#e2e8f0` | Body text |
| Text Muted | `#64748b` | Secondary text |
| Mono Font | JetBrains Mono | Metrics, numbers |

## Page Sections

### 1. Hero
- Large title: "Automated Nuclei Segmentation"
- Subtitle: Published research tagline
- Badges: KEC 2025 | InJET | DOI link
- Animated metric strip: 97.5% Accuracy | 0.88 IoU | ~99ms | 1.94M Params

### 2. Upload Zone
- Large drop area (dashed animated border, microscopy-themed)
- Supported formats badge: PNG, JPG, TIF
- File size limit: 10MB
- On hover: animated scanning line effect
- Below: "Or try a sample image" → 6 sample thumbnails grid

### 3. Results Panel (revealed after inference, slide-up animation)
- 4-panel grid: Original | Binary Mask | Confidence Heatmap | Overlay
- Each panel: title + download button
- Right side metrics card:
  - Nuclei Count (large number, animated count-up)
  - Inference Time (ms)
  - Confidence Score
- "Analyze Another Image" button

### 4. Model Architecture Section
- SVG diagram of U-Net encoder-decoder with labeled blocks
- Encoder blocks (blue), decoder blocks (teal), skip connections (orange arrows)
- Spec table: 1.94M params, 256×256 input, 5 encoder blocks, 4 decoder blocks

### 5. Performance Section
- SOTA comparison table (highlight U-Net row)
- Dataset split robustness table
- Training curves description (with reference to figures from paper)

### 6. About / Research Section
- Project context, published paper details
- "Why it matters" — clinical applications
- Explainability section: Grad-CAM and LRP description with example visualization images

## Key Components

| Component | Responsibility |
|-----------|---------------|
| `UploadZone.tsx` | Drag-drop, file validation, preview |
| `SampleImages.tsx` | 6 sample image grid, click-to-load |
| `ResultsPanel.tsx` | 4-panel image display + download |
| `MetricsDisplay.tsx` | Animated counters, loading skeleton |
| `ArchitectureDiagram.tsx` | SVG U-Net visualization |
| `PerformanceTable.tsx` | SOTA comparison + split robustness |
| `HeroSection.tsx` | Title, badges, metrics strip |

## API Integration

```typescript
// lib/api.ts
export async function segmentImage(file: File): Promise<SegmentationResult> {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch('/api/segment', { method: 'POST', body: formData })
  return res.json()
}
```

Next.js route handler (`app/api/segment/route.ts`) proxies to FastAPI backend, avoiding CORS issues in production.

## Related Pages

- [[backend-api]] — API this frontend calls
- [[optimization]] — Model optimization affecting inference speed shown in UI
