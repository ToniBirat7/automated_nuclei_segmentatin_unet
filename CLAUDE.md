# Automated Nuclei Segmentation — Project Schema

## Project Summary

Published research (KEC 2025, InJET DOI: 10.3126/injet.v2i2.78595) implementing U-Net-based automated nuclei segmentation. Achieved 97.5% accuracy, 0.88 IoU on 2018 Data Science Bowl dataset.

**Stack:** Python/TensorFlow (model) | FastAPI + ONNX Runtime (backend) | Next.js 14 + Tailwind (frontend)

## Codebase Layout

```
.wiki-nuclei-unet/     # LLM Wiki (see wiki schema below)
.claude/agents/        # Reusable Claude Code agents
backend/               # FastAPI model serving
  app/main.py          # FastAPI app entry
  app/model.py         # OnnxInferenceEngine
  app/routes/          # segment.py, health.py
  app/utils/           # image_processing.py, visualization.py
  models/              # unet_nuclei.onnx (converted model)
  samples/             # 6 sample microscopy images
frontend/              # Next.js 14 app
  app/                 # App Router pages
  components/          # React components
  lib/api.ts           # Backend API client
  public/samples/      # Sample images for frontend
scripts/
  convert_model.py     # h5 → ONNX conversion
training.ipynb         # Original training notebook
final_unet_model.h5    # Trained model (23.5MB)
```

## Wiki Schema (`.wiki-nuclei-unet/`)

### Page Frontmatter (required)

```yaml
---
name: kebab-case-slug        # matches filename
tags: [tag1, tag2]
last_updated: YYYY-MM-DD
source_count: N              # number of sources this page synthesizes (optional)
type: entity|concept|source|deployment  # optional
---
```

### Page Categories

| Folder | Contents |
|--------|----------|
| (root) | `index.md` (catalog), `log.md` (history), `overview.md` (thesis) |
| `entities/` | Named things: model, dataset, performance metrics, approaches |
| `concepts/` | Ideas and techniques: IoU, Grad-CAM, LRP, augmentation, segmentation |
| `sources/` | Summaries of ingested documents (papers, notebooks, articles) |
| `deployment/` | Infrastructure decisions: backend, frontend, optimization |

### Cross-References

Use `[[page-name]]` to link related pages. Link liberally — broken links are fine, they signal pages to write next.

## Wiki Operations

### Ingest a New Source

1. Read the source document
2. Discuss key takeaways with user
3. Write summary page in `sources/` with full citation
4. Update `entities/` and `concepts/` pages affected by the new information
5. Note contradictions with existing claims
6. Update `index.md` (add new pages, update page counts)
7. Append entry to `log.md`: `## [YYYY-MM-DD] ingest | Source Title`

### Query the Wiki

1. Read `index.md` to identify relevant pages
2. Read the relevant pages
3. Synthesize answer with citations (link to wiki pages)
4. If answer is non-trivial, offer to file it as a new wiki page

### Lint the Wiki

Check for:
- Pages referenced in `[[links]]` that don't exist
- Claims in one page that contradict another
- Orphan pages (no inbound links from other pages)
- Entities mentioned without their own page
- Log entries for ingests that have no corresponding source page
- `index.md` entries that don't match existing files

## Development Conventions

### Backend (Python)

- All inference goes through `OnnxInferenceEngine` class in `app/model.py`
- Preprocessing mirrors training pipeline exactly: resize→256×256, normalize÷255, optional Gaussian σ=1.5
- Custom IoU metric: threshold at 0.5 before computing intersection/union
- Image outputs always base64-encoded PNG in API responses
- GPU providers: `['CUDAExecutionProvider', 'CPUExecutionProvider']` (fallback order)

### Frontend (TypeScript/Next.js)

- Dark scientific aesthetic: background `#0a0a0f`, accent `#00d4ff`
- All API calls go through `lib/api.ts`
- Backend is proxied via Next.js route handler at `app/api/segment/route.ts`
- Sample images live in `public/samples/` (6 curated microscopy images)
- No external image URLs — all assets local

### Git Workflow

- Branch per feature, PR to merge
- Issue numbers referenced in commits: `fix: #N description`
- Close issues as work completes with `gh issue close N`

## Key Numbers to Remember

- Model input: 256×256×3 (RGB float32, normalized 0–1)
- Model output: 256×256×1 (float32 sigmoid, threshold 0.5 → binary)
- Trainable parameters: ~1.94M
- IoU threshold: 0.5
- Inference: ~99ms GPU, target <150ms CPU (ONNX)
- Model file: `final_unet_model.h5` (23.5MB), `backend/models/unet_nuclei.onnx` (target ~10MB)

## Available Agents

| Agent | File | Trigger |
|-------|------|---------|
| Wiki Ingest | `.claude/agents/wiki-ingest.md` | Adding new source documents |
| Wiki Query | `.claude/agents/wiki-query.md` | Asking research questions |
| Wiki Lint | `.claude/agents/wiki-lint.md` | Periodic wiki health check |
| Model Inference Test | `.claude/agents/model-inference-test.md` | After backend changes |
| Deploy Check | `.claude/agents/deploy-check.md` | Before/after deployments |
| Context Compactor | `.claude/agents/context-compactor.md` | When conversation > 70k tokens |
| Issue Tracker | `.claude/agents/issue-tracker.md` | Managing GitHub issues |
