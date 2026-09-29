import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Shield,
  Layers,
  ArrowRight,
  Maximize2,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionResult } from '../types';
import { SAMPLE_LESIONS, SampleLesion } from '../data/sampleLesions';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface Props {
  onPredictionSuccess?: (res: PredictionResult) => void;
  onNavigateHistory?: () => void;
}

const CLASS_DESCRIPTIONS: Record<string, { label: string; malignant: boolean; desc: string }> = {
  akiec: {
    label: 'Actinic Keratoses & Intraepithelial Carcinoma',
    malignant: false,
    desc: "Pre-cancerous solar lesion or squamous cell carcinoma in situ (Bowen's disease).",
  },
  bcc: {
    label: 'Basal Cell Carcinoma',
    malignant: true,
    desc: 'Common non-melanoma skin cancer with characteristic translucent or telangiectatic appearance.',
  },
  bkl: {
    label: 'Benign Keratosis-like Lesions',
    malignant: false,
    desc: 'Common benign skin growth (seborrheic keratosis, solar lentigo, lichenoid keratosis).',
  },
  df: {
    label: 'Dermatofibroma',
    malignant: false,
    desc: 'Benign dermal fibrous lesion frequently found on lower extremities.',
  },
  mel: {
    label: 'Melanoma',
    malignant: true,
    desc: 'Malignant melanocytic neoplasm showing atypical pigment pattern and architectural asymmetry.',
  },
  nv: {
    label: 'Melanocytic Nevus',
    malignant: false,
    desc: 'Benign proliferation of melanocytes (standard pigment mole) with regular pattern.',
  },
  vasc: {
    label: 'Vascular Lesions',
    malignant: false,
    desc: 'Benign vascular malformation or proliferation (hemangioma, pyogenic granuloma).',
  },
};

