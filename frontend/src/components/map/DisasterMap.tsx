import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident, RescueRequest, Shelter, Hospital, RescueTeam, Alert } from '../../types';

// Fix default leaflet icons in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DisasterMapProps {
  userLocation: { latitude: number | null; longitude: number | null; accuracy: number | null; address?: string | null };
  incidents: Incident[];
  rescueRequests?: RescueRequest[];
  shelters: Shelter[];
  hospitals: Hospital[];
  rescueTeams?: RescueTeam[];
  alerts?: Alert[];
  cctvCameras?: any[];
  onSelectCCTV?: (camera: any) => void;
  routeGeometry?: { type: string; coordinates: [number, number][] } | null;
  onSelectIncident?: (incident: Incident) => void;
  onSelectShelter?: (shelter: Shelter) => void;
  centerCoordinates?: [number, number] | null;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  userLocation,
  incidents,
  rescueRequests = [],
  shelters,
  hospitals,
  rescueTeams = [],
  alerts = [],
  cctvCameras = [],
  onSelectCCTV,
  routeGeometry,
  onSelectIncident,
  onSelectShelter,
  centerCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userAccuracyCircleRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center to Nagpur, Maharashtra (or user location if available)
    const initialLat = userLocation.latitude ?? 21.1458;
    const initialLng = userLocation.longitude ?? 79.0882;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false,
    });

    // Standard high-reliability OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapRef.current = map;

    // Invalidate size after container layout calculation
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const hasInitiallyCenteredRef = useRef(false);

  // Handle programmatic centering
  useEffect(() => {
    if (centerCoordinates && mapRef.current) {
      mapRef.current.flyTo(centerCoordinates, 15, { duration: 1.2 });
    }
  }, [centerCoordinates]);

  // Automatically fly to user location as soon as live location is acquired
  useEffect(() => {
    if (mapRef.current && userLocation.latitude !== null && userLocation.longitude !== null && !hasInitiallyCenteredRef.current) {
      hasInitiallyCenteredRef.current = true;
      mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, { duration: 1.2 });
    }
  }, [userLocation.latitude, userLocation.longitude]);

  // Update User Live Location Marker
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (userLocation.latitude !== null && userLocation.longitude !== null) {
      const pos: [number, number] = [userLocation.latitude, userLocation.longitude];

      // Custom pulsing blue user beacon
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-8 h-8 rounded-full bg-emerald-500/40 radar-ring"></div>
            <div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg shadow-emerald-500/80"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupHtml = `
        <div class="p-2.5 text-xs min-w-[210px]">
          <div class="flex items-center space-x-1.5 text-emerald-400 font-extrabold uppercase tracking-wide text-[11px]">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
            <span>📍 Your Live Location</span>
          </div>
          ${userLocation.address ? `
            <div class="text-white font-bold mt-1.5 text-xs leading-snug border-t border-slate-700/60 pt-1.5">
              ${userLocation.address}
            </div>
          ` : ''}
          <div class="font-mono text-slate-300 mt-1.5 text-[11px] bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
            ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}
          </div>
          <div class="text-slate-400 text-[10px] mt-1 flex justify-between">
            <span>Accuracy: ±${userLocation.accuracy ?? 0}m</span>
            <span class="text-emerald-400 font-medium">GPS Live</span>
          </div>
        </div>
      `;

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(pos, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        userMarkerRef.current.bindPopup(popupHtml);
      } else {
        userMarkerRef.current.setLatLng(pos);
        userMarkerRef.current.setPopupContent(popupHtml);
      }

      // Accuracy circle
      if (userLocation.accuracy) {
        if (!userAccuracyCircleRef.current) {
          userAccuracyCircleRef.current = L.circle(pos, {
            radius: userLocation.accuracy,
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.12,
            weight: 1,
          }).addTo(map);
        } else {
          userAccuracyCircleRef.current.setLatLng(pos);
          userAccuracyCircleRef.current.setRadius(userLocation.accuracy);
        }
      }
    }
  }, [userLocation]);


  // Render Incidents, Shelters, Hospitals, Responders, and Alerts
  useEffect(() => {
    if (!markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    // 1. Render Incidents
    incidents.forEach((inc) => {
      let colorClass = 'bg-amber-500';
      let borderColor = '#f59e0b';
      if (inc.severity === 'CRITICAL') {
        colorClass = 'bg-red-500';
        borderColor = '#ef4444';
      } else if (inc.severity === 'HIGH') {
        colorClass = 'bg-orange-500';
        borderColor = '#f97316';
      } else if (inc.severity === 'LOW') {
        colorClass = 'bg-blue-500';
        borderColor = '#3b82f6';
      }

      // SVG Icon based on type
      let iconSymbol = '⚠️';
      if (inc.type === 'FLOOD') iconSymbol = '🌊';
      else if (inc.type === 'FIRE') iconSymbol = '🔥';
      else if (inc.type === 'ROAD_BLOCKAGE') iconSymbol = '🚧';
      else if (inc.type === 'BUILDING_DAMAGE') iconSymbol = '🏚️';
      else if (inc.type === 'LANDSLIDE') iconSymbol = '⛰️';
      else if (inc.type === 'MEDICAL_EMERGENCY') iconSymbol = '🚑';

      const icon = L.divIcon({
        className: 'custom-incident-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 group cursor-pointer">
            ${inc.severity === 'CRITICAL' ? `<div class="absolute w-8 h-8 rounded-full bg-red-500/40 radar-ring"></div>` : ''}
            <div class="w-7 h-7 rounded-lg ${colorClass} text-white flex items-center justify-center shadow-lg border border-white/40 text-xs">
              ${iconSymbol}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon }).addTo(layer);

      const popupContent = `
        <div class="p-3 text-xs min-w-[220px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-700 pb-2 mb-2">
            <span class="font-bold text-white uppercase">${inc.type.replace('_', ' ')}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
            }">${inc.severity}</span>
          </div>
          <p class="text-slate-300 mb-2 leading-relaxed">${inc.description}</p>
          <div class="space-y-1 text-slate-400 font-mono text-[11px]">
            <p><strong class="text-slate-300">People affected:</strong> ${inc.peopleAffected}</p>
            <p><strong class="text-slate-300">Location:</strong> ${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}</p>
            <p><strong class="text-slate-300">Reported:</strong> ${new Date(inc.reportedAt).toLocaleTimeString()}</p>
            <p><strong class="text-slate-300">Status:</strong> <span class="text-emerald-400 font-semibold">${inc.status}</span></p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc);
      });
    });

    // 2. Render Rescue Requests
    rescueRequests.forEach((req) => {
      const isCritical = req.priority === 'CRITICAL';
      const icon = L.divIcon({
        className: 'custom-rescue-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
            <div class="absolute w-8 h-8 rounded-full bg-red-600/50 ${isCritical ? 'radar-ring' : 'animate-ping-slow'}"></div>
            <div class="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center border-2 border-white shadow-xl text-xs">
              SOS
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([req.latitude, req.longitude], { icon }).addTo(layer);
      marker.bindPopup(`
        <div class="p-3 text-xs min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span class="font-bold text-red-400 uppercase">RESCUE REQUEST</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">${req.priority}</span>
          </div>
          <p class="text-white font-semibold mb-1">${req.emergencyType}</p>
          <p class="text-slate-300 mb-2">${req.description}</p>
          <div class="text-[11px] text-slate-400 space-y-1">
            <p><strong>People Trapped:</strong> ${req.numberOfPeople}</p>
            <p><strong>Medical Urgency:</strong> ${req.medicalEmergency ? 'YES' : 'NO'}</p>
            <p><strong>Status:</strong> ${req.status}</p>
          </div>
        </div>
      `);
    });

    // 3. Render Shelters
    shelters.forEach((shelter) => {
      const icon = L.divIcon({
        className: 'custom-shelter-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer group">
            <div class="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg border border-emerald-300/40 text-xs">
              🏠
            </div>
            <span class="absolute -bottom-2 bg-slate-900 text-emerald-400 font-mono text-[9px] font-bold px-1 rounded border border-emerald-500/30">
              ${Math.max(0, shelter.capacity - shelter.currentOccupancy)}
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([shelter.latitude, shelter.longitude], { icon }).addTo(layer);
      marker.bindPopup(`
        <div class="p-3 text-xs min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span class="font-bold text-emerald-400">EMERGENCY SHELTER</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">ACTIVE</span>
          </div>
          <h4 class="font-bold text-white text-sm mb-1">${shelter.name}</h4>
          <p class="text-slate-400 mb-2">${shelter.address}</p>
          <div class="space-y-1 text-slate-300 font-mono text-[11px]">
            <p><strong>Available Capacity:</strong> ${shelter.availableCapacity ?? (shelter.capacity - shelter.currentOccupancy)} / ${shelter.capacity}</p>
            <p><strong>Medical:</strong> ${shelter.medicalAvailable ? '✅ Ready' : '❌'}</p>
            <p><strong>Food & Water:</strong> ${shelter.foodAvailable ? '✅' : '❌'} / ${shelter.waterAvailable ? '✅' : '❌'}</p>
            <p><strong>Contact:</strong> ${shelter.contact}</p>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectShelter) onSelectShelter(shelter);
      });
    });

    // 4. Render Hospitals
    hospitals.forEach((hosp) => {
      const icon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
            <div class="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-lg border border-blue-300/40 text-xs">
              🏥
            </div>
            <span class="absolute -bottom-2 bg-slate-900 text-blue-400 font-mono text-[9px] font-bold px-1 rounded border border-blue-500/30">
              ${hosp.emergencyBeds}b
            </span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([hosp.latitude, hosp.longitude], { icon }).addTo(layer);
      marker.bindPopup(`
        <div class="p-3 text-xs min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <span class="font-bold text-blue-400">EMERGENCY HOSPITAL</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">${hosp.status}</span>
          </div>
          <h4 class="font-bold text-white text-sm mb-1">${hosp.name}</h4>
          <p class="text-slate-400 mb-2">${hosp.address}</p>
          <div class="space-y-1 text-slate-300 font-mono text-[11px]">
            <p><strong>Emergency Beds:</strong> ${hosp.emergencyBeds}</p>
            <p><strong>ICU Capacity:</strong> ${hosp.icuBeds}</p>
            <p><strong>Active Ambulances:</strong> ${hosp.ambulances}</p>
            <p><strong>Contact:</strong> ${hosp.contact}</p>
          </div>
        </div>
      `);
    });

    // 5. Render Active Responders / Teams
    rescueTeams.forEach((team) => {
      if (team.latitude != null && team.longitude != null) {
        const isOnDuty = team.status === 'ON_DUTY' || team.status === 'DISPATCHED';
        const icon = L.divIcon({
          className: 'custom-team-marker',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
              ${isOnDuty ? '<div class="absolute w-8 h-8 rounded-full bg-purple-500/40 beacon-pulse"></div>' : ''}
              <div class="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg border border-purple-300/40 text-xs">
                🛡️
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([team.latitude, team.longitude], { icon }).addTo(layer);
        marker.bindPopup(`
          <div class="p-3 text-xs min-w-[200px]">
            <p class="font-bold text-purple-400 uppercase">${team.name}</p>
            <p class="text-white font-semibold mt-1">Lead: ${team.leaderName}</p>
            <p class="text-slate-400">Spec: ${team.capability}</p>
            <p class="text-slate-300 mt-1">Status: <span class="font-bold text-purple-300">${team.status}</span></p>
            <p class="text-slate-400">Contact: ${team.contact}</p>
          </div>
        `);
      }
    });

    // 6. Render Geo-fence Hazard Alerts
    alerts.forEach((alert) => {
      if (alert.active) {
        const circle = L.circle([alert.latitude, alert.longitude], {
          radius: alert.radiusKm * 1000,
          color: alert.severity === 'CRITICAL' ? '#ef4444' : '#f97316',
          fillColor: alert.severity === 'CRITICAL' ? '#ef4444' : '#f97316',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '4, 8',
        }).addTo(layer);

        circle.bindPopup(`
          <div class="p-3 text-xs">
            <p class="font-bold text-red-400 uppercase">${alert.title}</p>
            <p class="text-slate-300 mt-1">${alert.message}</p>
            <p class="text-slate-400 text-[11px] mt-1">Hazard Radius: ${alert.radiusKm} km</p>
          </div>
        `);
      }
    });

    // 7. Render Flood Monitoring CCTV Cameras
    cctvCameras.forEach((cam) => {

      const isCritical = cam.status === 'CRITICAL' || cam.status === 'DANGER';
      const icon = L.divIcon({
        className: 'custom-cctv-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer group">
            <div class="absolute w-8 h-8 rounded-full ${isCritical ? 'bg-cyan-400/40 animate-ping' : 'bg-cyan-500/20'}"></div>
            <div class="w-7 h-7 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-lg border border-cyan-200/50 text-xs">
              📹
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([cam.latitude, cam.longitude], { icon }).addTo(layer);
      marker.bindPopup(`
        <div class="p-3 text-xs min-w-[220px]">
          <div class="flex items-center justify-between border-b border-cyan-900/60 pb-2 mb-2">
            <span class="font-bold text-cyan-400 flex items-center gap-1">
              <span>📹</span>
              <span>FLOOD CCTV CAM</span>
            </span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
              isCritical ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }">${cam.status}</span>
          </div>
          <h4 class="font-bold text-white text-sm mb-1">${cam.name}</h4>
          <p class="text-slate-300 text-[11px] mb-2">${cam.location}</p>
          <div class="space-y-1 text-slate-300 font-mono text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800">
            <div class="flex justify-between">
              <span class="text-slate-400">Water Gauge:</span>
              <span class="text-cyan-300 font-bold">${cam.waterLevelMeters}m / Danger ${cam.dangerLevelMeters}m</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Flow Velocity:</span>
              <span class="text-slate-200">${cam.flowVelocity}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Flood Inundation Risk:</span>
              <span class="${isCritical ? 'text-red-400 font-bold' : 'text-amber-400'}">${cam.riskScore}%</span>
            </div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectCCTV) onSelectCCTV(cam);
      });
    });
  }, [incidents, rescueRequests, shelters, hospitals, rescueTeams, alerts, cctvCameras, onSelectIncident, onSelectShelter, onSelectCCTV]);

  // Render Evacuation Route Polyline
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (routeGeometry && routeGeometry.coordinates && routeGeometry.coordinates.length > 0) {
      // OSRM provides [lng, lat], Leaflet needs [lat, lng]
      const latLngs: [number, number][] = routeGeometry.coordinates.map((c) => [c[1], c[0]]);

      const polyline = L.polyline(latLngs, {
        color: '#10b981',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
      }).addTo(map);

      routeLayerRef.current = polyline;

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [routeGeometry]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-300 shadow-md bg-slate-100" style={{ height: '560px', minHeight: '560px' }}>
      <div ref={mapContainerRef} style={{ height: '100%', minHeight: '560px', width: '100%', zIndex: 1 }} />

      {/* Floating Quick Map Action Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col space-y-2 pointer-events-auto">
        {userLocation.latitude !== null && userLocation.longitude !== null && (
          <button
            onClick={() => {
              if (mapRef.current && userLocation.latitude && userLocation.longitude) {
                mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 16, { duration: 1.0 });
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-700 font-bold text-xs border border-emerald-300 shadow-md transition active:scale-95"
            title="Focus directly on your physical live location"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>🎯 Focus My Location</span>
          </button>
        )}

        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo([21.1458, 79.0882], 13, { duration: 1.0 });
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-md transition active:scale-95"
          title="View full Nagpur disaster perimeter"
        >
          <span>📍 Nagpur Overview</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 p-3 rounded-2xl text-xs space-y-1.5 pointer-events-auto max-w-[210px] border border-slate-200 shadow-lg">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Map Legend (Nagpur)</h4>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-slate-800 font-medium">You (Live GPS)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-cyan-600"></span>
          <span className="text-cyan-800 font-bold">Flood CCTV Cams</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-red-600"></span>
          <span className="text-slate-800">Critical Incident</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-orange-500"></span>
          <span className="text-slate-800">High Incident</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
          <span className="text-slate-800">Shelter</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
          <span className="text-slate-800">Hospital</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded bg-purple-600"></span>
          <span className="text-slate-800">Responder Team</span>
        </div>
        {routeGeometry && (
          <div className="flex items-center space-x-2 pt-1 border-t border-slate-200">
            <span className="w-4 h-0.5 bg-emerald-600"></span>
            <span className="text-emerald-700 font-bold">Evac Route</span>
          </div>
        )}
      </div>
    </div>
  );
};

