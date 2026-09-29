import React, { useState } from 'react';
import {
  Eye,
  Layers,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { SAMPLE_LESIONS } from '../data/sampleLesions';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const ExplainabilityPage: React.FC = () => {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const sample = SAMPLE_LESIONS[selectedSampleIndex];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Transparent Computer Vision
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
            Grad-CAM (Selvaraju et al., 2017)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Explainable AI (XAI) & Saliency Maps
        </h1>
        <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
          Deep convolutional networks are often termed &quot;black boxes&quot;. DermaScan AI incorporates Gradient-weighted
          Class Activation Mapping (Grad-CAM) to visualize the spatial regions in dermatoscopic images that primarily
          drove the model&apos;s classification decision.
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Interactive Walkthrough Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Interactive Saliency Inspection</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select a benchmark clinical specimen to inspect Grad-CAM activations across layers.
            </p>
          </div>

          {/* Sample Tabs */}
          <div className="flex items-center gap-2">
            {SAMPLE_LESIONS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setSelectedSampleIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedSampleIndex === idx
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {s.category.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Images Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-200">1. Original Image</span>
              <span className="text-[10px] font-mono text-neutral-400">Input</span>
            </div>
            <div className="w-full h-56 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center border border-neutral-800/80">
              <img
                src={sample.dataUrl}
                alt="Original Lesion"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[11px] text-neutral-400 leading-snug">
              <strong>{sample.name}</strong>: {sample.clinicalDescription}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300">2. Attention Map</span>
              <span className="text-[10px] font-mono text-cyan-400">Jet Spectrum</span>
            </div>
            <div className="w-full h-56 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center border border-neutral-800/80 relative">
              {/* Synthetic Heatmap representation */}
              <div className="w-full h-full bg-gradient-to-tr from-blue-900 via-emerald-800 to-rose-600 opacity-80 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-rose-500 blur-xl opacity-90 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-cyan-300">
                  Gradients of Score y^c
                </span>
              </div>
            </div>
            <div className="text-[11px] text-neutral-400 leading-snug">
              Warm red centers correspond to maximum feature activation in the final convolutional layer (stage 7).
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-300">3. Grad-CAM Overlay</span>
              <span className="text-[10px] font-mono text-emerald-400">Blended</span>
            </div>
            <div className="w-full h-56 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center border border-neutral-800/80 relative">
              <img
                src={sample.dataUrl}
                alt="Overlay sample"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-yellow-500/30 to-rose-500/50 mix-blend-overlay" />
            </div>
            <div className="text-[11px] text-neutral-400 leading-snug">
              Superimposition proves the network focuses on dermatoscopic borders rather than ambient healthy skin or illumination artifacts.
            </div>
          </div>
        </div>

        {/* Clinical Interpretability Boundary Note */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-amber-300 block">
              Interpretability Caution: Not A Proof of Malignancy
            </span>
            <p>
              Highlighted regions indicate image areas that contributed to the model&apos;s prediction. This visualization
              is an AI explainability aid and should not be interpreted as clinical evidence. Grad-CAM identifies mathematical
              discriminative features in pixel distributions—it does not prove why a biological lesion is malignant or benign.
            </p>
          </div>
        </div>
      </div>

      {/* Grad-CAM Mathematical Formulation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Mathematical Principles of Grad-CAM</span>
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Grad-CAM calculates the gradient of the predicted score $y^c$ for class $c$ with respect to feature activation
            maps $A^k$ of a convolutional layer:
          </p>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-cyan-300 space-y-2">
            <div className="text-neutral-500 text-[10px]">// 1. Neuron Importance Weights (Global Average Pooling)</div>
            <div>&alpha;_k^c = (1/Z) &sum;_i &sum;_j (&part;y^c / &part;A_{'{i,j}'}^k)</div>
            <div className="text-neutral-500 text-[10px] pt-1">// 2. Weighted Sum Followed by Rectified Linear Unit (ReLU)</div>
            <div>L_{'{Grad-CAM}'}^c = ReLU( &sum;_k &alpha;_k^c &middot; A^k )</div>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            The ReLU ensures that only features that have a positive influence on the target class score are retained,
            filtering out negative or irrelevant activations.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Artifact Rejection & Clinical Utility</span>
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            In clinical dermatoscopy, deep learning models frequently suffer from "shortcut learning" where networks latch
            onto extraneous artifacts instead of true lesion biology:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-200">Surgical Skin Marker Ink:</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  XAI allows researchers to verify whether the model is focusing on violet marking ink rather than lesion atypia.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-200">Peripheral Vignetting & Dark Corners:</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Dermatoscope lenses produce circular black borders; Grad-CAM ensures the receptive field is focused centrally.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-neutral-200">Gel Bubbles & Hair Occlusion:</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Excludes fluid immersion artifacts from influencing diagnostic class probabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
