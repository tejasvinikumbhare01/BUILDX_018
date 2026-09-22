import React, { useState, useEffect } from 'react';
import {
  Radio,
  WifiOff,
  Crosshair,
  Maximize2,
  Play,
  Pause,
  Battery,
  Signal,
  Wind,
  Layers,
  Sparkles,
  ShieldAlert,
  Send,
  Cpu,
  Mic,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
  Eye,
  Activity,
  ArrowRight,
  Plane,
} from 'lucide-react';

interface DroneFeed {
  id: string;
  name: string;
  callsign: string;
  sector: string;
  altitudeM: number;
  speedKmh: number;
  batteryPct: number;
  mode: 'Thermal IR' | 'Optical RGB' | 'LIDAR Depth';
  status: 'PATROLLING' | 'HOVER_RECON' | 'AIRDROP_STANDBY';
  detectedTargets: string[];
  inundationLevel: string;
}

const DRONES: DroneFeed[] = [
  {
    id: 'drone-01',
    name: 'Nagpur Falcon Scout 01',
    callsign: 'DRN-FALCON-01',
    sector: 'Sakkardara & Nag River Culvert',
    altitudeM: 65,
    speedKmh: 34,
    batteryPct: 88,
    mode: 'Thermal IR',
    status: 'HOVER_RECON',
    detectedTargets: ['3 Trapped Residents on Rooftop (Sector B)', 'River Bank Breach 120m North'],
    inundationLevel: '2.1m Inundation (Rising)',
  },
  {
    id: 'drone-02',
    name: 'Narendra Underpass Sentry',
    callsign: 'DRN-SENTRY-02',
    sector: 'Narendra Nagar Underpass',
    altitudeM: 42,
    speedKmh: 12,
    batteryPct: 74,
    mode: 'LIDAR Depth',
    status: 'HOVER_RECON',
    detectedTargets: ['Submerged Sedan (4 Life-signs Detected)', 'Water Level: 5.5ft'],
    inundationLevel: '5.5ft (Critical Submerged)',
  },
  {
    id: 'drone-03',
    name: 'Itwari Market FireHawk',
    callsign: 'DRN-FIREHAWK-03',
    sector: 'Itwari Cloth Market',
    altitudeM: 80,
    speedKmh: 28,
    batteryPct: 91,
    mode: 'Thermal IR',
    status: 'PATROLLING',
    detectedTargets: ['Thermal Hotspot (380°C Roof Core)', 'Narrow Lane 3 Blocked with Debris'],
    inundationLevel: 'Dry Zone (Fire Hotspot)',
  },
];

