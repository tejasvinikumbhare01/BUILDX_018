import React, { useState } from 'react';
import { X, Radio, AlertOctagon, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface BroadcastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLat: number;
  defaultLng: number;
  onAlertBroadcasted: (alert: any) => void;
}

export const BroadcastAlertModal: React.FC<BroadcastAlertModalProps> = ({
  isOpen,
  onClose,
  defaultLat,
  defaultLng,
  onAlertBroadcasted,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL'>('CRITICAL');
  const [latitude, setLatitude] = useState(defaultLat.toString());
  const [longitude, setLongitude] = useState(defaultLng.toString());
  const [radiusKm, setRadiusKm] = useState('8.0');
  const [hoursValid, setHoursValid] = useState('24');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Please provide an alert title and detailed civil defense advisory message.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const expiresAt = new Date(Date.now() + parseInt(hoursValid, 10) * 60 * 60 * 1000).toISOString();

      const res = await api.post('/alerts', {
        title,
        message,
        severity,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusKm: parseFloat(radiusKm),
        expiresAt,
      });

      onAlertBroadcasted(res.data.alert);
      onClose();
    } catch (err: any) {
      console.error('Broadcast alert error:', err);
      setError(err.response?.data?.error || 'Failed to broadcast emergency alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel-elevated w-full max-w-lg rounded-3xl p-6 border border-red-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">BROADCAST EMERGENCY ALERT</h3>
              <p className="text-xs text-slate-400">Tactical Geo-fenced Civil Defense Warning</p>
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
          <div className="p-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Alert Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FLASH FLOOD EVACUATION ORDER - LOWER BASIN"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500"
              >
                <option value="CRITICAL">Critical Danger (Immediate Evac)</option>
                <option value="DANGER">Danger (Severe Threat)</option>
                <option value="WARNING">Warning (Hazard Advisory)</option>
                <option value="INFO">Informational (Public Notice)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Radius (km)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-300 block text-[11px]">Epicenter Geographical Coordinates</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px]">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[10px]">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Civil Defense Advisory Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Immediate directives, designated elevated evacuation centers, impassable bridge closures..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/40 transition active:scale-95 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>BROADCAST TO CITIZENS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
