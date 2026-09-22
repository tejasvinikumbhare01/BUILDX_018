import React, { useState } from 'react';
import { X, MapPin, Camera, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { IncidentType, SeverityLevel } from '../../types';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number | null;
  userLng: number | null;
  userAccuracy: number | null;
  userAddress?: string | null;
  onRequestLocation: () => void;
  onIncidentReported: (incident: any) => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  userLat,
  userLng,
  userAccuracy,
  userAddress,
  onRequestLocation,
  onIncidentReported,
}) => {
  const [type, setType] = useState<IncidentType>('FLOOD');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState(userAddress || '');
  const [peopleAffected, setPeopleAffected] = useState('1');
  const [rescueRequired, setRescueRequired] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultId, setResultId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (userAddress && !address) {
      setAddress(userAddress);
    }
  }, [userAddress, address]);

  if (!isOpen) return null;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userLat === null || userLng === null) {
      setError('Please click "USE CURRENT LOCATION" to attach your real GPS coordinates.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide an incident description.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('type', type);
      formData.append('severity', severity);
      formData.append('description', description);
      formData.append('latitude', userLat.toString());
      formData.append('longitude', userLng.toString());
      if (userAccuracy) formData.append('accuracy', userAccuracy.toString());
      if (address) formData.append('address', address);
      formData.append('peopleAffected', peopleAffected);
      formData.append('rescueRequired', rescueRequired.toString());

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await api.post('/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResultId(response.data.incident.id);
      onIncidentReported(response.data.incident);
    } catch (err: any) {
      console.error('Report submission failed:', err);
      setError(err.response?.data?.error || 'Failed to submit incident report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel-elevated w-full max-w-lg rounded-3xl p-6 border border-slate-700/80 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">REPORT INCIDENT</h3>
              <p className="text-xs text-slate-400">Verified Citizen & Emergency Dispatch Intake</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {resultId ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Incident Logged in Database</h4>
            <p className="text-xs text-slate-300">
              Your report has been permanently stored in PostgreSQL and broadcasted to emergency responders via Socket.IO.
            </p>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-sm text-emerald-400 font-bold">
              Official Incident ID: {resultId}
            </div>
            <button
              onClick={() => {
                setResultId(null);
                onClose();
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                {error}
              </div>
            )}

            {/* GPS Coordinates Section */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Incident GPS Location</span>
                <button
                  type="button"
                  onClick={onRequestLocation}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>USE CURRENT LOCATION</span>
                </button>
              </div>

              {userLat !== null && userLng !== null ? (
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300 pt-1">
                  <div>Lat: <span className="text-white font-bold">{userLat.toFixed(5)}</span></div>
                  <div>Lng: <span className="text-white font-bold">{userLng.toFixed(5)}</span></div>
                  <div>Accuracy: <span className="text-emerald-400 font-bold">±{userAccuracy ?? 0}m</span></div>
                </div>
              ) : (
                <p className="text-amber-400/90 text-[11px]">
                  ⚠️ No GPS coordinates acquired yet. Click the button above to capture real satellite location.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Incident Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as IncidentType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="FLOOD">Flood</option>
                  <option value="FIRE">Fire</option>
                  <option value="ROAD_BLOCKAGE">Road Blockage</option>
                  <option value="BUILDING_DAMAGE">Building Damage</option>
                  <option value="LANDSLIDE">Landslide</option>
                  <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="CRITICAL">Critical (Life-Threatening)</option>
                  <option value="HIGH">High (Urgent Attention)</option>
                  <option value="MEDIUM">Medium (Significant Damage)</option>
                  <option value="LOW">Low (Minor Hazard)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Address / Landmark (Optional)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14th St & Mission St, near subway station"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Incident Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe current hazard status, trapped victims, electrical hazards, water levels..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Estimated People Affected</label>
                <input
                  type="number"
                  min="1"
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rescueRequired}
                    onChange={(e) => setRescueRequired(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-red-400">Rescue Required Immediately</span>
                </label>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Attach Photo Evidence</label>
              <div className="flex items-center space-x-3 bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <label className="cursor-pointer flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600">
                  <Camera className="w-4 h-4" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </label>
                <span className="text-slate-400 text-xs truncate">
                  {photoFile ? photoFile.name : 'No image attached'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Submit Incident Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
