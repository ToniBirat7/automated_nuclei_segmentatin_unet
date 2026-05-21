---
name: training-notebook
tags: [source, implementation, code]
last_updated: 2026-05-22
type: source
---

# Source: Training Notebook — training.ipynb

## Location

`training.ipynb` — 74 cells, full implementation from data loading to model evaluation

## Key Implementation Details

### Dependencies
```
tensorflow==2.10.1, keras==2.10.0
opencv-python==4.10.0, scikit-image==0.25.1, pillow==11.1.0
numpy==1.24.3, scipy==1.15.1, pandas==2.2.3
scikit-learn==1.6.1, optuna==4.2.1
matplotlib==3.10.0, seaborn==0.13.2, plotly==6.0.0
tqdm==4.67.1, h5py==3.12.1
cupy-cuda12x==13.3.0, lime==0.2.0.1, visualkeras==0.1.4
```

### Functions Implemented

| Function | Purpose |
|----------|---------|
| `iou_metric(y_true, y_pred)` | Custom IoU calculation with 0.5 threshold |
| `calculate_prediction_time()` | Benchmark inference latency |
| `predict_with_cpu_fallback()` | GPU→CPU fallback for OOM errors |
| `create_gradient_plot()` | Performance metric plots |
| `visualize_filters()` | Conv layer filter visualization |
| `visualize_layer_activations()` | Feature map visualization |
| `compute_gradcam()` | Grad-CAM heatmap generation |
| `apply_heatmap()` | Overlay heatmap on image |
| `LRPExplainer` class | Layer-wise Relevance Propagation |
| `grid_search_with_progress()` | RFC hyperparameter search |
| `objective()` | Optuna optimization function |

### Callbacks Used
- TensorBoard (histogram_freq=1)
- ModelCheckpoint (saves best as `model_for_nuclei.h5`)

### Model Files
- `final_unet_model.h5` — 23.5MB, final trained model
- Custom IoU required when loading: `load_model(..., custom_objects={'iou_metric': iou_metric})`

### Inference Pattern
```python
# GPU prediction with CPU fallback
def predict_with_cpu_fallback(model, X):
    try:
        return model.predict(X)
    except:
        with tf.device('/CPU:0'):
            return model.predict(X)
```

### Output Directories
- `Model_Related_Performance_All_Images/` — All visualization outputs
- `U-Net_Each_Layer_Filters/` — Layer activation visualizations
- `Model_Evaluation_Note_Images_For_Markdown/` — Evaluation images for README

## Related Pages

- [[unet-architecture]] — Architecture implemented in notebook
- [[dataset]] — Data loading and preprocessing code
- [[optimization]] — Model conversion from h5 to ONNX (deployment step)
