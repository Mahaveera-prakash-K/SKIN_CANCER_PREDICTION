# HAM10000 Dataset & Partitioning Specification

## Dataset Provenance
- **Dataset:** HAM10000 ("Human Against Machine with 10,000 training images")
- **License:** CC BY-NC 4.0 (Academic & Non-Commercial Research)
- **Source:** Tschandl, P., Rosendahl, C. & Kittler, H. The HAM10000 dataset, a large collection of multi-source dermatoscopic images of common pigmented skin lesions. *Sci Data* 5, 180161 (2018).

## Diagnostic Classes
| Class Code | Full Medical Name | Clinical Significance | Support in HAM10000 | Percentage |
|:---|:---|:---|:---:|:---:|
| `akiec` | Actinic Keratoses & Intraepithelial Carcinoma | Pre-cancerous / In situ SCC | 327 | 3.27% |
| `bcc` | Basal Cell Carcinoma | Malignant non-melanoma skin cancer | 514 | 5.13% |
| `bkl` | Benign Keratosis-like Lesions | Benign (Seborrheic keratosis, solar lentigo) | 1,099 | 10.97% |
| `df` | Dermatofibroma | Benign dermal histiocytoma | 115 | 1.15% |
| `mel` | Melanoma | High-mortality cutaneous malignancy | 1,113 | 11.11% |
| `nv` | Melanocytic Nevus | Common benign mole (majority class) | 6,705 | 66.95% |
| `vasc` | Vascular Lesions | Benign hemangiomas, angiokeratomas | 142 | 1.42% |

## Patient-Aware Partitioning (Zero Data Leakage)
In dermatoscopy datasets, multiple images often exist for the same physical lesion or same patient across longitudinal exams. Random image-level train/test splits cause severe optimistic bias (data leakage). 
DermaScan AI employs strict **group splitting on `lesion_id`**:
- **Train Split (70%):** 7,011 images
- **Validation Split (15%):** 1,502 images
- **Test Split (15%):** 1,502 images (Untouched during hyperparameter selection)
- **Overlap:** Exactly 0 duplicate lesions across train, val, and test.
