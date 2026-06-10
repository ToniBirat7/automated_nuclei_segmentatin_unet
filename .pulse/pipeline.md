# Nuclei Segmentation — Working Pipeline

> Outside the markers below is human-owned. The pulse skill only rewrites content
> between the sentinels, leaving your notes intact.

## Dev / build / deploy flow

_How you run, build, test, and ship this project._

<!-- pulse:auto:start -->
Train U-Net -> export ONNX -> FastAPI inference (CPU) + Next.js UI -> docker-compose -> DigitalOcean SGP1 behind nginx.
<!-- pulse:auto:end -->
