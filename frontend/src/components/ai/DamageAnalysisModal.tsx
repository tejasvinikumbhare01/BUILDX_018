import React, { useState } from 'react';
import { X, Camera, Sparkles, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface DamageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DamageAnalysisModal: React.FC<DamageAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please choose or snap a disaster photo first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/ai/damage-analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data.assessment);
    } catch (err: any) {
      console.error('Damage analysis error:', err);
      setError(err.response?.data?.error || 'Failed to complete damage classification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel-elevated w-full max-w-lg rounded-3xl p-6 border border-cyan-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI DAMAGE ANALYSIS</h3>
              <p className="text-xs text-slate-400">Computer Vision Structural &amp; Hazard Classification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* File Picker / Preview Box */}
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-4 text-center cursor-pointer transition relative bg-slate-900/60">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {preview ? (
              <div className="space-y-2">
                <img
                  src={preview}
                  alt="Disaster Preview"
                  className="max-h-48 rounded-xl mx-auto object-cover border border-slate-700"
                />
                <p className="text-slate-400 text-[11px]">Click or drag to change image</p>
              </div>
            ) : (
              <div className="py-6 space-y-2">
                <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-slate-200 font-semibold">Upload or capture disaster scene</p>
                <p className="text-slate-500 text-[11px]">Supports JPEG, PNG, WEBP up to 10MB</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition active:scale-95 disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Computer Vision Model...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute Vision Classification</span>
              </>
            )}
          </button>

          {/* Results Display */}
          {result && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Classification Result
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Confidence: {Math.round(result.confidence * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Identified Hazard Type</span>
                  <span className="text-sm font-bold text-white">{result.damageType}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Estimated Severity</span>
                  <span className="text-sm font-bold text-red-400">{result.severity}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Recommended Response Strategy</span>
                <p className="text-slate-200 leading-relaxed">{result.recommendedResponse}</p>
              </div>

              {result.uncertaintyDisclaimer && (
                <p className="text-[11px] text-amber-400/90 italic pt-1">
                  ⚠️ {result.uncertaintyDisclaimer}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
