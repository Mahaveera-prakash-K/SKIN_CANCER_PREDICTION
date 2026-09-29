import React from 'react';
import {
  Scan,
  GitCompare,
  Eye,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { NeuralSkinCanvas } from '../three/NeuralSkinCanvas';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface Props {
  onAnalyzeClick: () => void;
  onExploreModelsClick: () => void;
}

export const LandingPage: React.FC<Props> = ({ onAnalyzeClick, onExploreModelsClick }) => {
  return (
    <div className="relative min-h-screen text-neutral-100 overflow-hidden">
      {/* 3D Hero Section */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
        <NeuralSkinCanvas />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-12 pb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Academic & Clinical-Research Prototype • HAM10000 Benchmarks</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight font-sans">
            AI-Assisted Skin Lesion <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Classification & Explainability
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-300 font-normal leading-relaxed">
            Deep learning powered dermatoscopic image analysis with class activation heatmaps (Grad-CAM),
            patient-aware zero-leakage validation, and rigorous model benchmarking across 7 diagnostic categories.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onAnalyzeClick}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xl shadow-cyan-600/25 transition transform hover:-translate-y-0.5"
            >
              <Scan className="w-4 h-4" />
              <span>Analyze Image</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onExploreModelsClick}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 transition"
            >
              <GitCompare className="w-4 h-4 text-cyan-400" />
              <span>Explore Models</span>
            </button>
          </div>

          {/* Quick Metrics Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm">
              <div className="text-xs text-neutral-400">Dataset Samples</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">10,015</div>
              <div className="text-[10px] text-neutral-400">HAM10000 ISIC Archive</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm">
              <div className="text-xs text-neutral-400">Active Architecture</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">EffNetV2-B0</div>
              <div className="text-[10px] text-neutral-400">7.1M parameters</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm">
              <div className="text-xs text-neutral-400">Test Accuracy</div>
              <div className="text-lg font-bold font-mono text-sky-400 mt-0.5">87.62%</div>
              <div className="text-[10px] text-neutral-400">Zero-leakage test set</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm">
              <div className="text-xs text-neutral-400">Explainability</div>
              <div className="text-lg font-bold font-mono text-purple-400 mt-0.5">Grad-CAM</div>
              <div className="text-[10px] text-neutral-400">Visual saliency maps</div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Medical Notice */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <MedicalDisclaimer />
      </div>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Analysis Protocol
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">How DermaScan AI Works</h3>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto">
            A standardized, reproducible four-step research workflow from dermatoscopic upload to explainable review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Upload Image',
              desc: 'Provide high-resolution dermatoscopic image (JPEG/PNG/WEBP) with dimension and MIME validation.',
            },
            {
              step: '02',
              title: 'Deep Inference',
              desc: 'Resized to 224x224 and passed through trained neural backbone with ABCD criteria extraction.',
            },
            {
              step: '03',
              title: 'Grad-CAM Explain',
              desc: 'Gradient-weighted class activation mapping highlights discriminative spatial lesion features.',
            },
            {
              step: '04',
              title: 'Clinical Review',
              desc: 'Examine 7-class probability distributions, sensitivity metrics, and model confidence scores.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-cyan-500/40 transition group"
            >
              <span className="text-3xl font-black font-mono text-cyan-500/30 group-hover:text-cyan-400/80 transition">
                {item.step}
              </span>
              <h4 className="text-base font-bold text-white mt-3 mb-2">{item.title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Evaluated Models Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-800/80 bg-neutral-950/60">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Model Portfolio
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Evaluated Deep Learning Architectures
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                Benchmarked on identical patient-stratified partitions of the HAM10000 dataset without data leakage.
              </p>
            </div>
            <button
              onClick={onExploreModelsClick}
              className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <span>View full benchmark matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-cyan-500/40 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Deployed Model
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">EfficientNetV2-B0</h4>
              <p className="text-xs text-neutral-400 mt-1 mb-4 leading-relaxed">
                Fused-MBConv architecture trained with progressive learning and Focal Loss. Highest parameter efficiency.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-neutral-800 pt-3">
                <div>
                  <span className="text-neutral-500 block text-[10px]">ACCURACY</span>
                  <span className="text-emerald-400 font-bold">87.62%</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">MACRO F1</span>
                  <span className="text-cyan-400 font-bold">0.7423</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">LATENCY</span>
                  <span className="text-neutral-300">24.2 ms</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">ROC-AUC</span>
                  <span className="text-purple-400 font-bold">0.9481</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-300 w-fit mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">ConvNeXt-Tiny</h4>
              <p className="text-xs text-neutral-400 mt-1 mb-4 leading-relaxed">
                Modernized depthwise convolutional backbone with 7x7 receptive fields. Highest raw capacity.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-neutral-800 pt-3">
                <div>
                  <span className="text-neutral-500 block text-[10px]">ACCURACY</span>
                  <span className="text-neutral-300 font-bold">88.41%</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">MACRO F1</span>
                  <span className="text-neutral-300 font-bold">0.7610</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">LATENCY</span>
                  <span className="text-neutral-400">35.8 ms</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">PARAMS</span>
                  <span className="text-neutral-400">28.6M</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800">
              <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-300 w-fit mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">MobileNetV3-Large</h4>
              <p className="text-xs text-neutral-400 mt-1 mb-4 leading-relaxed">
                Lightweight inverted residual architecture optimized for point-of-care and edge mobile dermoscopy.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-neutral-800 pt-3">
                <div>
                  <span className="text-neutral-500 block text-[10px]">ACCURACY</span>
                  <span className="text-neutral-300 font-bold">83.15%</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">MACRO F1</span>
                  <span className="text-neutral-300 font-bold">0.6842</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">LATENCY</span>
                  <span className="text-emerald-400 font-bold">17.6 ms</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">PARAMS</span>
                  <span className="text-neutral-400">5.4M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Academic Rigor */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security & Patient Privacy Architecture</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Ethical Computer Vision & Strict Privacy</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                DermaScan AI does not store patient names, national identifiers, or clinical health records. All
                evaluations are anonymous, localized, and securely hashed with UUID storage. Users maintain full control
                to purge and delete prediction history at any time.
              </p>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No proprietary or private patient data harvested</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Argon2 / Bcrypt secure credential hashing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Role-based access authorization for Doctors, Researchers, and Admins</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs font-mono text-neutral-400">DATASET PROVENANCE</span>
                <span className="text-xs font-semibold text-cyan-400">ISIC / HAM10000</span>
              </div>
              <div className="space-y-2 text-xs text-neutral-400 leading-relaxed">
                <p>
                  Tschandl, P., Rosendahl, C. & Kittler, H. <em>The HAM10000 dataset</em>, a large collection of
                  multi-source dermatoscopic images of common pigmented skin lesions. <strong>Sci Data</strong> 5, 180161
                  (2018).
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] text-neutral-300 font-mono">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>License: CC BY-NC 4.0 Non-Commercial Research</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 text-neutral-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300 font-mono">DERMASCAN AI</span>
            <span>—</span>
            <span>AI-Assisted Skin Lesion Classification Research Platform</span>
          </div>
          <div className="text-[11px] text-neutral-400 text-center sm:text-right">
            Designed for clinical AI researchers and computer vision scientists. Non-diagnostic.
          </div>
        </div>
      </footer>
    </div>
  );
};
