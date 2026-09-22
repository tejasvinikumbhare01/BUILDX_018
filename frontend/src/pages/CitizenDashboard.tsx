import React, { useState } from 'react';
import { LiveLocationCard } from '../components/location/LiveLocationCard';
import { DisasterMap } from '../components/map/DisasterMap';
import { LiveWeatherWidget } from '../components/weather/LiveWeatherWidget';
import { ActiveAlertsBanner } from '../components/alerts/ActiveAlertsBanner';
import { Incident, RescueRequest, Shelter, Hospital, RescueTeam, Alert, CCTVCamera } from '../types';
import { AlertTriangle, LifeBuoy, Navigation, Activity, Video } from 'lucide-react';

interface CitizenDashboardProps {
  userLat: number | null;
  userLng: number | null;
  userAccuracy: number | null;
  userTimestamp: number | null;
  userAddress?: string | null;
  isResolvingAddress?: boolean;
  locationError: string | null;
  isTracking: boolean;
  onUseCurrentLocation: () => void;
  onStopTracking: () => void;
  incidents: Incident[];
  rescueRequests: RescueRequest[];
  shelters: Shelter[];
  hospitals: Hospital[];
  rescueTeams: RescueTeam[];
  alerts: Alert[];
  cctvCameras?: CCTVCamera[];
  routeGeometry: any | null;
  onOpenReportModal: () => void;
  onOpenRescueModal: () => void;
  onOpenNearbyModal: () => void;
  onOpenAIModal: () => void;
  onOpenDamageModal: () => void;
  onOpenRoutingModal: () => void;
  onOpenFloodModal?: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  userLat,
  userLng,
  userAccuracy,
  userTimestamp,
  userAddress,
  isResolvingAddress,
  locationError,
  isTracking,
  onUseCurrentLocation,
  onStopTracking,
  incidents,
  rescueRequests,
  shelters,
  hospitals,
  rescueTeams,
  alerts,
  cctvCameras = [],
  routeGeometry,
  onOpenReportModal,
  onOpenRescueModal,
  onOpenNearbyModal,
  onOpenFloodModal,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  const handleCenterOnUser = () => {
    if (userLat !== null && userLng !== null) {
      setMapCenter([userLat, userLng]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Compact Active Alerts Ticker (Single-Line) */}
      {alerts.length > 0 && <ActiveAlertsBanner alerts={alerts} />}

      {/* 2. Nagpur Quick Scenario Focus Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Nagpur Crisis Focus:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setMapCenter([21.1215, 79.1102])}
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition font-bold"
          >
            <span>🌊 Sakkardara &amp; Pratap Nagar (Flood)</span>
          </button>
          <button
            onClick={() => setMapCenter([21.1078, 79.0812])}
            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition font-bold"
          >
            <span>🚗 Narendra Nagar (Underpass Rescue)</span>
          </button>
          <button
            onClick={() => setMapCenter([21.1539, 79.1172])}
            className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 transition font-bold"
          >
            <span>🚒 Itwari Market (Fire &amp; Hydrants)</span>
          </button>
          <button
            onClick={() => setMapCenter([21.1444, 79.0568])}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition font-bold"
          >
            <span>🏢 Dharampeth (565 Free Beds)</span>
          </button>
        </div>
      </div>

      {/* 3. Centerpiece: Disaster Map (Front & Center) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Nagpur Live Disaster &amp; Flood Surveillance Map
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <span>
              Verified Incidents: <strong className="text-slate-900">{incidents.length}</strong>
            </span>
            <span>•</span>
            <span>
              CCTV Cams: <strong className="text-cyan-700">{cctvCameras.length}</strong>
            </span>
          </div>
        </div>

        <div className="w-full">
          <DisasterMap
            userLocation={{ latitude: userLat, longitude: userLng, accuracy: userAccuracy, address: userAddress }}
            incidents={incidents}
            rescueRequests={rescueRequests}
            shelters={shelters}
            hospitals={hospitals}
            rescueTeams={rescueTeams}
            alerts={alerts}
            cctvCameras={cctvCameras}
            onSelectCCTV={onOpenFloodModal}
            routeGeometry={routeGeometry}
            centerCoordinates={mapCenter}
          />
        </div>
      </div>

      {/* 4. Simple 3-Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onOpenRescueModal}
          className="p-4 rounded-2xl bg-white border-2 border-red-500 hover:bg-red-50/70 text-left transition group active:scale-95 shadow-sm flex items-center space-x-3.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-black text-red-700 uppercase block">SOS Emergency Rescue</span>
            <span className="text-xs text-slate-500 font-medium">Underpass / Flood stranded help</span>
          </div>
        </button>

        <button
          onClick={onOpenReportModal}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-left transition group active:scale-95 shadow-sm flex items-center space-x-3.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 uppercase block">Report Hazard</span>
            <span className="text-xs text-slate-500 font-medium">Waterlogging, fire, blocked road</span>
          </div>
        </button>

        <button
          onClick={onOpenNearbyModal}
          className="p-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-left transition group active:scale-95 shadow-sm flex items-center space-x-3.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 uppercase block">Find Safe Shelters</span>
            <span className="text-xs text-slate-500 font-medium">Load-balanced evacuation halls</span>
          </div>
        </button>
      </div>

      {/* 5. Live Location Telemetry & Weather Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LiveLocationCard
            latitude={userLat}
            longitude={userLng}
            accuracy={userAccuracy}
            timestamp={userTimestamp}
            address={userAddress}
            isResolvingAddress={isResolvingAddress}
            error={locationError}
            isTracking={isTracking}
            onUseCurrentLocation={onUseCurrentLocation}
            onStopTracking={onStopTracking}
            onCenterMap={handleCenterOnUser}
          />
        </div>
        <div className="lg:col-span-1">
          <LiveWeatherWidget latitude={userLat ?? 21.1458} longitude={userLng ?? 79.0882} />
        </div>
      </div>

      {/* 6. Verified Incidents Feed */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Nagpur Verified Emergency Incident Ticker
          </h4>
          <span className="text-[11px] text-emerald-700 font-bold">Live Operational Sync</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {incidents.slice(0, 4).map((inc) => (
            <div
              key={inc.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between space-x-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-red-100 text-red-700 border border-red-300">
                    {inc.type}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{inc.severity}</span>
                </div>
                <p className="text-xs text-slate-700 mt-1.5 leading-snug">{inc.description}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  📍 {inc.address || `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}`}
                </p>
              </div>
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