export const AnalyzePage: React.FC<Props> = ({ onPredictionSuccess, onNavigateHistory }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stageText, setStageText] = useState('Preparing image...');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleLesion | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError(null);
    setSelectedSample(null);

    const isImageMime = file.type && (file.type.startsWith('image/') || file.type === 'application/octet-stream');
    const isImageExt = Boolean(file.name && file.name.match(/\.(jpe?g|png|webp|svg|bmp|tiff|jfif)$/i));
    if (!isImageMime && !isImageExt) {
      setError('Please upload a valid image file (JPEG, PNG, or WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds the allowed limit of 10MB.');
      return;
    }

    // Verify minimum dimensions via image object
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 32 || img.height < 32) {
        setError(`Image resolution is too low (${img.width}x${img.height}). Minimum required is 32x32.`);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
      setResult(null);
    };
    img.onerror = () => {
      setError('Failed to decode image file. File may be corrupted.');
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleLesion) => {
    setError(null);
    setSelectedSample(sample);
    setPreviewUrl(sample.dataUrl);
    setResult(null);

    // 1. Immediately create a File from sample dataUrl so selectedFile is never null
    fetch(sample.dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        setSelectedFile(new File([blob], `${sample.id}.png`, { type: 'image/png' }));
      })
      .catch((e) => console.warn('Sample blob creation:', e));

    // 2. Also rasterize via canvas to ensure true 224x224 RGB bitmap
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 224, 224);
        canvas.toBlob((blob) => {
          if (blob) {
            setSelectedFile(new File([blob], `${sample.id}.png`, { type: 'image/png' }));
          }
        }, 'image/png');
      }
    };
    img.src = sample.dataUrl;
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);

    // Multi-stage indicator
    setStageText('Preparing image & normalizing tensor...');
    const t1 = setTimeout(() => setStageText('Running neural network model inference...'), 400);
    const t2 = setTimeout(() => setStageText('Generating Grad-CAM spatial activation map...'), 850);
    const t3 = setTimeout(() => setStageText('Finalizing result & ABCD dermoscopy metrics...'), 1250);

    try {
      const predResult = await api.predict(selectedFile, notes);
      setResult(predResult);
      if (onPredictionSuccess) {
        onPredictionSuccess(predResult);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while processing image.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setSelectedSample(null);
    setNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Banner & Title */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Deep Learning Inference
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              Analyze Skin Lesion
            </h1>
          </div>
          <MedicalDisclaimer compact />
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
          Upload a dermatoscopic photograph or select a benchmark research lesion below. The model will calculate
          class probabilities over the 7 HAM10000 categories, compute dermoscopic ABCD characteristics, and render
          Grad-CAM visual attention heatmaps.
        </p>
      </div>

      {/* Benchmark Research Samples Selector */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Benchmark Test Case (HAM10000 Ground Truth):</span>
          </span>
          <span className="text-[10px] text-neutral-400">Click any sample to evaluate instantly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_LESIONS.map((sample) => {
            const isSelected = selectedSample?.id === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 ring-1 ring-cyan-500/30'
                    : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="w-full h-24 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800/80 flex items-center justify-center">
                  <img
                    src={sample.dataUrl}
                    alt={sample.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-neutral-200 truncate">{sample.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono uppercase">{sample.category}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Upload & Preview Area */}
      {!result ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center min-h-[300px] ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="text-sm font-bold text-white mb-1">
              Drag & Drop Dermatoscopic Image Here
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs mb-4">
              Supports JPEG, PNG, or WEBP format. Minimum 64x64 resolution, up to 10MB file size.
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition"
            >
              Browse Files
            </button>
          </div>

          {/* Preview & Trigger */}
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-300">Selected Image Preview</span>
                {previewUrl && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="w-full h-52 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center relative">
                    <img
                      src={previewUrl}
                      alt="Lesion Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-neutral-300 border border-neutral-800">
                      Standardized Input 224x224
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Clinical Research Notes (Optional):
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Patient cohort #4, Fitzpatrick II, back lesion"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-52 rounded-xl border border-neutral-800/80 bg-neutral-950/40 flex flex-col items-center justify-center text-neutral-400 text-xs">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                  <span>No image selected yet</span>
                </div>
              )}
            </div>

            {error && (
              <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-4">
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={!selectedFile || analyzing}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{stageText}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Classification & Grad-CAM</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* PREDICTION RESULT CARD */
        <div className="space-y-6 animate-fade-in">
          {/* Result Header */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                  Model Prediction Output
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-2xl font-black text-white">
                    {result.predicted_class_name}
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    {result.predicted_class}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
                  <span className="text-[10px] text-neutral-400 block font-mono">MODEL CONFIDENCE</span>
                  <span className="text-xl font-black font-mono text-cyan-400">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
                  <span className="text-[10px] text-neutral-400 block font-mono">ACTIVE MODEL</span>
                  <span className="text-xs font-bold text-neutral-200">
                    {result.model.name}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {CLASS_DESCRIPTIONS[result.predicted_class]?.desc ||
                'Skin lesion classification based on deep feature embeddings.'}
            </p>

            {result.clinical_reasoning && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                    Gemini 3.8 Flash Multimodal Clinical Assessment
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                    Powered by Google GenAI
                  </span>
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed">
                  {result.clinical_reasoning}
                </p>
              </div>
            )}
          </div>

          {/* SIDE-BY-SIDE GRAD-CAM EXPLAINABILITY SECTION */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Explainable AI (Grad-CAM Visual Attention)</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Gradient-weighted class activation map computed at convolutional layer {result.explainability.layer_name}.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Grad-CAM v1.2
              </span>
            </div>

            {/* 3 Images Side-by-Side: Original, Heatmap, Grad-CAM Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>1. Original Dermatoscopy</span>
                  <span className="text-[10px] font-mono text-neutral-400">224x224 RGB</span>
                </div>
                <div className="w-full h-48 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center border border-neutral-800/80">
                  <img
                    src={previewUrl || result.explainability.original_image}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  Preprocessed raw dermatoscopic image centered on the cutaneous region of interest.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>2. Attention Heatmap</span>
                  <span className="text-[10px] font-mono text-cyan-400">Jet Colormap</span>
                </div>
                <div className="w-full h-48 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center border border-neutral-800/80">
                  <img
                    src={result.explainability.heatmap}
                    alt="Attention Map"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  Normalized class gradients. Warm colors (red/yellow) indicate highest neural feature weights.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
                  <span>3. Grad-CAM Overlay</span>
                  <span className="text-[10px] font-mono text-emerald-400">Alpha Blended</span>
                </div>
                <div className="w-full h-48 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center border border-neutral-800/80">
                  <img
                    src={result.explainability.overlay}
                    alt="Grad-CAM Overlay"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  Overlay demonstrates alignment between model focus and anatomical border / pigment structures.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-400 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{result.explainability.explanation_note}</span>
            </div>
          </div>

          {/* Probability Distribution & Dermoscopic ABCD rule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 7-Class Probabilities */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Class Probability Distribution</span>
                <span className="text-[10px] font-mono text-neutral-400">Sum = 1.000</span>
              </h3>

              <div className="space-y-2.5">
                {Object.entries(result.probabilities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([clsKey, prob]) => {
                    const isPredicted = clsKey === result.predicted_class;
                    const percent = (prob * 100).toFixed(1);
                    return (
                      <div key={clsKey} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`font-medium ${
                              isPredicted ? 'text-cyan-300 font-bold' : 'text-neutral-400'
                            }`}
                          >
                            {CLASS_DESCRIPTIONS[clsKey]?.label || clsKey.toUpperCase()}
                          </span>
                          <span
                            className={`font-mono text-xs ${
                              isPredicted ? 'text-cyan-400 font-bold' : 'text-neutral-400'
                            }`}
                          >
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isPredicted
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                : 'bg-neutral-700'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Dermoscopic ABCD Criteria */}
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Dermoscopic ABCD Computer Vision Metrics</span>
                <span className="text-[10px] font-mono text-cyan-400">Automated</span>
              </h3>

              {result.dermoscopic_features ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-neutral-200">A - Asymmetry Index</div>
                      <div className="text-[11px] text-neutral-400">Horizontal/vertical biaxial difference</div>
                    </div>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {result.dermoscopic_features.asymmetry_index}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-neutral-200">B - Border Irregularity</div>
                      <div className="text-[11px] text-neutral-400">Perimeter-to-area compactness score</div>
                    </div>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {result.dermoscopic_features.border_irregularity}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-neutral-200">C - Color Variegation</div>
                      <div className="text-[11px] text-neutral-400">Multispectral standard deviation</div>
                    </div>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {result.dermoscopic_features.color_variegation}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-neutral-200">D - Estimated Diameter</div>
                      <div className="text-[11px] text-neutral-400">Scaled cross-sectional estimation</div>
                    </div>
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {result.dermoscopic_features.estimated_diameter_mm} mm
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-400">Dermoscopic features not computed.</p>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-800">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-neutral-800 hover:bg-neutral-700 text-white transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Analyze Another Image</span>
            </button>

            {onNavigateHistory && (
              <button
                onClick={onNavigateHistory}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-600/20"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View in Prediction History</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
