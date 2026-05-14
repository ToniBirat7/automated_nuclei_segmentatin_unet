<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
</head>
<body>
  <div class="container">

  <div class="header">
    <h1>Automated Nuclei Detection in Microscopy Images</h1>
    <p>A Comparative Analysis of Traditional and Deep Learning Approaches</p>
  </div>

  ## Introduction

  The primary goal of this project is to develop an automated nuclei detection system for microscopy images. Accurate nuclei detection is crucial in biomedical research and clinical diagnostics as it enables efficient cell segmentation, counting, and downstream analysis. In this project, we compare two distinct methodologies:

  - **Deep Learning Approach:** Utilizing the U-Net architecture for segmenting nuclei from microscopy images.
  - **Traditional Approach:** Leveraging a pre-trained VGG16 network for feature extraction coupled with a Random Forest Classifier for predicting the presence of nuclei.

  ## Paper Overview (InJET Special Issue, KEC Conference 2025)

  **Publication Venue:** Special Issue of InJET, KEC Conference 2025 (published via InJET/NEPJOL).

  **Problem Addressed:** The paper targets automated nuclei segmentation in microscopy images, focusing on robust delineation of nuclear boundaries across diverse image conditions, varying cell morphologies, and overlapping nuclei. It aims to replace subjective manual annotation with a consistent, quantitative segmentation pipeline suitable for biomedical research and clinical diagnostics, especially in resource-constrained settings.

  ### What Was Used
  - **Dataset:** 2018 Data Science Bowl nuclei dataset (microscopy images with multiple instance masks per image).
  - **Preprocessing & Data Cleaning:**
    - Consolidation of multiple nucleus masks into a single binary mask using pixel-wise max.
    - Gaussian filtering with sigma = 1.5 to suppress noise while preserving edges.
    - Resizing images to 256×256 and normalization.
  - **Data Augmentation:** Random rotations (0–360°), horizontal/vertical flips, and controlled brightness/contrast adjustments.
  - **Optimization & Training:**
    - Adam optimizer with initial learning rate 0.001.
    - Composite loss combining Binary Cross-Entropy and Dice coefficient to address class imbalance.
    - Early stopping based on validation performance.
  - **Evaluation Metrics:** Accuracy and Intersection over Union (IoU).
  - **Explainability:** Grad-CAM and Layer-wise Relevance Propagation (LRP) for model interpretability.

  ### Exploratory Data Analysis (EDA) Findings
  - Image sizes varied from 256×256 to 1024×1024 pixels.
  - Mean nuclei count per image: 71 (±9).
  - Normalized contrast ranged from 0.4 to 0.9; mean intensity ranged from 0.2 to 0.8.
  - Nuclei areas ranged from 8–45 pixels; circularity indices ranged from 0.6–0.9.
  - ~27% of images had significant nuclei overlap, complicating boundary delineation.
  - These observations motivated multi-scale processing, robust normalization, and boundary-aware segmentation.

  ### Working Architecture (U-Net Implementation)
  - **Encoder–Decoder U-Net** with symmetric contracting and expanding paths.
  - **Contracting path:** Five blocks with dual convolution layers, batch normalization, ReLU, and max pooling.
  - **Residual connections** within blocks to improve gradient flow and convergence.
  - **Feature map progression:** 16 → 32 → 64 → 128 → 256 channels.
  - **Regularization:** Dropout in encoder blocks.
  - **Expanding path:** Transposed convolutions for upsampling with skip connections via concatenation.
  - **Output:** Single-channel sigmoid activation for binary segmentation.
  - **Model size:** ~1.94 million trainable parameters.

  ### Results and Evaluation Highlights
  - **Training accuracy:** 0.9710; **Validation accuracy:** 0.9705.
  - **Training IoU:** 0.8829; **Validation IoU:** 0.8826.
  - **Validation loss:** 0.0717 (training loss 0.0753), indicating stable generalization.
  - **Comparison with SOTA models (Accuracy / Precision / Recall / IoU):**
    - DeepLabV3+: 91.2 / 88.7 / 89.1 / 80.5
    - DeepResNet: 94.6 / 88.6 / 81.7 / 85.3
    - **Proposed U-Net:** 97.5 / 94.5 / 95.1 / 88.2
  - **Dataset split robustness (IoU):**
    - Original (670/10/60): 0.88
    - 80/10/10 (592/74/74): 0.85
    - 70/20/10 (518/148/74): 0.83

  ### Model Explainability
  - **Grad-CAM:** Highlighted nuclear boundaries as primary decision regions across varying densities.
  - **LRP:** Produced fine-grained pixel attributions; mean relevance 0.45 with 31,988 positively contributing regions and confidence score 0.902, confirming biologically meaningful attention.

  ### Limitations and Practical Considerations
  - Training required ~2.5 hours on an NVIDIA RTX 3060 GPU.
  - Inference averaged ~99.37 ms per image on the same hardware.
  - Study focused on the 2018 Data Science Bowl dataset; generalization to other modalities requires validation.

  ### Conclusion from the Paper
  The paper demonstrates that a carefully modified U-Net architecture, combined with strong preprocessing, augmentation, and explainability methods, delivers accurate and interpretable nuclei segmentation. It addresses the core biomedical imaging challenge of reliable nuclei delineation across heterogeneous image conditions and supports practical deployment in research and diagnostic workflows.

  ## Project Motivation

  Detecting nuclei accurately is essential for:
  - **Biomedical Research:** Facilitating quantitative image analysis and understanding cellular processes.
  - **Clinical Diagnostics:** Aiding in early disease detection and prognosis.
  - **High-Throughput Screening:** Enabling rapid and reproducible analysis of large volumes of microscopy data.

  This project aims to combine the power of deep learning with the interpretability of traditional machine learning to provide a robust solution for nuclei detection.

  ## Dataset Description

  The dataset comprises high-resolution microscopy images with corresponding segmentation masks. In particular:
  - **Training Data:** Contains images and multiple segmentation masks per image, requiring preprocessing to consolidate one binary mask per image.
  - **Test Data:** A separate set of images used to evaluate model performance.

  More details on the dataset can be found on the [Kaggle Competition Page](https://www.kaggle.com/competitions/data-science-bowl-2018/data).

  ## Methodology

  ### Deep Learning Approach: U-Net

  The U-Net architecture is specifically designed for biomedical image segmentation. Our implementation involves the following key steps:

  1. **Image Preprocessing**
      - **Resizing:** All images are resized to a fixed dimension of \(256 \times 256\) pixels.
      - **Normalization:** Pixel values are scaled appropriately.
      - **Mask Consolidation:** Multiple mask files are combined into a single binary mask per image.

  2. **Model Development**
      - **Encoding/Contracting Path:** Consists of multiple convolutional layers with max-pooling to extract semantic features.
      - **Decoding/Expanding Path:** Uses transposed convolutions and skip connections to recover spatial resolution and refine the segmentation.
      - **Output:** A sigmoid activated convolutional layer returns the final segmentation mask.

  3. **Model Training and Evaluation**
      - The model is compiled using the Adam optimizer and binary cross-entropy loss.
      - Metrics such as accuracy and Intersection over Union (IoU) are monitored.
      - Advanced techniques like Grad-CAM and Layer-wise Relevance Propagation (LRP) are used for interpretability.

  #### U-Net Architecture Visualization

  Visualizations include:
  - **Activation Maps:** Examination of feature activations across layers.
  - **Grad-CAM:** Identification of the areas on the image that contribute most to the model's prediction.
  - **LRP Reports:** Detailed analysis of region relevancy within the prediction process.

  ### Traditional Approach: VGG16 + Random Forest Classifier (RFC)

  This approach employs a pre-trained VGG16 model for feature extraction followed by a Random Forest Classifier:

  1. **Feature Extraction**
      - **VGG16:** Utilized as a fixed feature extractor (with weights pretrained on ImageNet) to preserve critical image features.
      - **Layer Selection:** Features are extracted from early convolutional layers (e.g., `block1_conv2`) to maintain spatial detail.

  2. **Classification with RFC**
      - The extracted deep features are reshaped and fed into a Random Forest Classifier.
      - **Hyperparameter Tuning:** Techniques such as grid search and Optuna are used to optimize the classifier.
      - **Evaluation:** Metrics such as accuracy, precision, recall, F1 score, and IoU are computed.

  3. **Result Visualization**
      - An interactive dashboard is created using Plotly and Seaborn to present performance results and hyperparameter tuning history.

  ## Implementation Details

  **Tools & Libraries:**
  - **TensorFlow & Keras:** For implementing and training the U-Net model.
  - **OpenCV:** For image manipulation and visualization.
  - **Scikit-learn:** To build and evaluate the Random Forest Classifier.
  - **Optuna:** For automated hyperparameter optimization.
  - **Plotly & Seaborn:** For the creation of interactive dashboards and rich visualizations.

  **Hardware Considerations:**
  - GPU acceleration is utilized to speed up model training.
  - A CPU fallback mechanism is implemented to ensure stable predictions when GPU memory constraints arise.

  ## Results and Analysis

  The comparative analysis of the two methodologies revealed that:
  - **U-Net (Deep Learning):** Achieves superior segmentation performance with high IoU and provides detailed interpretability through Grad-CAM and LRP visualizations.
  - **VGG16 + RFC (Traditional):** Offers a robust baseline with competitive performance, demonstrating the effectiveness of deep feature extraction even with traditional classifiers.

  **Key Visualizations:**
  - **Segmentation Outputs:** Direct comparisons between the input images, ground truth masks, and model predictions.
  - **Filter Activations and Heatmaps:** Visual insights into the convolutional layers' activations.
  - **Optimization Dashboards:** Graphical representations of performance metrics, ROC curves, and hyperparameter optimization history.

  ## Future Directions

  Potential future enhancements include:
  - **Advanced Data Augmentation:** To further improve model robustness.
  - **Ensemble Methods:** Combining multiple deep learning architectures to boost performance.
  - **Real-Time Applications:** Integration of the system for live microscopy imaging.
  - **Deployment:** Creating interactive web applications for clinical diagnostic use.

  ## Conclusion

  This project showcases an innovative approach to nuclei detection that integrates advanced deep learning techniques with traditional machine learning methods. The U-Net model provides high-quality segmentation with explanatory visualizations, while the VGG16 + RFC pipeline offers a solid baseline that enhances our understanding of feature extraction and classification.

  Ultimately, the fusion of these methodologies paves the way for more accurate and interpretable biomedical image analysis tools, which can have significant real-world applications in research and healthcare.

  ---
  
  For further details or inquiries, please refer to the complete [Jupyter Notebook](#) or contact the development team.

  </div>
</body>
</html>
