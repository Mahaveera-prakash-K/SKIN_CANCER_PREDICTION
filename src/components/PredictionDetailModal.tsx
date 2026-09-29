import React from 'react';
import { X, Calendar, Layers, Eye, Shield, Info, Download } from 'lucide-react';
import { PredictionRecord } from '../types';

interface Props {
  prediction: PredictionRecord | null;
  onClose: () => void;
}

export const PredictionDetailModal: React.FC<Props> = ({ prediction, onClose }) => {
  if (!prediction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Analysis Record #{prediction.id}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              {new Date(prediction.created_at).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <h2 className="text-2xl font-black text-white">
                {prediction.predicted_class_name}
              </h2>
              <div className="text-xs text-neutral-400 font-mono mt-0.5">
                Class Code: <span className="text-cyan-400 font-bold uppercase">{prediction.predicted_class}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
                <span className="text-[10px] text-neutral-400 block font-mono">CONFIDENCE</span>
                <span className="text-xl font-black font-mono text-cyan-400">
                  {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
                <span className="text-[10px] text-neutral-400 block font-mono">MODEL</span>
                <span className="text-xs font-bold text-neutral-200">
                  {prediction.model_name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {prediction.clinical_reasoning && (
          <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1.5">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono block">
              Gemini 3.8 Flash Morphological Assessment
            </span>
            <p className="text-xs text-neutral-200 leading-relaxed">
              {prediction.clinical_reasoning}
            </p>
          </div>
        )}

        {/* Explainability Visualizations (Original, Heatmap, Overlay) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Grad-CAM Visual Explainability Triple-View</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-300 block">Original Lesion</span>
              <div className="w-full h-44 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800/80">
                <img
                  src={prediction.image_path}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-cyan-300 block">Attention Heatmap</span>
              <div className="w-full h-44 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800/80">
                {prediction.explainability_heatmap_path ? (
                  <img
                    src={prediction.explainability_heatmap_path}
                    alt="Heatmap"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                    Heatmap unavailable
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-emerald-300 block">Grad-CAM Overlay</span>
              <div className="w-full h-44 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800/80">
                {prediction.explainability_overlay_path ? (
                  <img
                    src={prediction.explainability_overlay_path}
                    alt="Overlay"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                    Overlay unavailable
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Probabilities & ABCD criteria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase font-mono">
              7-Class Probabilities
            </h4>
            <div className="space-y-2">
              {Object.entries(prediction.probabilities || {})
                .sort(([, a], [, b]) => b - a)
                .map(([clsKey, prob]) => {
                  const percent = (prob * 100).toFixed(1);
                  const isPredicted = clsKey === prediction.predicted_class;
                  return (
                    <div key={clsKey} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isPredicted ? 'text-cyan-300 font-bold' : 'text-neutral-400'}>
                          {clsKey.toUpperCase()}
                        </span>
                        <span className="font-mono text-neutral-300">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isPredicted ? 'bg-cyan-500' : 'bg-neutral-700'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase font-mono">
              Dermoscopic ABCD Analysis
            </h4>
            {prediction.dermoscopic_features ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400">Asymmetry Score</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {prediction.dermoscopic_features.asymmetry_index}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400">Border Compactness</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {prediction.dermoscopic_features.border_irregularity}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400">Color Heterogeneity</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {prediction.dermoscopic_features.color_variegation}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400">Estimated Diameter</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {prediction.dermoscopic_features.estimated_diameter_mm} mm
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 text-xs">ABCD characteristics logged on server.</div>
            )}

            {prediction.notes && (
              <div className="pt-2 border-t border-neutral-800 text-xs">
                <span className="text-neutral-500 block text-[10px]">RESEARCH NOTES</span>
                <p className="text-neutral-300 italic">&quot;{prediction.notes}&quot;</p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            This record represents a research prototype evaluation. It does not constitute a medical diagnosis or disease certainty.
          </span>
        </div>
      </div>
    </div>
  );
};
