import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, ChevronRight, ChevronLeft, Volume2 } from 'lucide-react';
import { Alert } from '../../types';

interface ActiveAlertsBannerProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

export const ActiveAlertsBanner: React.FC<ActiveAlertsBannerProps> = ({ alerts, onDismiss }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (!alerts || alerts.length === 0 || dismissed) return null;

  const alert = alerts[currentIndex % alerts.length];
  const isCritical = alert.severity === 'CRITICAL';
  const isInside = alert.isUserInsideHazardZone;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % alerts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + alerts.length) % alerts.length);
  };

  return (
    <div className="rounded-2xl border p-3.5 bg-red-50/90 border-red-200 shadow-sm text-slate-800 flex items-center justify-between gap-3 transition-all animate-fadeIn">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className={`p-2 rounded-xl shrink-0 ${isInside || isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-100 text-orange-700'}`}>
          {isInside ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        </div>

        <div className="overflow-hidden">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${isCritical ? 'bg-red-600 text-white' : 'bg-orange-200 text-orange-900'}`}>
              {alert.severity} ALERT
            </span>
            {isInside && (
              <span className="px-2 py-0.2 rounded text-[10px] font-black bg-amber-400 text-slate-950 uppercase">
                YOU ARE IN HAZARD ZONE
              </span>
            )}
            <h4 className="text-xs font-black text-slate-900 truncate">{alert.title}</h4>
          </div>
          <p className="text-xs text-slate-600 truncate mt-0.5 max-w-3xl">{alert.message}</p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0">
        {alerts.length > 1 && (
          <div className="flex items-center space-x-1 mr-2 text-[11px] font-mono text-slate-500">
            <span>{currentIndex + 1}/{alerts.length}</span>
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition"
              title="Previous alert"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition"
              title="Next alert"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            if (onDismiss) onDismiss(alert.id);
            else setDismissed(true);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition"
          title="Dismiss alert banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
