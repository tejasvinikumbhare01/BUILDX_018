import React, { useState } from 'react';
import { X, Navigation, ShieldCheck, AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { Shelter } from '../../types';

interface EvacuationRoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number | null;
  userLng: number | null;
  shelters: Shelter[];
  onRouteCalculated: (routeData: any) => void;
}

export const EvacuationRoutingModal: React.FC<EvacuationRoutingModalProps> = ({
  isOpen,
  onClose,
  userLat,
  userLng,
  shelters,
  onRouteCalculated,
}) => {
  const [selectedShelterId, setSelectedShelterId] = useState<string>(shelters[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCalculateRoute = async () => {
    if (userLat === null || userLng === null) {
      setError('Your live GPS location is required to calculate safe evacuation routing.');
      return;
    }

    if (!selectedShelterId) {
      setError('Please choose a destination shelter.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.get('/routing/evacuation', {
        params: {
          originLat: userLat,
          originLng: userLng,
          shelterId: selectedShelterId,
        },
      });

      setRouteResult(res.data);
      onRouteCalculated(res.data.geometry);
    } catch (err: any) {
      console.error('Routing calculation failed:', err);
      setError(err.response?.data?.error || 'Failed to compute route with OpenStreetMap routing service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel-elevated w-full max-w-lg rounded-3xl p-6 border border-emerald-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">TACTICAL EVACUATION ROUTING</h3>
              <p className="text-xs text-slate-400">OpenStreetMap Road Network Navigation with Hazard Avoidance</p>
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
          <div className="p-3 mb-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* Origin & Destination */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Origin: Current GPS Location</span>
                {userLat !== null && userLng !== null ? (
                  <span className="text-white font-mono font-bold">
                    {userLat.toFixed(5)}, {userLng.toFixed(5)}
                  </span>
                ) : (
                  <span className="text-amber-400">Please enable browser GPS</span>
                )}
              </div>
            </div>

            <div className="border-l-2 border-dashed border-slate-700 ml-1.5 pl-4 py-1 text-slate-500 text-[11px]">
              ↓ Direct Road Corridor
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 block font-medium mb-1">
                  Destination: Choose Emergency Shelter
                </label>
                <select
                  value={selectedShelterId}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  {shelters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.availableCapacity ?? (s.capacity - s.currentOccupancy)} beds free)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCalculateRoute}
            disabled={loading || userLat === null}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculating Verified Route...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Calculate Safe Evacuation Path</span>
              </>
            )}
          </button>

          {/* Route Evaluation Details */}
          {routeResult && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm">Path Metrics</span>
                <div className="flex items-center space-x-3 text-slate-300 font-mono">
                  <span>Dist: <strong className="text-white">{routeResult.distanceKm} km</strong></span>
                  <span>Est. Time: <strong className="text-white">{routeResult.durationMin} min</strong></span>
                </div>
              </div>

              {/* Safety assessment badge */}
              <div
                className={`p-3 rounded-xl border flex items-start space-x-2.5 ${
                  routeResult.isRouteVerifiedSafe
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {routeResult.isRouteVerifiedSafe ? (
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {routeResult.isRouteVerifiedSafe ? 'Verified Safe Corridor' : 'Hazard Obstacle Alert'}
                  </p>
                  <p className="text-[11px] leading-relaxed mt-0.5">{routeResult.hazardWarning}</p>
                </div>
              </div>

              {/* Step by step summary */}
              {routeResult.steps && routeResult.steps.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-semibold text-slate-400 block text-[11px]">Key Navigation Waypoints</span>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] text-slate-300">
                    {routeResult.steps.slice(0, 5).map((step: any, idx: number) => (
                      <div key={idx} className="p-1.5 rounded bg-slate-950/80 border border-slate-800 flex justify-between">
                        <span className="truncate">{step.instruction || 'Continue on road'}</span>
                        <span className="text-slate-500 shrink-0 ml-2">{Math.round(step.distance)}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition mt-2"
              >
                View Route on Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
