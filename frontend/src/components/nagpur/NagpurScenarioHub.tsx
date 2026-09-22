import React, { useState } from 'react';
import {
  Waves,
  AlertTriangle,
  LifeBuoy,
  Building2,
  Flame,
  Users,
  FileCheck2,
  Navigation,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Droplets,
  PhoneCall,
  Sparkles,
  Radio,
} from 'lucide-react';

interface NagpurScenarioHubProps {
  onOpenWaterwayHUD: () => void;
  onOpenDisasterMap: (center?: [number, number]) => void;
  onOpenShelterPage: () => void;
  onOpenAgencyOps: () => void;
  onOpenRescueModal: () => void;
  onOpenDamageModal: () => void;
  onOpenRoutingModal: () => void;
}

export const NagpurScenarioHub: React.FC<NagpurScenarioHubProps> = ({
  onOpenWaterwayHUD,
  onOpenDisasterMap,
  onOpenShelterPage,
  onOpenAgencyOps,
  onOpenRescueModal,
  onOpenDamageModal,
  onOpenRoutingModal,
}) => {
  const [activePillar, setActivePillar] = useState<number>(0);
  const [simulatingRescue, setSimulatingRescue] = useState(false);
  const [rescueDispatched, setRescueDispatched] = useState(false);
  const [balancingTriggered, setBalancingTriggered] = useState(false);

  const pillars = [
    {
      id: 'nag-river-cloudburst',
      title: '1. Nag River Cloudburst & Surge',
      subtitle: 'Sakkardara, Pratap Nagar & Sonegaon Low-Lying Inundation',
      icon: Waves,
      badge: 'Real-Time Telemetry',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      description:
        'A sudden heavy cloudburst in July/September elevates the Nag River by +2.1m in 45 minutes. ResQGrid AI utilizes computer vision gauge monitoring and ultrasonic telemetry to trigger automated flood warnings before floodwaters enter residential colonies.',
      stats: [
        { label: 'River Water Level', val: '210 cm (+130cm)', status: 'warning' },
        { label: 'Discharge Flow', val: '4.2 m³/s', status: 'critical' },
        { label: 'Colonies Alerted', val: 'Sakkardara, Pratap Nagar, Sonegaon', status: 'info' },
      ],
      actionText: 'Launch AI Waterway CV Monitor',
      actionHandler: onOpenWaterwayHUD,
    },
    {
      id: 'underpass-blockage-family',
      title: '2. Narendra Nagar Flooded Underpass',
      subtitle: 'Blocked Road List & Trapped Family SOS Rescue',
      icon: LifeBuoy,
      badge: 'Critical Rescue Active',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      description:
        'Underpasses flood without public notice and helplines become jammed. ResQGrid AI automatically flags flooded underpasses as BLOCKED in the GIS routing engine and immediately routes SDRF Swift Water Rescue boats to the trapped family with GPS tracking.',
      stats: [
        { label: 'Underpass Water Depth', val: '5.5 Feet (Submerged)', status: 'critical' },
        { label: 'Trapped Family', val: '4 Persons (1 Infant, 1 Senior)', status: 'critical' },
        { label: 'Assigned Unit', val: 'SDRF Swift Water Team 01 (ETA: 4m)', status: 'success' },
      ],
      actionText: 'View Underpass Rescue & Safe Detour',
      actionHandler: () => onOpenDisasterMap([21.1078, 79.0812]),
    },
    {
      id: 'shelter-balancing',
      title: '3. Shelter Capacity Balancing',
      subtitle: 'Somany High School (106% Overloaded) ➔ Dharampeth Hall (13% Vacant)',
      icon: Building2,
      badge: 'Automated Load Balancing',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description:
        'Prevents one shelter from overwhelming while nearby halls sit empty. When Somany High School exceeds capacity (106%), ResQGrid AI dynamically re-routes incoming evacuees to Dharampeth Community Hall (565 free beds, food provisions active).',
      stats: [
        { label: 'Somany High School', val: '530 / 500 (106% OVERLOAD)', status: 'critical' },
        { label: 'Dharampeth Hall', val: '85 / 650 (565 FREE BEDS)', status: 'success' },
        { label: 'Re-Route Status', val: 'Active Dynamic Divert', status: 'info' },
      ],
      actionText: 'Open Shelter Management & Load Balancer',
      actionHandler: onOpenShelterPage,
    },
    {
      id: 'itwari-fire-hydrant',
      title: '4. Itwari Cloth Market Fire',
      subtitle: 'Rapid Fire Hydrant Locator & Blocked Narrow Lane Bypass',
      icon: Flame,
      badge: 'GIS Hydrant Mapping',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      description:
        'Narrow lanes and market blockages delay fire brigades. ResQGrid AI provides instant 3D navigation around blocked commercial lanes and locates the closest 4 pressurized fire hydrants with exact water pressure ratings.',
      stats: [
        { label: 'Active Fire Incident', val: 'Itwari Wholesale Market, Lane 3', status: 'critical' },
        { label: 'Nearest Hydrant', val: 'Hydrant #HYD-04 (3.9 Bar, 120m away)', status: 'success' },
        { label: 'Detour Route', val: 'Gandhi Putla Road (Clear)', status: 'info' },
      ],
      actionText: 'Inspect Itwari Fire GIS & Hydrant Map',
      actionHandler: () => onOpenDisasterMap([21.1539, 79.1172]),
    },
    {
      id: 'inter-agency-coordination',
      title: '5. Inter-Agency Common Operational Picture',
      subtitle: 'Eliminating Duplicate SDRF, Fire, Police & Municipal Deployments',
      icon: Users,
      badge: 'Inter-Agency Sync',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description:
        'Stops the SDRF, Fire Brigade, Police, and NMC from working in silos. ResQGrid AI provides a single unified dispatch grid so rescue boats are never sent to already-cleared colonies while unreached lanes wait for hours.',
      stats: [
        { label: 'SDRF & NDRF Units', val: '6 Boats Deployed across 4 Zones', status: 'info' },
        { label: 'Nagpur Police Taskforce', val: '8 Road Closures & Traffic Diversions', status: 'info' },
        { label: 'NMC Dewatering Teams', val: '12 High-Capacity Pumps Active', status: 'success' },
      ],
      actionText: 'Open Unified Multi-Agency Command',
      actionHandler: onOpenAgencyOps,
    },
    {
      id: 'ai-damage-assessment',
      title: '6. Rapid AI Damage Assessment',
      subtitle: 'Replacing Slow Paper Forms with Instant Geospatial Computer Vision',
      icon: FileCheck2,
      badge: 'AI Vision Scoring',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description:
        'Eliminates weeks of delay from paper-based damage assessments. Responders and citizens upload structural photos to receive instant AI flood damage categorization, structural safety scores, and relief fund claims.',
      stats: [
        { label: 'Assessment Time', val: 'Instant (< 2.5 seconds)', status: 'success' },
        { label: 'Vision Model', val: 'FastAPI YOLOv8 + ResNet Classifier', status: 'info' },
        { label: 'Automated Audit', val: 'Structural Integrity & Relief Estimation', status: 'success' },
      ],
      actionText: 'Run AI Damage Analysis Scan',
      actionHandler: onOpenDamageModal,
    },
  ];

  const current = pillars[activePillar];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 border border-slate-800 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Nagpur Disaster Management &amp; Urban Resilience System</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Nagpur Emergency Scenario Response Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
              Engineered specifically for the Nagpur cloudburst flood, underpass rescue, shelter balancing, market fire, and unified inter-agency coordination.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenWaterwayHUD}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center space-x-1.5"
            >
              <Waves className="w-4 h-4" />
              <span>Launch AI Flood HUD</span>
            </button>
            <button
              onClick={onOpenRescueModal}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center space-x-1.5 animate-pulse"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>SOS Emergency</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Pillars Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          const isActive = activePillar === idx;
          return (
            <button
              key={pillar.id}
              onClick={() => setActivePillar(idx)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/40 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">0{idx + 1}</span>
              </div>
              <span className="text-xs font-bold line-clamp-1">{pillar.title.replace(/^\d+\.\s*/, '')}</span>
            </button>
          );
        })}
      </div>

      {/* Active Pillar Detailed Interactive Panel */}
      <div className="glass-panel-elevated p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${current.badgeColor}`}>
                {current.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">Nagpur Urban Resilience System</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">{current.title}</h3>
            <p className="text-xs text-cyan-400 font-semibold">{current.subtitle}</p>
          </div>

          <button
            onClick={current.actionHandler}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 transition flex items-center space-x-2 shrink-0 self-start"
          >
            <span>{current.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Pillar Description */}
        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">{current.description}</p>

        {/* Live Scenario Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {current.stats.map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <span
                className={`text-sm font-extrabold ${
                  stat.status === 'critical'
                    ? 'text-red-400'
                    : stat.status === 'warning'
                    ? 'text-amber-400'
                    : stat.status === 'success'
                    ? 'text-emerald-400'
                    : 'text-cyan-300'
                }`}
              >
                {stat.val}
              </span>
            </div>
          ))}
        </div>

        {/* Interactive Feature Demo Box for the Active Pillar */}
        {activePillar === 0 && (
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                <Waves className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Ambazari Dam Sluice &amp; Nag River Inundation Model
                </h4>
                <p className="text-xs text-slate-300">
                  Real-time gauge computer vision detects river overflow 38 minutes before manual municipal reports.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenWaterwayHUD}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold whitespace-nowrap shadow-md transition"
            >
              Open Live Video Feed &amp; Gauge
            </button>
          </div>
        )}

        {activePillar === 1 && (
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
                <LifeBuoy className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Narendra Nagar Flooded Underpass (Family Trapped in 5.5ft Water)
                </h4>
                <p className="text-xs text-slate-300">
                  SOS ticket #REC-7701 assigned to SDRF Swift Water Rescue Team. Traffic police notified to seal underpass.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSimulatingRescue(true);
                  setTimeout(() => {
                    setSimulatingRescue(false);
                    setRescueDispatched(true);
                  }, 1000);
                }}
                disabled={simulatingRescue || rescueDispatched}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-md transition ${
                  rescueDispatched
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {simulatingRescue
                  ? 'Transmitting GPS...'
                  : rescueDispatched
                  ? '✓ SDRF Boat En Route'
                  : 'Dispatch SDRF Team'}
              </button>
              <button
                onClick={() => onOpenDisasterMap([21.1078, 79.0812])}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Map Location
              </button>
            </div>
          </div>
        )}

        {activePillar === 2 && (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Real-Time Shelter Load Balancer Active
                </h4>
                <p className="text-xs text-slate-300">
                  Somany School (106% full) automatically routing 150 evacuees to Dharampeth Community Hall (565 free beds).
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setBalancingTriggered(true);
                setTimeout(() => setBalancingTriggered(false), 2000);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold whitespace-nowrap shadow-md transition"
            >
              {balancingTriggered ? '✓ Traffic Balanced' : 'Simulate Auto-Redirect'}
            </button>
          </div>
        )}

        {activePillar === 3 && (
          <div className="p-4 rounded-2xl bg-orange-950/30 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Itwari Market Fire Hydrant &amp; Lane Routing
                </h4>
                <p className="text-xs text-slate-300">
                  Narrow lane 3 blocked by collapsed awning. Detour calculated via Gandhi Putla Road to Hydrant #HYD-04.
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenDisasterMap([21.1539, 79.1172])}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold whitespace-nowrap shadow-md transition"
            >
              View Fire Hydrant GIS
            </button>
          </div>
        )}

        {activePillar === 4 && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Inter-Agency Shared Operational Picture (SDRF + Fire + NMC + Police)
                </h4>
                <p className="text-xs text-slate-300">
                  Live synchronized sector clearance logs prevent duplicate boat dispatches and eliminate 4-hour rescue delays.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAgencyOps}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold whitespace-nowrap shadow-md transition"
            >
              Open Unified Ops Grid
            </button>
          </div>
        )}

        {activePillar === 5 && (
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  FastAPI Computer Vision Damage Classification
                </h4>
                <p className="text-xs text-slate-300">
                  Replaces manual paperwork with AI image classification for structural damage, foundation washouts, and insurance relief.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenDamageModal}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold whitespace-nowrap shadow-md transition"
            >
              Scan Damage Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
