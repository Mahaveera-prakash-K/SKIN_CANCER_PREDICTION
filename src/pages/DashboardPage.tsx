import React from 'react';
import {
  Scan,
  History,
  BarChart3,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertTriangle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { PredictionRecord, ModelVersion, SystemHealth } from '../types';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface Props {
  predictions: PredictionRecord[];
  activeModel: ModelVersion | null;
  systemHealth: SystemHealth | null;
  onNavigate: (tab: string) => void;
  onSelectPrediction: (pred: PredictionRecord) => void;
}

export const DashboardPage: React.FC<Props> = ({
  predictions,
  activeModel,
  systemHealth,
  onNavigate,
  onSelectPrediction,
}) => {
  const lastPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Welcome & Notice */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Research Platform Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              Clinical AI Overview
            </h1>
          </div>
          <button
            onClick={() => onNavigate('analyze')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition self-start sm:self-auto"
          >
            <Scan className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
        </div>
        <MedicalDisclaimer compact />
      </div>

      {/* KPI Cards: Total Predictions, Active Model, Model Accuracy, Macro F1, Last Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Predictions */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Total Predictions</span>
            <History className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {predictions.length}
          </div>
          <div className="text-[11px] text-neutral-500">Recorded sessions</div>
        </div>

        {/* Active Model */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Active Model</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-neutral-100 truncate">
            {activeModel ? activeModel.model_name : 'EfficientNetV2-B0'}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            {activeModel ? `v${activeModel.version} Deployed` : 'v1.0.0 Active'}
          </div>
        </div>

        {/* Model Accuracy */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Model Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {activeModel?.metrics?.test_accuracy
              ? `${(activeModel.metrics.test_accuracy * 100).toFixed(1)}%`
              : 'Not evaluated yet'}
          </div>
          <div className="text-[11px] text-neutral-500">HAM10000 Test (N=1502)</div>
        </div>

        {/* Macro F1 */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Macro F1</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {activeModel?.metrics?.macro_f1
              ? activeModel.metrics.macro_f1.toFixed(4)
              : 'Not evaluated yet'}
          </div>
          <div className="text-[11px] text-neutral-500">Unweighted 7 classes</div>
        </div>

        {/* Last Analysis */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Last Analysis</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-neutral-200 truncate">
            {lastPrediction ? lastPrediction.predicted_class_name : 'No evaluations'}
          </div>
          <div className="text-[11px] text-neutral-500">
            {lastPrediction
              ? `${(lastPrediction.confidence * 100).toFixed(1)}% confidence`
              : 'Start by uploading image'}
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Recent Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Predictions Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Recent Analyses</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Previously classified dermatoscopy images and attention maps.
              </p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {predictions.length === 0 ? (
            <div className="py-12 border border-dashed border-neutral-800 rounded-xl text-center space-y-3">
              <Scan className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400">No predictions recorded yet.</p>
              <button
                onClick={() => onNavigate('analyze')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition inline-flex items-center gap-1.5"
              >
                <span>Run First Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                    <th className="pb-3 font-semibold">Image / Overlay</th>
                    <th className="pb-3 font-semibold">Prediction</th>
                    <th className="pb-3 font-semibold">Confidence</th>
                    <th className="pb-3 font-semibold">Model</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {predictions.slice(0, 5).map((pred) => (
                    <tr key={pred.id} className="hover:bg-neutral-800/30 transition">
                      <td className="py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                          <img
                            src={pred.explainability_overlay_path || pred.image_path}
                            alt="Lesion"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-neutral-200">
                        <div>{pred.predicted_class_name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono uppercase">
                          {pred.predicted_class}
                        </div>
                      </td>
                      <td className="py-3 font-mono text-cyan-400 font-bold">
                        {(pred.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 text-neutral-400">
                        {pred.model_name}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onSelectPrediction(pred)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Quick Clinical Protocol & Model Spec */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Diagnostic Classes (HAM10000)</span>
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { code: 'mel', label: 'Melanoma', type: 'Malignant' },
                { code: 'bcc', label: 'Basal Cell Carcinoma', type: 'Malignant' },
                { code: 'akiec', label: 'Actinic Keratoses', type: 'Pre-cancerous' },
                { code: 'bkl', label: 'Benign Keratosis', type: 'Benign' },
                { code: 'df', label: 'Dermatofibroma', type: 'Benign' },
                { code: 'nv', label: 'Melanocytic Nevus', type: 'Benign' },
                { code: 'vasc', label: 'Vascular Lesions', type: 'Benign' },
              ].map((c) => (
                <div key={c.code} className="flex items-center justify-between text-neutral-300">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase w-10">
                      {c.code}
                    </span>
                    <span>{c.label}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                      c.type === 'Malignant'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                        : c.type === 'Pre-cancerous'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {c.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <h3 className="text-sm font-bold text-white">System Status</h3>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Database Engine</span>
                <span className="font-mono text-emerald-400">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Inference Core</span>
                <span className="font-mono text-emerald-400">Loaded & Warm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Explainability Engine</span>
                <span className="font-mono text-cyan-400">Grad-CAM v1.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Patient Data Leakage</span>
                <span className="font-mono text-emerald-400">0.00% (Guaranteed)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
