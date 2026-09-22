import React, { useState } from 'react';
import { Navigation, ShieldCheck, AlertCircle, RefreshCw, Radio, MapPin, Copy, Check, Crosshair } from 'lucide-react';

interface LiveLocationCardProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  error: string | null;
  isTracking: boolean;
  address?: string | null;
  isResolvingAddress?: boolean;
  onUseCurrentLocation: () => void;
  onStopTracking?: () => void;
  onCenterMap?: () => void;
}

export const LiveLocationCard: React.FC<LiveLocationCardProps> = ({
  latitude,
  longitude,
  accuracy,
  timestamp,
  error,
  isTracking,
  address,
  isResolvingAddress,
  onUseCurrentLocation,
  onStopTracking,
  onCenterMap,
}) => {
  const [copied, setCopied] = useState(false);

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel-elevated rounded-3xl p-5 border border-slate-800 shadow-xl relative overflow-hidden bg-slate-900/90">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Status Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-3 h-3">
            {isTracking ? (
              <>
                <span className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {isTracking ? 'Live Location Tracking: Active' : 'Live Location: Standby'}
              </span>
              {isResolvingAddress && (
                <span className="text-[10px] text-emerald-400 font-medium animate-pulse">
                  (Resolving Address...)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {latitude !== null && longitude !== null
                ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${accuracy ?? 0}m GPS) • ${formattedTime || 'Live'}`
                : 'Nagpur Center [21.1458, 79.0882]'}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-2">
          {onCenterMap && latitude !== null && (
            <button
              onClick={onCenterMap}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95"
            >
              <Crosshair className="w-3.5 h-3.5 text-blue-400" />
              <span>Center on Me</span>
            </button>
          )}

          <button
            onClick={onUseCurrentLocation}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Update GPS</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start space-x-2 text-xs text-red-300 mb-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Street Address Display Box */}
      <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                Your Current Physical Street Address
              </span>
              <p className="text-base font-bold text-white mt-1 leading-snug">
                {address || 'Fetching street, area, and city address from GPS satellite coordinates...'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Location • Instant Reverse Geocoded (Nagpur Civil Sector)</span>
              </p>
            </div>
          </div>

          {address && (
            <button
              onClick={handleCopyAddress}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 shrink-0 flex items-center space-x-1.5 transition active:scale-95"
              title="Copy detected address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
