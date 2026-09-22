import React, { useState, useEffect } from 'react';
import { Shield, Radio, MapPin, CheckCircle, Navigation, Clock, Activity, AlertCircle, LifeBuoy } from 'lucide-react';
import { DisasterMap } from '../components/map/DisasterMap';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import { Incident, RescueRequest, RescueTeam } from '../types';

interface ResponderDashboardProps {
  user: any;
  userLat: number | null;
  userLng: number | null;
  userAccuracy: number | null;
  userTimestamp: number | null;
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
  incidents: Incident[];
  rescueRequests: RescueRequest[];
  shelters: any[];
  hospitals: any[];
  rescueTeams: RescueTeam[];
}

export const ResponderDashboard: React.FC<ResponderDashboardProps> = ({
  user,
  userLat,
  userLng,
  userAccuracy,
  userTimestamp,
  isTracking,
  onStartTracking,
  onStopTracking,
  incidents,
  rescueRequests,
  shelters,
  hospitals,
  rescueTeams,
}) => {
  const [onDuty, setOnDuty] = useState(true);
  const [currentMission, setCurrentMission] = useState<any | null>(null);
  const [missionStatus, setMissionStatus] = useState<string>('EN_ROUTE');
  const [updating, setUpdating] = useState(false);

  // When On-Duty changes, start/stop tracking and stream to backend
  const handleToggleDuty = async (nextDuty: boolean) => {
    setOnDuty(nextDuty);
    if (nextDuty) {
      onStartTracking();
    } else {
      onStopTracking();
    }

    if (userLat !== null && userLng !== null) {
      try {
        await api.post('/location', {
          latitude: userLat,
          longitude: userLng,
          accuracy: userAccuracy,
          onDuty: nextDuty,
        });
      } catch (err) {
        console.warn('Location status update error:', err);
      }
    }
  };

  // Stream live position updates to Socket.IO when on-duty
  useEffect(() => {
    if (onDuty && userLat !== null && userLng !== null) {
      socketService.streamResponderLocation({
        responderId: user?.id || 'responder-local',
        name: user?.name || 'Capt. Marcus Reed',
        latitude: userLat,
        longitude: userLng,
        accuracy: userAccuracy || undefined,
        status: onDuty ? 'ON_DUTY' : 'OFF_DUTY',
      });
    }
  }, [onDuty, userLat, userLng, userAccuracy, user]);

  // Find any active rescue request assigned to this responder's team
  const assignedRequests = rescueRequests.filter(
    (r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
  );

  const handleUpdateMissionStatus = async (requestId: string, status: string) => {
    try {
      setUpdating(true);
      await api.patch(`/rescue/${requestId}`, { status });
      setMissionStatus(status);
    } catch (err: any) {
      console.error('Mission update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* On-Duty / Off-Duty Tactical Control Bar */}
      <div className="glass-panel-elevated p-6 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className={`p-3 rounded-2xl ${onDuty ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Radio className={`w-7 h-7 ${onDuty ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-white">
                  {user?.name || 'Capt. Marcus Reed'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider ${
                  onDuty ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {onDuty ? 'ACTIVE ON DUTY' : 'OFF DUTY'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Role: Tactical First Responder / Swift Water Extraction Unit
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleToggleDuty(!onDuty)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition active:scale-95 ${
                onDuty
                  ? 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              {onDuty ? 'Go Off Duty (Halt GPS Streaming)' : 'Go On Duty (Activate Live GPS)'}
            </button>
          </div>
        </div>

        {/* Real-time telemetry feed */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Live Latitude</span>
            <span className="text-sm font-bold text-slate-100">{userLat ? userLat.toFixed(6) : 'Standby'}</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Live Longitude</span>
            <span className="text-sm font-bold text-slate-100">{userLng ? userLng.toFixed(6) : 'Standby'}</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">GPS Precision</span>
            <span className="text-sm font-bold text-emerald-400">±{userAccuracy ?? 0}m</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Socket Uplink</span>
            <span className="text-sm font-bold text-purple-400">127.0.0.1:5000</span>
          </div>
        </div>
      </div>

      {/* Active Missions Queue */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Assigned Emergency Rescue Missions ({assignedRequests.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Real-time Task Queue</span>
        </div>

        {assignedRequests.length > 0 ? (
          <div className="space-y-3">
            {assignedRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">
                      {req.priority}
                    </span>
                    <span className="font-mono text-xs text-slate-400">ID: {req.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{req.emergencyType}</h4>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">{req.description}</p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 pt-1">
                    <span>Trapped People: <strong className="text-white">{req.numberOfPeople}</strong></span>
                    <span>Medical: <strong className={req.medicalEmergency ? 'text-red-400' : 'text-slate-400'}>{req.medicalEmergency ? 'URGENT' : 'No'}</strong></span>
                    <span>Location: <strong className="font-mono text-slate-300">{req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <select
                    value={req.status}
                    onChange={(e) => handleUpdateMissionStatus(req.id, e.target.value)}
                    disabled={updating}
                    className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">En Route / On Scene</option>
                    <option value="COMPLETED">Mission Resolved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
            <p>No active rescue requests pending assignment in your sector.</p>
            <p className="text-slate-500 text-[11px] mt-1">Standby for automated GPS-based dispatch allocation.</p>
          </div>
        )}
      </div>

      {/* Tactical Map View */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Tactical Responder Grid
        </h3>
        <div className="h-[480px] w-full">
          <DisasterMap
            userLocation={{ latitude: userLat, longitude: userLng, accuracy: userAccuracy }}
            incidents={incidents}
            rescueRequests={rescueRequests}
            shelters={shelters}
            hospitals={hospitals}
            rescueTeams={rescueTeams}
          />
        </div>
      </div>
    </div>
  );
};
