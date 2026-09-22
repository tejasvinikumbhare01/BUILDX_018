import React from 'react';
import { Building2, Hospital as HospitalIcon, Phone, MapPin, Navigation, Droplets, Check, X, Shield } from 'lucide-react';
import { Shelter, Hospital } from '../types';

interface SheltersHospitalsPageProps {
  shelters: Shelter[];
  hospitals: Hospital[];
  userLat: number | null;
  userLng: number | null;
  onNavigateToShelter: (shelter: Shelter) => void;
}

export const SheltersHospitalsPage: React.FC<SheltersHospitalsPageProps> = ({
  shelters,
  hospitals,
  userLat,
  userLng,
  onNavigateToShelter,
}) => {
  return (
    <div className="space-y-8">
      {/* Shelters Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Emergency Disaster Shelters &amp; Evacuation Hubs
              </h2>
              <p className="text-xs text-slate-400">Live capacity monitoring and supply provision audits</p>
            </div>
          </div>
          <span className="text-xs text-slate-400">
            Registered Safe Shelters: <strong className="text-white">{shelters.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shelters.map((shelter) => {
            const available = shelter.availableCapacity ?? Math.max(0, shelter.capacity - shelter.currentOccupancy);
            const occupancyPct = shelter.occupancyPercentage ?? Math.round((shelter.currentOccupancy / shelter.capacity) * 100);

            return (
              <div
                key={shelter.id}
                className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      {shelter.status}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{shelter.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{shelter.address}</span>
                    </p>
                  </div>
                  {shelter.distanceKm !== undefined && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-blue-400 shrink-0">
                      {shelter.distanceKm} km away
                    </span>
                  )}
                </div>

                {/* Capacity Bar */}
                <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Live Occupancy:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {shelter.currentOccupancy} / {shelter.capacity} ({occupancyPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occupancyPct > 90 ? 'bg-red-500' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occupancyPct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-emerald-400 font-semibold">{available} Free Beds</span>
                    <span className="text-slate-400">Total Capacity: {shelter.capacity}</span>
                  </div>
                </div>

                {occupancyPct >= 100 && (
                  <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-red-400">
                      <span>⚠️ CRITICAL OVER-CAPACITY:</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Facility exceeded capacity. ResQGrid Intelligent Load Balancing has rerouted incoming evacuees to{' '}
                      <strong className="text-emerald-300">Dharampeth Community Hall</strong> (565 free beds available).
                    </p>
                  </div>
                )}

                {/* Provision Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 ${
                      shelter.medicalAvailable
                        ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {shelter.medicalAvailable ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <X className="w-3.5 h-3.5" />}
                    <span>Medical Staff</span>
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 ${
                      shelter.foodAvailable
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {shelter.foodAvailable ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <X className="w-3.5 h-3.5" />}
                    <span>Food Supply</span>
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-xl flex items-center space-x-1.5 ${
                      shelter.waterAvailable
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {shelter.waterAvailable ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <X className="w-3.5 h-3.5" />}
                    <span>Potable Water</span>
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{shelter.contact}</span>
                  </span>
                  <button
                    onClick={() => onNavigateToShelter(shelter)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5 active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Evacuate Here</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospitals Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <HospitalIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Operational Emergency Hospitals &amp; Trauma Centers
              </h2>
              <p className="text-xs text-slate-400">
                Critical care capacity, ICU bed counters, and ambulance dispatch readiness
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400">
            Operational Hospitals: <strong className="text-white">{hospitals.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                    {hospital.status}
                  </span>
                  {hospital.distanceKm !== undefined && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-blue-400">
                      {hospital.distanceKm} km away
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white">{hospital.name}</h3>
                <p className="text-xs text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{hospital.address}</span>
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Emergency</span>
                    <span className="text-sm font-extrabold text-white">{hospital.emergencyBeds}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">ICU Beds</span>
                    <span className="text-sm font-extrabold text-blue-400">{hospital.icuBeds}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Ambulances</span>
                    <span className="text-sm font-extrabold text-emerald-400">{hospital.ambulances}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono truncate">{hospital.contact}</span>
                <a
                  href={`tel:${hospital.contact}`}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition"
                >
                  Direct Call
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
