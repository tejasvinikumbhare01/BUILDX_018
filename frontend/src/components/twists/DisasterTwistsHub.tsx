import React, { useState } from 'react';
import {
  Layers,
  WifiOff,
  Package,
  Bus,
  ArrowLeft,
  Navigation,
  CheckCircle2,
  Radio,
  Building2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface DisasterTwistsHubProps {
  onOpenWaterwayHUD?: () => void;
  onOpenDisasterMap?: (center?: [number, number]) => void;
  onOpenShelterPage?: () => void;
  onOpenAgencyOps?: () => void;
  onBackToMap?: () => void;
}

export const DisasterTwistsHub: React.FC<DisasterTwistsHubProps> = ({
  onOpenWaterwayHUD,
  onOpenDisasterMap,
  onBackToMap,
}) => {
  const [selectedTwist, setSelectedTwist] = useState<number>(0);

  // Twist 1: Multi-Hazard State
  const [quakeMagnitude] = useState(6.4);
  const [waterElevationM] = useState(2.3);

  // Twist 2: Offline Blackout State
  const [loraPacketsTransmitted, setLoraPacketsTransmitted] = useState(148);
  const [testSosSending, setTestSosSending] = useState(false);
  const [testSosSent, setTestSosSent] = useState(false);

  // Twist 3: Resource Scarcity State
  const [allocatingResources, setAllocatingResources] = useState(false);
  const [allocatedSuccess, setAllocatedSuccess] = useState(false);

  // Twist 4: Evacuation State
  const [dispatchedBuses, setDispatchedBuses] = useState(28);
  const [evacuatedPercentage, setEvacuatedPercentage] = useState(64);
  const [simulatingEvacuation, setSimulatingEvacuation] = useState(false);

  const handleReturnToMap = (coords?: [number, number]) => {
    if (onOpenDisasterMap) {
      onOpenDisasterMap(coords);
    } else if (onBackToMap) {
      onBackToMap();
    }
  };

  const twists = [
    {
      id: 'multi-hazard',
      tag: 'Protocol 01',
      title: 'Compound Hazard Defense: Earthquake + Cloudburst Flooding',
      shortTitle: 'Compound Multi-Hazard',
      icon: Layers,
      description:
        'A severe 6.4 magnitude earthquake strikes Nagpur during a cloudburst flood. ResQGrid AI combines seismic structural damage vectors with real-time flood inundation maps to direct emergency teams safely around fractured roadways and submerged culverts.',
    },
    {
      id: 'blackout',
      tag: 'Protocol 02',
      title: 'Communication Blackout: Offline LoRa Mesh & Store-and-Forward',
      shortTitle: 'Offline Mesh SOS',
      icon: WifiOff,
      description:
        'When cellular towers and broadband networks collapse, ResQGrid switches to peer-to-peer 868MHz LoRa mesh packets and local IndexedDB store-and-forward routing. Citizens send distress beacons that hop across nearby emergency vehicles without internet.',
    },
    {
      id: 'resource-allocation',
      tag: 'Protocol 03',
      title: 'Scarcity Optimization: AI Resource & Supply Triage',
      shortTitle: 'Resource & Asset Triage',
      icon: Package,
      description:
        'When relief supplies are critically limited, ResQGrid uses vulnerability-weighted optimization to allocate rescue boats, medical emergency kits, and food supplies to the most endangered populations first (infants, elderly, and medical casualties).',
    },
    {
      id: 'mass-evacuation',
      tag: 'Protocol 04',
      title: 'Mass Evacuation: Safe Green Corridors & Transit Detours',
      shortTitle: 'Mass Evacuation Corridors',
      icon: Bus,
      description:
        'Computes dynamic Green Corridor detours avoiding flooded underpasses (Narendra Nagar, Sitabuldi) and unstable structures, organizing city transport buses to evacuate high-risk residential zones swiftly to designated safety shelters.',
    },
  ];

  const current = twists[selectedTwist];

  const handleSendOfflineBeacon = () => {
    setTestSosSending(true);
    setTimeout(() => {
      setTestSosSending(false);
      setTestSosSent(true);
      setLoraPacketsTransmitted((prev) => prev + 1);
      setTimeout(() => setTestSosSent(false), 3500);
    }, 1000);
  };

  const handleRunResourceOptimizer = () => {
    setAllocatingResources(true);
    setTimeout(() => {
      setAllocatingResources(false);
      setAllocatedSuccess(true);
      setTimeout(() => setAllocatedSuccess(false), 3500);
    }, 1200);
  };

  const handleAccelerateEvacuation = () => {
    setSimulatingEvacuation(true);
    setTimeout(() => {
      setSimulatingEvacuation(false);
      setEvacuatedPercentage((prev) => Math.min(100, prev + 12));
      setDispatchedBuses((prev) => prev + 6);
    }, 1000);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Header with Direct Return to Disaster Map */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleReturnToMap()}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Disaster Map</span>
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Nagpur Relief, Evacuation &amp; Disaster Protocols
            </h2>
            <p className="text-xs text-slate-500">
              Protocols for compound hazards, offline zero-internet blackouts, and emergency resource allocation.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            4 Protocols Operational
          </span>
        </div>
      </div>

      {/* 2. Simple 4-Tab Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {twists.map((twist, idx) => {
          const Icon = twist.icon;
          const isSelected = selectedTwist === idx;
          return (
            <button
              key={twist.id}
              onClick={() => setSelectedTwist(idx)}
              className={`p-3.5 rounded-xl border text-left transition flex items-center space-x-3 ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold opacity-75 block">
                  {twist.tag}
                </span>
                <span className="text-xs font-bold truncate block">
                  {twist.shortTitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Clean, Grey-White Content Card for Selected Twist */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-wide">
              {current.tag}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {current.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {current.description}
            </p>
          </div>

          <button
            onClick={() => handleReturnToMap()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 transition text-xs font-bold whitespace-nowrap self-start"
          >
            <Navigation className="w-3.5 h-3.5 text-slate-700" />
            <span>View on Disaster Map</span>
          </button>
        </div>

        {/* Twist 1: Multi-Hazard Detail */}
        {selectedTwist === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Seismic Sensor</span>
                <div className="text-lg font-black text-slate-900 mt-1">M {quakeMagnitude} Richter</div>
                <p className="text-xs text-slate-600 mt-1">Sitabuldi &amp; Mahal structural cracks flagged.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Hydraulic Gauge</span>
                <div className="text-lg font-black text-slate-900 mt-1">+{waterElevationM}m Water Rise</div>
                <p className="text-xs text-slate-600 mt-1">Nag River low-lying colonies inundated.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Compound Action</span>
                <div className="text-lg font-black text-emerald-700 mt-1">Unified Routing</div>
                <p className="text-xs text-slate-600 mt-1">Rescue vehicles routed around both flooded underpasses and cracked bridges.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-700 font-medium">
                Want to see the Narendra Nagar flooded underpass and Sitabuldi bridge status directly?
              </span>
              <button
                onClick={() => handleReturnToMap([21.1078, 79.0812])}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition whitespace-nowrap"
              >
                Inspect on Disaster Map
              </button>
            </div>
          </div>
        )}

        {/* Twist 2: Offline Blackout Detail */}
        {selectedTwist === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">
                  Zero-Internet LoRa Mesh &amp; Local Storage Active
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Distress reports are saved offline in browser IndexedDB and hopped across emergency nodes via 868MHz radio.
                </p>
              </div>
              <button
                onClick={handleSendOfflineBeacon}
                disabled={testSosSending}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shrink-0"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{testSosSending ? 'Broadcasting Beacon...' : 'Test Offline SOS Beacon'}</span>
              </button>
            </div>

            {testSosSent && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  ✓ Offline SOS Beacon received and queued locally. Hop sequence: Citizen Device ➔ Patrol Car 09 ➔ Dharampeth Hub.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-bold block">Packets Synced</span>
                <span className="text-base font-black text-slate-900">{loraPacketsTransmitted}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-bold block">Mesh Frequency</span>
                <span className="text-base font-black text-slate-900">868 MHz</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-bold block">Hop Latency</span>
                <span className="text-base font-black text-slate-900">142 ms</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-bold block">Internet Required</span>
                <span className="text-base font-black text-emerald-700">NO (Offline)</span>
              </div>
            </div>
          </div>
        )}

        {/* Twist 3: Resource Allocation Detail */}
        {selectedTwist === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Rescue Boats</span>
                <div className="text-lg font-black text-slate-900 mt-1">12 Available</div>
                <p className="text-xs text-slate-600 mt-1">Dispatched to high-water depth zones (Sakkardara).</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Medical Triage Kits</span>
                <div className="text-lg font-black text-slate-900 mt-1">450 Units</div>
                <p className="text-xs text-slate-600 mt-1">Prioritized for senior citizens and injured residents.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Shelter Rations</span>
                <div className="text-lg font-black text-slate-900 mt-1">1,200 Packs</div>
                <p className="text-xs text-slate-600 mt-1">Balanced between full and underutilized shelters.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">
                  AI Knapsack Allocation Engine
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Calculates optimal distribution to minimize rescue wait times.
                </p>
              </div>
              <button
                onClick={handleRunResourceOptimizer}
                disabled={allocatingResources}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0"
              >
                {allocatingResources ? 'Optimizing Resources...' : 'Run Resource Optimizer'}
              </button>
            </div>

            {allocatedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  ✓ Resource dispatch optimal. Surplus rations routed to Dharampeth Community Hall (565 free beds).
                </span>
              </div>
            )}
          </div>
        )}

        {/* Twist 4: Mass Evacuation Routing Detail */}
        {selectedTwist === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Evacuation Progress</span>
                <div className="text-xl font-black text-slate-900">{evacuatedPercentage}% Cleared</div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-slate-900 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${evacuatedPercentage}%` }}
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Transit Fleet</span>
                <div className="text-xl font-black text-slate-900">{dispatchedBuses} Municipal Buses</div>
                <p className="text-xs text-slate-600">Running on protected Green Corridor detours.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase">
                  Green Corridor Safe Transit Simulation
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Evacuate remaining residents from Sakkardara flood basin to Yashwant Stadium.
                </p>
              </div>
              <button
                onClick={handleAccelerateEvacuation}
                disabled={simulatingEvacuation || evacuatedPercentage >= 100}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0"
              >
                {simulatingEvacuation ? 'Dispatching Buses...' : 'Dispatch Next Evacuation Wave'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
