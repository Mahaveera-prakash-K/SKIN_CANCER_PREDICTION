import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  Layers,
  ArrowUpDown,
  Download,
  AlertCircle,
  X
} from 'lucide-react';
import { PredictionRecord } from '../types';
import { api } from '../services/api';

interface Props {
  predictions: PredictionRecord[];
  onDeletePrediction: (id: number) => void;
  onSelectPrediction: (pred: PredictionRecord) => void;
}

export const HistoryPage: React.FC<Props> = ({
  predictions,
  onDeletePrediction,
  onSelectPrediction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'confidence'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & Search
  const filtered = predictions.filter((p) => {
    const matchesSearch =
      p.predicted_class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.predicted_class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = classFilter === 'ALL' || p.predicted_class === classFilter;
    return matchesSearch && matchesClass;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'confidence') {
      return sortOrder === 'desc' ? b.confidence - a.confidence : a.confidence - b.confidence;
    }
    return sortOrder === 'desc'
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this prediction record from your history?')) {
      return;
    }
    try {
      await api.deletePrediction(id);
      onDeletePrediction(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete record.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
          Historical Audit Trail
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
          Prediction History
        </h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
          Complete log of previous dermatoscopic classifications, model versions, confidence scores, and Grad-CAM
          artifacts. Private to your research account.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by class or notes..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter and Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Diagnostic Classes</option>
              <option value="mel">Melanoma (mel)</option>
              <option value="bcc">Basal Cell Carcinoma (bcc)</option>
              <option value="akiec">Actinic Keratoses (akiec)</option>
              <option value="bkl">Benign Keratosis (bkl)</option>
              <option value="df">Dermatofibroma (df)</option>
              <option value="nv">Melanocytic Nevus (nv)</option>
              <option value="vasc">Vascular Lesion (vasc)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [any, any];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="confidence-desc">Highest Confidence</option>
              <option value="confidence-asc">Lowest Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
        {paginated.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-neutral-600" />
            <p>No matching prediction records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Thumbnail</th>
                  <th className="pb-3 font-semibold">Predicted Class</th>
                  <th className="pb-3 font-semibold">Model Confidence</th>
                  <th className="pb-3 font-semibold">Architecture</th>
                  <th className="pb-3 font-semibold">Version</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {paginated.map((pred) => (
                  <tr key={pred.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3.5 text-neutral-400 font-mono text-[11px]">
                      {new Date(pred.created_at).toLocaleDateString()} {new Date(pred.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800">
                        <img
                          src={pred.explainability_overlay_path || pred.image_path}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 font-bold text-neutral-200">
                      <div>{pred.predicted_class_name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono uppercase">
                        {pred.predicted_class}
                      </div>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-cyan-400">
                      {(pred.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 text-neutral-300">
                      {pred.model_name}
                    </td>
                    <td className="py-3.5 text-neutral-500 font-mono">
                      {pred.model_version}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => onSelectPrediction(pred)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(pred.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-neutral-800 text-xs">
            <span className="text-neutral-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} records
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 font-semibold"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 font-mono text-neutral-400">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
