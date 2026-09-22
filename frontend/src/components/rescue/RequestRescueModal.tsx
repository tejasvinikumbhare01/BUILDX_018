import React, { useState, useEffect } from 'react';
import { X, AlertCircle, LifeBuoy, Users, CheckCircle, Loader2, Phone, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { RescuePriority } from '../../types';

interface RequestRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number | null;
  userLng: number | null;
  userAccuracy: number | null;
  userAddress?: string | null;
  onRequestLocation: () => void;
  onRescueSubmitted: (rescue: any) => void;
}

export const RequestRescueModal: React.FC<RequestRescueModalProps> = ({
  isOpen,
  onClose,
  userLat,
  userLng,
  userAccuracy,
  userAddress,
  onRequestLocation,
  onRescueSubmitted,
}) => {
  const [emergencyType, setEmergencyType] = useState('Flash Flood Inundation');
  const [numberOfPeople, setNumberOfPeople] = useState('2');
  const [medicalEmergency, setMedicalEmergency] = useState(false);
  const [childrenCount, setChildrenCount] = useState('0');
  const [elderlyCount, setElderlyCount] = useState('0');
  const [vulnerableCount, setVulnerableCount] = useState('0');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submittedRescue, setSubmittedRescue] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Calculate real-time preview priority
  const calculatePreviewPriority = (): RescuePriority => {
    let score = 0;
    if (medicalEmergency) score += 40;
    const typeLower = emergencyType.toLowerCase();
    if (typeLower.includes('flood') || typeLower.includes('water') || typeLower.includes('drown')) score += 30;
    else if (typeLower.includes('collaps') || typeLower.includes('trap')) score += 35;
    else if (typeLower.includes('fire')) score += 30;
    else score += 15;

    const vulTotal = parseInt(childrenCount || '0', 10) + parseInt(elderlyCount || '0', 10) + parseInt(vulnerableCount || '0', 10);
    score += Math.min(30, vulTotal * 10);

    const nPeople = parseInt(numberOfPeople || '1', 10);
    if (nPeople > 10) score += 20;
    else if (nPeople > 4) score += 10;
    else if (nPeople > 1) score += 5;

    if (score >= 65) return 'CRITICAL';
    if (score >= 45) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  };

  const previewPriority = calculatePreviewPriority();

  // Auto request location if not acquired
  useEffect(() => {
    if (isOpen && (userLat === null || userLng === null)) {
      onRequestLocation();
    }
  }, [isOpen, userLat, userLng, onRequestLocation]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userLat === null || userLng === null) {
      setError('Live GPS coordinates required. Please click "Get Current GPS Location".');
      return;
    }

    if (!description.trim()) {
      setError('Please provide details regarding your situation (floor level, water height, visible landmarks).');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        emergencyType,
        numberOfPeople: parseInt(numberOfPeople, 10),
        medicalEmergency,
        childrenCount: parseInt(childrenCount, 10),
        elderlyCount: parseInt(elderlyCount, 10),
        vulnerableCount: parseInt(vulnerableCount, 10),
        description,
        latitude: userLat,
        longitude: userLng,
        accuracy: userAccuracy,
      };

      const res = await api.post('/rescue', payload);
      setSubmittedRescue(res.data.rescue);
      setRecommendations(res.data.recommendedResponders || []);
      onRescueSubmitted(res.data.rescue);
    } catch (err: any) {
      console.error('Rescue submission error:', err);
      setError(err.response?.data?.error || 'Failed to submit rescue request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="glass-panel-elevated w-full max-w-lg rounded-3xl p-6 border border-red-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 animate-pulse">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">EMERGENCY RESCUE REQUEST</h3>
              <p className="text-xs text-red-400/90 font-medium">Immediate Tactical Dispatch Channel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedRescue ? (
          <div className="py-4 space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Rescue Request Dispatched</h4>
              <p className="text-slate-300">
                Official Incident Reference:{' '}
                <span className="font-mono font-bold text-emerald-400">{submittedRescue.id}</span>
              </p>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-300 border border-red-500/40">
                Priority: {submittedRescue.priority}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Nearest Recommended Responder Team
              </h5>
              {recommendations.length > 0 ? (
                recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-white text-sm">{rec.team.name}</p>
                      <p className="text-slate-400 text-[11px]">{rec.team.capability}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">{rec.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                        {rec.distanceKm} km away
                      </span>
                      <p className="text-[10px] text-emerald-400 font-medium mt-1">
                        Status: {rec.team.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">Finding available responders closest to your GPS fix...</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition"
            >
              Close & Monitor Map
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* GPS Telemetry & Physical Address */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Your Verified Location</span>
                  {userAddress && (
                    <span className="text-emerald-300 font-bold block text-xs leading-snug">
                      {userAddress}
                    </span>
                  )}
                  {userLat !== null && userLng !== null ? (
                    <span className="text-slate-300 font-mono text-[11px]">
                      {userLat.toFixed(5)}, {userLng.toFixed(5)} (±{userAccuracy ?? 0}m)
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">Location not acquired</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onRequestLocation}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-[11px] shrink-0"
              >
                Refresh GPS
              </button>
            </div>


            {/* Priority Indicator Pill */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 font-medium">Automated Triage Priority Calculation:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  previewPriority === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                    : previewPriority === 'HIGH'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                }`}
              >
                {previewPriority}
              </span>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Emergency Type</label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500"
              >
                <option value="Flash Flood Inundation">Flash Flood – Rising Water Levels</option>
                <option value="Trapped in Submerged Building">Trapped in Submerged / Collapsed Structure</option>
                <option value="Structural Fire & Smoke Enclosure">Structural Fire & Smoke Enclosure</option>
                <option value="Severe Medical Trauma">Severe Medical Trauma / Unconscious Victim</option>
                <option value="Landslide Debris Isolation">Landslide Debris Isolation</option>
                <option value="Other Life Safety Urgent">Other Life Safety Emergency</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Total People Needing Rescue</label>
                <input
                  type="number"
                  min="1"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500 font-bold"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={medicalEmergency}
                    onChange={(e) => setMedicalEmergency(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-bold text-red-400">Critical Medical Emergency</span>
                </label>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-300 block text-[11px]">Vulnerable Demographic Breakdown</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px]">Children (&lt;12)</label>
                  <input
                    type="number"
                    min="0"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">Elderly (&gt;65)</label>
                  <input
                    type="number"
                    min="0"
                    value={elderlyCount}
                    onChange={(e) => setElderlyCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px]">Disabled / Vulnerable</label>
                  <input
                    type="number"
                    min="0"
                    value={vulnerableCount}
                    onChange={(e) => setVulnerableCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Detailed Situation & Immediate Threats</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="State floor level, water depth, presence of electric wires, injuries, specific obstacles..."
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
                <span>TRANSMIT RESCUE DISPATCH</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
