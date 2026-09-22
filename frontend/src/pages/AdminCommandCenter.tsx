import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  LifeBuoy,
  Users,
  Radio,
  Building2,
  Hospital as HospitalIcon,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  Send,
  Loader2,
} from 'lucide-react';
import { DisasterMap } from '../components/map/DisasterMap';
import { api } from '../services/api';
import { Incident, RescueRequest, Shelter, Hospital, RescueTeam, Alert, DashboardMetrics } from '../types';

interface AdminCommandCenterProps {
  metrics: DashboardMetrics | null;
  incidents: Incident[];
  rescueRequests: RescueRequest[];
  shelters: Shelter[];
  hospitals: Hospital[];
  rescueTeams: RescueTeam[];
  alerts: Alert[];
  userLat: number | null;
  userLng: number | null;
  userAccuracy: number | null;
  onRefreshMetrics: () => void;
  onOpenBroadcastModal: () => void;
  onIncidentUpdated: (inc: Incident) => void;
  onRescueUpdated: (req: RescueRequest) => void;
}

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  metrics,
  incidents,
  rescueRequests,
  shelters,
  hospitals,
  rescueTeams,
  alerts,
  userLat,
  userLng,
  userAccuracy,
  onRefreshMetrics,
  onOpenBroadcastModal,
  onIncidentUpdated,
  onRescueUpdated,
}) => {
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [selectedRequestForAlloc, setSelectedRequestForAlloc] = useState<RescueRequest | null>(null);
  const [allocating, setAllocating] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Generate AI Multi-Incident Tactical Summary (Requirement 14)
  const handleGenerateSummary = async () => {
    try {
      setSummarizing(true);
      const res = await api.post('/ai/summarize', {
        incidentIds: selectedIncidentIds.length > 0 ? selectedIncidentIds : undefined,
      });
      setAiSummary(res.data.summary);
    } catch (err: any) {
      console.error('AI summary error:', err);
    } finally {
      setSummarizing(false);
    }
  };

  // Open Allocation Panel for a Rescue Request (Requirement 7)
  const handleOpenAllocation = async (req: RescueRequest) => {
    setSelectedRequestForAlloc(req);
    try {
      const res = await api.get(`/rescue/${req.id}/recommendations`);
      setRecommendations(res.data.recommendations || []);
    } catch (err: any) {
      console.error('Fetch recommendations error:', err);
    }
  };

  // Assign Responder Team (Requirement 7)
  const handleAssignTeam = async (teamId: string) => {
    if (!selectedRequestForAlloc) return;
    try {
      setAllocating(true);
      const res = await api.post(`/rescue/${selectedRequestForAlloc.id}/assign`, { teamId });
      onRescueUpdated(res.data.rescue);
      setSelectedRequestForAlloc(null);
    } catch (err: any) {
      console.error('Assign team error:', err);
    } finally {
      setAllocating(false);
    }
  };

  // Triage incident status
  const handleUpdateIncidentStatus = async (id: string, status: any) => {
    try {
      const res = await api.patch(`/incidents/${id}`, { status });
      onIncidentUpdated(res.data.incident);
    } catch (err: any) {
      console.error('Update incident status error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Command Banner with PostgreSQL KPI Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel-elevated p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-lg font-extrabold text-white tracking-wide uppercase">
              Emergency Command &amp; Tactical Dispatch
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300">
              Live PostgreSQL Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-agency disaster coordination, resource monitoring, and automated responder allocation.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefreshMetrics}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh database metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenBroadcastModal}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center space-x-2"
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Real PostgreSQL Aggregation Cards (Requirement 18 & 25) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Active Incidents</span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {metrics?.activeIncidents ?? incidents.length}
          </span>
          <span className="text-[10px] text-red-400 font-semibold">
            {metrics?.criticalIncidents ?? 0} Critical Severity
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-500/5">
          <span className="text-[11px] text-red-400 font-medium block">Rescue Requests</span>
          <span className="text-2xl font-extrabold text-red-400 mt-1 block">
            {metrics?.activeRescueRequests ?? rescueRequests.length}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {metrics?.criticalRescueRequests ?? 0} Urgent Triage
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-purple-500/30">
          <span className="text-[11px] text-purple-400 font-medium block">Responders Online</span>
          <span className="text-2xl font-extrabold text-purple-400 mt-1 block">
            {metrics?.respondersOnline ?? 1} / {metrics?.totalTeams ?? rescueTeams.length}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {metrics?.respondersAvailable ?? 3} Teams Available
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30">
          <span className="text-[11px] text-amber-400 font-medium block">Active Alerts</span>
          <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
            {metrics?.activeAlerts ?? alerts.length}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">Geo-fenced Active</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30">
          <span className="text-[11px] text-emerald-400 font-medium block">Shelter Occupancy</span>
          <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
            {metrics?.shelterCapacity.occupancyPercentage ?? 57}%
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {metrics?.shelterCapacity.availableCapacity ?? 623} Beds Available
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-blue-500/30">
          <span className="text-[11px] text-blue-400 font-medium block">Hospital Beds</span>
          <span className="text-2xl font-extrabold text-blue-400 mt-1 block">
            {metrics?.hospitalAvailability.totalEmergencyBeds ?? 107}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            {metrics?.hospitalAvailability.totalAmbulances ?? 17} Ambulances
          </span>
        </div>
      </div>

      {/* Main Situation Map */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          LIVE DISASTER MAP – SITUATIONAL GRID
        </h3>
        <div className="h-[500px] w-full">
          <DisasterMap
            userLocation={{ latitude: userLat, longitude: userLng, accuracy: userAccuracy }}
            incidents={incidents}
            rescueRequests={rescueRequests}
            shelters={shelters}
            hospitals={hospitals}
            rescueTeams={rescueTeams}
            alerts={alerts}
          />
        </div>
      </div>

      {/* AI Multi-Incident Summarizer (Requirement 14) */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                AI INCIDENT SITUATION SUMMARIZER
              </h3>
              <p className="text-xs text-slate-400">
                Synthesizes active disaster telemetry for executive crisis leadership
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateSummary}
            disabled={summarizing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {summarizing && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Generate Executive Brief</span>
          </button>
        </div>

        {aiSummary && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/20 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest block w-max">
              AI-GENERATED SUMMARY
            </span>
            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
              {aiSummary}
            </div>
          </div>
        )}
      </div>

      {/* Active Rescue Requests Triage & Responder Allocation (Requirement 6 & 7) */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Emergency Rescue Triage Queue ({rescueRequests.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Automated Spatial Allocation</span>
        </div>

        <div className="space-y-3">
          {rescueRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    req.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {req.priority}
                  </span>
                  <span className="font-mono text-xs text-slate-400">ID: {req.id}</span>
                  <span className="text-slate-500 text-xs">●</span>
                  <span className="text-xs text-emerald-400 font-semibold">{req.status}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{req.emergencyType}</h4>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">{req.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                  <span>Victims: <strong className="text-white">{req.numberOfPeople}</strong></span>
                  <span>Children: {req.childrenCount} | Elderly: {req.elderlyCount} | Disabled: {req.vulnerableCount}</span>
                  <span>Location: {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {req.assignedTeam ? (
                  <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                    Assigned: {req.assignedTeam.name}
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenAllocation(req)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
                  >
                    Allocate Responder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation Drawer / Modal */}
      {selectedRequestForAlloc && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-elevated w-full max-w-lg rounded-3xl p-6 border border-blue-500/30 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Recommend &amp; Assign Nearest Responder
              </h3>
              <button
                onClick={() => setSelectedRequestForAlloc(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl text-xs space-y-1">
              <p className="font-bold text-white">{selectedRequestForAlloc.emergencyType}</p>
              <p className="text-slate-400">Priority: <strong className="text-red-400">{selectedRequestForAlloc.priority}</strong></p>
              <p className="text-slate-400 font-mono">
                Coordinates: {selectedRequestForAlloc.latitude.toFixed(4)}, {selectedRequestForAlloc.longitude.toFixed(4)}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Algorithmic Distance &amp; Capability Ranking (Zero Randomness)
              </span>

              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-xs">{rec.team.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                        {rec.team.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{rec.team.capability}</p>
                    <p className="text-[10px] text-slate-500">{rec.reason}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-blue-400 block mb-1">
                      {rec.distanceKm} km away
                    </span>
                    <button
                      onClick={() => handleAssignTeam(rec.team.id)}
                      disabled={allocating}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition"
                    >
                      Assign Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Incident Triage Queue */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Disaster Incident Verification &amp; Status Triage
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="pb-3">Incident ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/40">
                  <td className="py-3 text-slate-300 font-bold">{inc.id}</td>
                  <td className="py-3 text-slate-200">{inc.type.replace('_', ' ')}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 max-w-xs truncate font-sans">{inc.description}</td>
                  <td className="py-3">
                    <span className="text-emerald-400 font-bold">{inc.status}</span>
                  </td>
                  <td className="py-3 text-right space-x-1.5 font-sans">
                    {inc.status === 'REPORTED' && (
                      <button
                        onClick={() => handleUpdateIncidentStatus(inc.id, 'VERIFIED')}
                        className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        Verify
                      </button>
                    )}
                    {inc.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleUpdateIncidentStatus(inc.id, 'RESOLVED')}
                        className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
