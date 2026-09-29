import React, { useState } from 'react';
import {
  GitCompare,
  Cpu,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ModelVersion } from '../types';
import { api } from '../services/api';

interface Props {
  models: ModelVersion[];
  activeModel: ModelVersion | null;
  isAdmin: boolean;
  onModelActivated?: (updated: ModelVersion) => void;
}

export const ComparisonPage: React.FC<Props> = ({
  models,
  activeModel,
  isAdmin,
  onModelActivated,
}) => {
  const [selectedModel, setSelectedModel] = useState<ModelVersion | null>(
    activeModel || (models.length > 0 ? models[0] : null)
  );
  const [switching, setSwitching] = useState(false);

  const handleActivate = async (modelId: string) => {
    if (!isAdmin) return;
    setSwitching(true);
    try {
      const res = await api.activateModel(modelId);
      if (onModelActivated) {
        onModelActivated(res.active_model);
      }
      setSelectedModel(res.active_model);
    } catch (err: any) {
      alert(err.message || 'Failed to switch active model.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Multi-Architecture Benchmarking
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
            Identical Test Split (N=1,502)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Deep Learning Model Comparison
        </h1>
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Benchmark Guideline:</strong> Model selection should consider multiple metrics and clinical/research requirements,
            not accuracy alone. A model with high overall accuracy may have low sensitivity for rare, life-threatening malignancies
            due to class imbalance.
          </p>
        </div>
      </div>

      {/* Comparison Leaderboard Table */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span>Comparative Metrics Matrix</span>
          <span className="text-xs font-normal text-neutral-400">
            {models.length} Candidates Evaluated
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                <th className="pb-3 font-semibold">Model Architecture</th>
                <th className="pb-3 font-semibold text-right">Test Accuracy</th>
                <th className="pb-3 font-semibold text-right">Macro Precision</th>
                <th className="pb-3 font-semibold text-right">Macro Recall</th>
                <th className="pb-3 font-semibold text-right">Macro F1</th>
                <th className="pb-3 font-semibold text-right">ROC-AUC (OvR)</th>
                <th className="pb-3 font-semibold text-right">Parameters</th>
                <th className="pb-3 font-semibold text-right">Inference Latency</th>
                <th className="pb-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {models.map((m) => {
                const isActive = activeModel?.model_id === m.model_id;
                const isSelected = selectedModel?.model_id === m.model_id;
                return (
                  <tr
                    key={m.model_id}
                    onClick={() => setSelectedModel(m)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-cyan-500/10' : 'hover:bg-neutral-800/40'
                    }`}
                  >
                    <td className="py-3.5 font-sans font-bold text-neutral-200">
                      <div className="flex items-center gap-2">
                        <span>{m.model_name}</span>
                        {isActive && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono font-normal">
                        v{m.version}
                      </div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-sky-400">
                      {(m.metrics.test_accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 text-right text-neutral-300">
                      {(m.metrics.macro_precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 text-right text-emerald-400 font-bold">
                      {(m.metrics.macro_recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 text-right text-purple-400 font-bold">
                      {m.metrics.macro_f1.toFixed(4)}
                    </td>
                    <td className="py-3.5 text-right text-amber-400">
                      {m.metrics.roc_auc_ovr.toFixed(4)}
                    </td>
                    <td className="py-3.5 text-right text-neutral-400">
                      {(m.parameters / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3.5 text-right text-neutral-300">
                      {m.inference_time_ms} ms
                    </td>
                    <td className="py-3.5 text-center">
                      {isActive ? (
                        <span className="text-emerald-400 font-bold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Deployed</span>
                        </span>
                      ) : isAdmin ? (
                        <button
                          disabled={switching}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivate(m.model_id);
                          }}
                          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-cyan-600 text-neutral-300 hover:text-white text-[10px] font-semibold transition"
                        >
                          Activate
                        </button>
                      ) : (
                        <span className="text-neutral-600 text-[11px]">Benchmarked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Model Deep Dive Specifications */}
      {selectedModel && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Architecture Deep Dive
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {selectedModel.model_name} (v{selectedModel.version})
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {selectedModel.architecture}
              </p>
            </div>

            {isAdmin && !selectedModel.is_active && (
              <button
                disabled={switching}
                onClick={() => handleActivate(selectedModel.model_id)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition self-start sm:self-auto"
              >
                {switching ? 'Activating...' : 'Set as Active Inference Model'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">TOTAL PARAMETERS</span>
              <span className="text-neutral-200 font-bold text-sm">
                {selectedModel.parameters.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">INPUT RESOLUTION</span>
              <span className="text-neutral-200 font-bold text-sm">224 x 224 x 3</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">OPTIMIZER & LR</span>
              <span className="text-neutral-200 font-bold text-sm truncate block">
                {selectedModel.optimizer}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">TRAINING EPOCHS</span>
              <span className="text-neutral-200 font-bold text-sm">
                {selectedModel.early_stopped_epoch || selectedModel.training_epochs} / {selectedModel.training_epochs} (Early Stop)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
              Loss Function & Training Dynamics
            </h4>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-mono">
              {selectedModel.loss_function}
            </div>
          </div>

          {selectedModel.class_metrics && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">
                Class-Specific Performance Under This Model
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                {Object.entries(selectedModel.class_metrics).map(([clsKey, cMeta]: [string, any]) => (
                  <div key={clsKey} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400 uppercase">{clsKey}</span>
                      <span className="text-[10px] text-neutral-400">F1: {cMeta.f1.toFixed(3)}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Recall: <span className="text-emerald-400">{(cMeta.recall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Specificity: <span className="text-neutral-300">{(cMeta.specificity * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
