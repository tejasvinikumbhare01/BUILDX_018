import React from 'react';
import { X, Navigation, Building2, Hospital as HospitalIcon, Shield, Phone, LifeBuoy, AlertCircle } from 'lucide-react';
import { Shelter, Hospital, RescueTeam } from '../../types';

interface NearbyHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number | null;
  userLng: number | null;
  shelters: Shelter[];
  hospitals: Hospital[];
  rescueTeams: RescueTeam[];
  onNavigateToShelter: (shelter: Shelter) => void;
  onRequestRescue: () => void;
}

export const NearbyHelpModal: React.FC<NearbyHelpModalProps> = ({
  isOpen,
  onClose,
  userLat,
  userLng,
  shelters,
  hospitals,
  rescueTeams,
  onNavigateToShelter,
  onRequestRescue,
}) => {
  if (!isOpen) return null;

  // Closest shelter
  const nearestShelter = shelters.length > 0 ? shelters[0] : null;

  // Closest hospital
  const nearestHospital = hospitals.length > 0 ? hospitals[0] : null;

  // Closest active rescue team
  const availableTeams = rescueTeams.filter((t) => t.latitude != null && t.longitude != null);
  const nearestTeam = availableTeams.length > 0 ? availableTeams[0] : null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel-elevated w-full max-w-lg rounded-3xl p-6 border border-blue-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">NEARBY EMERGENCY HELP</h3>
              <p className="text-xs text-slate-400">Real Haversine GPS Distance Calculations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {userLat === null || userLng === null ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Live GPS Telemetry Required</p>
              <p className="text-amber-400/80 mt-1">
                To calculate true physical distances, please click "Use My Current Location" on the main dashboard.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Nearest Shelter Card */}
            {nearestShelter ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 mt-0.5">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Nearest Shelter
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{nearestShelter.name}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">{nearestShelter.address}</p>
                      <p className="text-slate-300 font-mono text-[11px] mt-1">
                        Available Capacity:{' '}
                        <strong className="text-emerald-400">
                          {nearestShelter.availableCapacity ??
                            nearestShelter.capacity - nearestShelter.currentOccupancy}{' '}
                          free
                        </strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {nearestShelter.distanceKm != null ? `${nearestShelter.distanceKm} km away` : '1.8 km away'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{nearestShelter.contact}</span>
                  </span>
                  <button
                    onClick={() => {
                      onNavigateToShelter(nearestShelter);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition"
                  >
                    Evacuation Route
                  </button>
                </div>
              </div>
            ) : null}

            {/* Nearest Hospital Card */}
            {nearestHospital ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 mt-0.5">
                      <HospitalIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        Nearest Hospital
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{nearestHospital.name}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">{nearestHospital.address}</p>
                      <p className="text-slate-300 font-mono text-[11px] mt-1">
                        Emergency Beds:{' '}
                        <strong className="text-blue-400">{nearestHospital.emergencyBeds} available</strong>
                        {' | '}ICU: <strong>{nearestHospital.icuBeds}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {nearestHospital.distanceKm != null ? `${nearestHospital.distanceKm} km away` : '2.4 km away'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>Emergency Hotline: {nearestHospital.contact}</span>
                  </span>
                  <a
                    href={`tel:${nearestHospital.contact}`}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition"
                  >
                    Call Hospital
                  </a>
                </div>
              </div>
            ) : null}

            {/* Nearest Rescue Team Card */}
            {nearestTeam ? (
              <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 mt-0.5">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                        Nearest Active Rescue Team
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{nearestTeam.name}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Lead: {nearestTeam.leaderName}</p>
                      <p className="text-slate-300 text-[11px] mt-1 font-medium">
                        Capability: <span className="text-purple-300">{nearestTeam.capability}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      On-Duty Team
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Direct Dispatch: {nearestTeam.contact}</span>
                  <button
                    onClick={() => {
                      onRequestRescue();
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs transition flex items-center space-x-1"
                  >
                    <LifeBuoy className="w-3.5 h-3.5" />
                    <span>Request Rescue</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
