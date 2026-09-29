# DermaScan AI — Model Evaluation & Benchmark Report

## 1. Dataset & Clinical Context
- **Dataset:** HAM10000 (Human Against Machine with 10,000 training images), published by Tschandl et al. (*Nature Scientific Data*, 2018).
- **Total Images:** 10,015 dermatoscopic lesions.
- **Diagnostic Classes (7):**
  1. `akiec` — Actinic keratoses and intraepithelial carcinoma (Bowen's disease)
  2. `bcc` — Basal cell carcinoma
  3. `bkl` — Benign keratosis-like lesions (solar lentigines, seborrheic keratoses)
  4. `df` — Dermatofibroma
  5. `mel` — Melanoma
  6. `nv` — Melanocytic nevi (66.95% of total dataset)
  7. `vasc` — Vascular lesions

## 2. Partitioning & Data Leakage Prevention
To prevent patient-level and lesion-level leakage, splitting was performed strictly by grouping on `lesion_id`:
- **Train Split (70%):** 7,011 images
- **Validation Split (15%):** 1,502 images
- **Test Split (15%):** 1,502 images
**Result:** Zero duplicate lesions cross between partitions. All test set numbers represent completely unseen patient lesions.

## 3. Class Imbalance Mitigation
The dataset exhibits heavy class imbalance (`nv` = 6,705 vs `df` = 115, a 58:1 ratio). Strategies applied:
- **Loss Function:** Categorical Focal Loss ($\gamma = 2.0$) and Inverse Class Frequency Weighting.
- **Data Augmentation:** Affine transformations, horizontal and vertical flips, random zoom, brightness/contrast jittering.
- **Primary Metric:** Macro F1 and One-vs-Rest ROC-AUC were used for model selection rather than raw accuracy, which would be artificially inflated by the dominant `nv` class.

## 4. Benchmark Results on Untouched Test Set (N=1,502)

| Model Architecture | Parameters | Latency (ms) | Test Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 | ROC-AUC (OvR) | Macro Specificity |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Custom CNN Baseline** | 3.2M | 14.1 ms | 72.45% | 0.5580 | 0.5120 | 0.5310 | 0.7182 | 0.8240 | 0.9210 |
| **MobileNetV3-Large** | 5.4M | 17.6 ms | 83.15% | 0.7042 | 0.6695 | 0.6842 | 0.8264 | 0.9125 | 0.9521 |
| **EfficientNetV2-B0 [Active]** | **7.1M** | **24.2 ms** | **87.62%** | **0.7634** | **0.7258** | **0.7423** | **0.8714** | **0.9481** | **0.9684** |
| **DenseNet121** | 8.0M | 28.4 ms | 86.21% | 0.7485 | 0.7102 | 0.7281 | 0.8593 | 0.9390 | 0.9642 |
| **ConvNeXt-Tiny** | 28.6M | 35.8 ms | 88.41% | 0.7812 | 0.7431 | 0.7610 | 0.8803 | 0.9562 | 0.9712 |

## 5. Active Model Selection Rationale
While **ConvNeXt-Tiny** achieved marginally higher macro F1 (+0.0187), it requires **4.0x more parameters** (28.6M vs 7.1M) and higher inference latency (35.8ms vs 24.2ms). 
**EfficientNetV2-B0** was selected as the default active model because:
1. Outstanding Macro Recall (72.58%) and Melanoma sensitivity (72.48%).
2. Parameter efficiency (7.1M weights allows fast edge and server-side deployment).
3. Excellent calibration with Expected Calibration Error (ECE) of 0.042.

## 6. Limitations & Medical Research Notice
- The dataset consists predominantly of fair-skinned individuals (Fitzpatrick skin types I–III). Performance on darker skin types (IV–VI) is not clinically established and requires further diverse cohort validation.
- Model predictions and Grad-CAM visualizations represent statistical correlations in image features and do NOT constitute a medical diagnosis.
