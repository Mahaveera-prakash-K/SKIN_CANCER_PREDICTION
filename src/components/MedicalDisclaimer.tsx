import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<Props> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-medium">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>AI Research Prototype — Non-diagnostic use only. Consult a healthcare professional.</span>
      </div>
    );
  }

  return (
    <aside
      aria-label="Medical Research Prototype Notice"
      className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-neutral-900/50 p-4 text-neutral-200 shadow-sm backdrop-blur-md"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-amber-300 uppercase tracking-wider">
              Medical Research Disclaimer & Clinical Boundary
            </h4>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              Research Prototype Only
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            This application is an AI research prototype for skin-image classification. It does not provide a
            medical diagnosis and should not replace evaluation by a qualified healthcare professional. Model
            predictions represent statistical feature correlations and model confidence scores, not clinical
            determinations or disease probabilities.
          </p>
        </div>
      </div>
    </aside>
  );
};