export const ResilienceInnovations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drone' | 'mesh' | 'digitaltwin' | 'voicecad'>('drone');
  const [selectedDrone, setSelectedDrone] = useState<DroneFeed>(DRONES[0]);
  const [visionMode, setVisionMode] = useState<'Thermal IR' | 'Optical RGB' | 'LIDAR Depth'>('Thermal IR');
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [airdropSuccess, setAirdropSuccess] = useState(false);

  // LoRa Mesh Simulator State
  const [meshNodes, setMeshNodes] = useState([
    { id: 'NODE-01', name: 'Narendra Underpass Beacon', role: 'Survivor Beacon', hops: 0, rssi: -72, battery: 94, status: 'ONLINE' },
    { id: 'NODE-02', name: 'Nagpur Police Vehicle 14', role: 'Mobile Relay Node', hops: 1, rssi: -64, battery: 100, status: 'ONLINE' },
    { id: 'NODE-03', name: 'Dharampeth Tower Gateway', role: 'Municipal Mesh Gateway', hops: 2, rssi: -58, battery: 100, status: 'ONLINE' },
    { id: 'NODE-04', name: 'SDRF Command Base', role: 'HQ Central Sink', hops: 3, rssi: -52, battery: 100, status: 'ONLINE' },
  ]);
  const [beaconText, setBeaconText] = useState('SOS: 4 persons stuck in Narendra Nagar underpass. Water rising rapidly.');
  const [beaconSent, setBeaconSent] = useState(false);

  // Digital Twin Timeline State
  const [simMinute, setSimMinute] = useState(15);
  const [isPlayingSim, setIsPlayingSim] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlayingSim) {
      interval = setInterval(() => {
        setSimMinute((prev) => (prev >= 60 ? 0 : prev + 5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingSim]);

  const handleAirdrop = () => {
    setIsAirdropping(true);
    setTimeout(() => {
      setIsAirdropping(false);
      setAirdropSuccess(true);
      setTimeout(() => setAirdropSuccess(false), 3000);
    }, 1500);
  };

  const handleSendMeshBeacon = () => {
    setBeaconSent(true);
    setTimeout(() => setBeaconSent(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Innovation Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-100 via-white to-slate-200 border border-slate-300 shadow-xl text-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-600/10 border border-cyan-500/30 text-cyan-800 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Next-Generation Innovation Lab</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Nagpur Autonomous Resilience &amp; Offline Defense Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
              Breakthrough innovations designed to solve helpline congestion, zero-cellular blackouts, aerial survivor locating, and pre-flood predictive forecasting.
            </p>
          </div>

          {/* Innovation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300">
            <button
              onClick={() => setActiveTab('drone')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'drone'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plane className="w-3.5 h-3.5 text-cyan-600" />
              <span>AI Drone Recon</span>
            </button>
            <button
              onClick={() => setActiveTab('mesh')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'mesh'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5 text-red-600" />
              <span>Offline LoRa SOS</span>
            </button>
            <button
              onClick={() => setActiveTab('digitaltwin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'digitaltwin'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Hydraulic Twin</span>
            </button>
            <button
              onClick={() => setActiveTab('voicecad')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'voicecad'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-300'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-purple-600" />
              <span>Voice CAD Intercom</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODULE 1: AI DRONE RECONNAISSANCE */}
      {activeTab === 'drone' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Drone Selector & Telemetry Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-lg space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center justify-between">
                <span>Active Drone Patrols ({DRONES.length})</span>
                <span className="text-[10px] text-emerald-600 font-bold">● 3 Airborne</span>
              </h3>

              <div className="space-y-2">
                {DRONES.map((drone) => (
                  <button
                    key={drone.id}
                    onClick={() => {
                      setSelectedDrone(drone);
                      setVisionMode(drone.mode);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${
                      selectedDrone.id === drone.id
                        ? 'bg-slate-100 border-cyan-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{drone.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-100 text-cyan-800 border border-cyan-300">
                          {drone.callsign}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{drone.sector}</p>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-600 mt-2 font-mono">
                        <span>Alt: {drone.altitudeM}m</span>
                        <span>•</span>
                        <span>Spd: {drone.speedKmh} km/h</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">Bat: {drone.batteryPct}%</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Drone Controls Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-300 shadow-lg space-y-3 text-slate-800">
              <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Payload &amp; Vision Mode</h4>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                {(['Thermal IR', 'Optical RGB', 'LIDAR Depth'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setVisionMode(mode)}
                    className={`py-2 px-1 rounded-xl text-center transition border ${
                      visionMode === mode
                        ? 'bg-cyan-700 text-white border-cyan-800 shadow-sm font-bold'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAirdrop}
                disabled={isAirdropping}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {isAirdropping
                    ? 'Releasing Life-Jacket Pod...'
                    : airdropSuccess
                    ? '✓ Survival Pod Deployed'
                    : 'Deploy Emergency Life-Pod Airdrop'}
                </span>
              </button>
            </div>
          </div>

          {/* Aerial Recon Video & Computer Vision Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl h-[480px] flex flex-col justify-between p-4">
              {/* Top HUD Overlay */}
              <div className="flex items-center justify-between text-xs text-white z-10 bg-black/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono font-black text-cyan-400">{selectedDrone.callsign} [LIVE RECON]</span>
                  <span className="text-slate-400">|</span>
                  <span className="font-semibold">{selectedDrone.sector}</span>
                </div>
                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span className="text-emerald-400">FPS: 60</span>
                  <span>MODE: {visionMode}</span>
                  <span className="text-amber-400">LAT: 21.1458° N</span>
                </div>
              </div>

              {/* Dynamic Camera Simulation Background */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                {visionMode === 'Thermal IR' && (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-orange-950 flex flex-col items-center justify-center relative">
                    {/* Simulated Thermal Heat Spot */}
                    <div className="w-48 h-48 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 blur-2xl opacity-70 animate-pulse" />
                    <div className="absolute top-1/3 left-1/3 p-2 rounded-xl border border-yellow-400 bg-black/50 text-yellow-300 font-mono text-[10px]">
                      [+] HEAT SIGNATURE: 37.2°C (3 PERSONS)
                    </div>
                  </div>
                )}

                {visionMode === 'Optical RGB' && (
                  <div className="w-full h-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-blue-900/30 backdrop-contrast-125" />
                    <div className="text-center space-y-2 z-10">
                      <Crosshair className="w-16 h-16 text-cyan-400 mx-auto animate-spin" style={{ animationDuration: '10s' }} />
                      <p className="text-xs text-white font-mono uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">
                        AI Optical Surface Inundation Map: {selectedDrone.inundationLevel}
                      </p>
                    </div>
                  </div>
                )}

                {visionMode === 'LIDAR Depth' && (
                  <div className="w-full h-full bg-slate-950 flex items-center justify-center relative">
                    {/* Grid Mesh */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                      }}
                    />
                    <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 text-center z-10 font-mono text-cyan-300">
                      <p className="text-sm font-bold">LIDAR ACOUSTIC WATER DEPTH SCAN</p>
                      <p className="text-2xl font-black text-white mt-1">5.5 FT (UNDERPASS CREST)</p>
                      <p className="text-xs text-red-400 mt-1">Vehicle Completely Submerged</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Target Identification HUD */}
              <div className="z-10 bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold text-white uppercase tracking-wider">Automated AI Detection Stream:</span>
                  <span className="text-[10px] text-cyan-400 font-mono">YOLOv8-Aerial-v4 Model</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDrone.detectedTargets.map((target, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-white/10 border border-white/10 text-xs text-white flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-medium">{target}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: OFFLINE LORA MESH EMERGENCY BEACON */}
      {activeTab === 'mesh' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-6 text-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 uppercase">
                  Zero-Internet Protocol
                </span>
                <span className="text-xs text-slate-500 font-mono">868 MHz ISM Band Relay</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                P2P LoRa Emergency Mesh (Zero-Cellular SOS Relay)
              </h3>
              <p className="text-xs text-slate-600">
                When mobile telecom towers get inundated or 112 helplines jam, citizen beacons hop across city nodes directly into SDRF command.
              </p>
            </div>
            <button
              onClick={handleSendMeshBeacon}
              className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Test SOS Packet</span>
            </button>
          </div>

          {/* Node Mesh Hop Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {meshNodes.map((node, i) => (
              <div key={node.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-800">
                    {node.id}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 font-mono">RSSI: {node.rssi} dBm</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">{node.name}</h4>
                  <p className="text-[11px] text-slate-500">{node.role}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                  <span>Hop: #{node.hops}</span>
                  <span className="text-emerald-700 font-bold">Bat: {node.battery}%</span>
                </div>
                {i < meshNodes.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-300 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-white">
                    ➔
                  </div>
                )}
              </div>
            ))}
          </div>

          {beaconSent && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center space-x-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Packet Relayed Successfully: Narendra Nagar Underpass ➔ Police Vehicle 14 ➔ Dharampeth Tower ➔ SDRF HQ (3 Hops, 420ms Latency).
              </span>
            </div>
          )}

          {/* Live LoRa Packet Inspector Console */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-bold text-cyan-400">LIVE LoRaWAN PACKET INSPECTOR (ISM-868)</span>
              <span className="text-[10px] text-slate-400">CRC: VALID (0x9F41)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              [LORA-RX] 21:14:02.122 | PKT_ID: #LORA-NAGPUR-9921 | HOP_COUNT: 3 | PAYLOAD: <span className="text-amber-400">&quot;{beaconText}&quot;</span> | LAT: 21.1078, LNG: 79.0812 | SNR: +8.2dB
            </p>
          </div>
        </div>
      )}

      {/* MODULE 3: HYDRAULIC DIGITAL TWIN */}
      {activeTab === 'digitaltwin' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-6 text-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 uppercase">
                  Hydraulic Simulation
                </span>
                <span className="text-xs text-slate-500 font-mono">30-Minute Predictive Water Dynamics</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Predictive Urban Inundation Digital Twin
              </h3>
              <p className="text-xs text-slate-600">
                Forecasts street-by-street water elevation 30 minutes in advance using Ambazari Dam sluice discharge rates and doppler cloudburst radar.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingSim(!isPlayingSim)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
              >
                {isPlayingSim ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingSim ? 'Pause Simulation' : 'Run 60-Min Dynamic Forecast'}</span>
              </button>
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Simulation Time: +{simMinute} Minutes from Cloudburst Peak</span>
              <span className="text-blue-700 font-mono">Projected Sakkardara Inundation: {(1.1 + simMinute * 0.03).toFixed(2)}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={simMinute}
              onChange={(e) => setSimMinute(parseInt(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>T+0m (Rain Starts)</span>
              <span>T+20m (Dam Overflow)</span>
              <span>T+40m (Colonies Submerged)</span>
              <span>T+60m (Peak Recession)</span>
            </div>
          </div>

          {/* Colony Inundation Risk Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sakkardara Colony (Low-Lying)</span>
              <div className="text-xl font-black text-red-600">{(1.4 + simMinute * 0.02).toFixed(2)}m Water Depth</div>
              <p className="text-[11px] text-slate-600">EVACUATION PRIORITY 1: Move to Upper Floors</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Pratap Nagar Ring Junction</span>
              <div className="text-xl font-black text-amber-600">{(0.6 + simMinute * 0.015).toFixed(2)}m Water Depth</div>
              <p className="text-[11px] text-slate-600">Traffic Diverted via Wardha Flyover</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sonegaon Airport Culvert</span>
              <div className="text-xl font-black text-blue-600">{(0.3 + simMinute * 0.01).toFixed(2)}m Water Depth</div>
              <p className="text-[11px] text-slate-600">NMC Dewatering Pumps Deployed</p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: VOICE CAD INTERCOM & RADIO TRANSCRIPTION */}
      {activeTab === 'voicecad' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-300 shadow-xl space-y-6 text-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 uppercase">
                  AI CAD Dispatch
                </span>
                <span className="text-xs text-slate-500 font-mono">Whisper AI Radio Voice-to-CAD</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Automated Radio Voice CAD &amp; Inter-Agency Dispatch
              </h3>
              <p className="text-xs text-slate-600">
                Transforms noisy emergency radio chatter into real-time verified incident tickets and dispatches resources without human typing lag.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Radio Channels */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center justify-between">
                <span>Nagpur Emergency Radio Frequency Channels</span>
                <span className="text-emerald-600 text-[10px] font-mono">● Encrypted Sync</span>
              </h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">CH-01: SDRF Swift Water Ops</p>
                      <p className="text-[10px] text-slate-500">148.250 MHz • Narendra Underpass</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">TRANSMITTING</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">CH-02: Nagpur Fire Brigade Tactical</p>
                      <p className="text-[10px] text-slate-500">152.875 MHz • Itwari Cloth Market</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">STANDBY</span>
                </div>
              </div>
            </div>

            {/* Real-Time AI Transcription Feed */}
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="text-purple-400 font-bold">WHISPER AI LIVE RADIO TRANSCRIPT</span>
                <span className="text-emerald-400 text-[10px]">Confidence: 98.4%</span>
              </div>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <p className="text-slate-300">
                  <strong className="text-cyan-400">[SDRF-LEADER]</strong> &quot;Unit 1 arriving at Narendra Nagar underpass. Water is at 5.5 feet. Deploying inflatable rescue raft for 4 civilians now.&quot;
                </p>
                <p className="text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30">
                  ➔ <strong>AI CAD ACTION GENERATED:</strong> Ticket #REC-7701 marked &#39;IN_PROGRESS&#39;. Ambulance 04 dispatched to Narendra underpass north exit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
