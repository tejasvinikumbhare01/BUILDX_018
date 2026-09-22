import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Waves,
  Video,
  Camera,
  AlertTriangle,
  Radio,
  Play,
  Pause,
  Maximize2,
  Terminal,
  Activity,
  Sliders,
  Send,
  CheckCircle2,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

interface StationTelemetry {
  id: string;
  name: string;
  stationCode: string;
  location: string;
  baseLevelCm: number;
  criticalThresholdCm: number;
  flowRate: number;
  rainfallRate: number;
  waterTemp: number;
  elevation: number;
  confidence: number;
  risk: 'Normal' | 'Elevated' | 'Flood Warning' | 'Critical';
}

const STATIONS: StationTelemetry[] = [
  {
    id: 'cctv-1',
    name: 'Ambazari Dam Spillway Sluice',
    stationCode: 'Station ID: 09',
    location: 'Ambazari Lake Sector, Nagpur',
    baseLevelCm: 210,
    criticalThresholdCm: 200,
    flowRate: 4.2,
    rainfallRate: 32.4,
    waterTemp: 17.5,
    elevation: 152.2,
    confidence: 91.7,
    risk: 'Flood Warning',
  },
  {
    id: 'cctv-2',
    name: 'Nag River Drainage Station',
    stationCode: 'Station ID: 04',
    location: 'Sitabuldi Culvert Junction, Nagpur',
    baseLevelCm: 120,
    criticalThresholdCm: 180,
    flowRate: 1.2,
    rainfallRate: 12.0,
    waterTemp: 21.0,
    elevation: 148.5,
    confidence: 94.2,
    risk: 'Normal',
  },
  {
    id: 'cctv-3',
    name: 'Pili River Floodway Canal',
    stationCode: 'Station ID: 12',
    location: 'Nari Road Siphon Weir, Nagpur',
    baseLevelCm: 185,
    criticalThresholdCm: 190,
    flowRate: 2.8,
    rainfallRate: 28.5,
    waterTemp: 18.2,
    elevation: 144.1,
    confidence: 89.4,
    risk: 'Elevated',
  },
  {
    id: 'cctv-4',
    name: 'Sitabuldi Metro Bridge Drainage',
    stationCode: 'Station ID: 01',
    location: 'Wardha Road Overpass, Nagpur',
    baseLevelCm: 95,
    criticalThresholdCm: 160,
    flowRate: 0.8,
    rainfallRate: 8.5,
    waterTemp: 22.4,
    elevation: 160.0,
    confidence: 96.1,
    risk: 'Normal',
  },
];

interface WaterwayMonitoringHUDProps {
  userLat?: number | null;
  userLng?: number | null;
  userAddress?: string | null;
  onIncidentReported?: (incident: any) => void;
  onBackToMap?: () => void;
}

export const WaterwayMonitoringHUD: React.FC<WaterwayMonitoringHUDProps> = ({
  userLat,
  userLng,
  userAddress,
  onIncidentReported,
  onBackToMap,
}) => {
  const [selectedStationIndex, setSelectedStationIndex] = useState<number>(0);
  const currentStation = STATIONS[selectedStationIndex];

  // Interactive Live Water Level Modifier (User can drag slider to test AI response)
  const [waterLevelCm, setWaterLevelCm] = useState<number>(currentStation.baseLevelCm);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [useDeviceCamera, setUseDeviceCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Computed Risk based on current level
  const riskStatus: 'Normal' | 'Elevated' | 'Flood Warning' | 'Critical' =
    waterLevelCm >= currentStation.criticalThresholdCm + 40
      ? 'Critical'
      : waterLevelCm >= currentStation.criticalThresholdCm
      ? 'Flood Warning'
      : waterLevelCm >= currentStation.criticalThresholdCm - 30
      ? 'Elevated'
      : 'Normal';

  // Dynamic flow calculation based on water level (Manning's equation approximation)
  const dynamicFlowRate = Number(
    (currentStation.flowRate * (waterLevelCm / currentStation.baseLevelCm)).toFixed(1)
  );

  // Dynamic confidence score with slight realistic fluctuation
  const [liveConfidence, setLiveConfidence] = useState<number>(currentStation.confidence);

  // Terminal logs state
  const [logs, setLogs] = useState<string[]>([
    '>>> [INITIALIZE] YOLOv8-WaterWay Computer Vision Model loaded on CUDA:0',
    '>>> [INFERENCE] Calibrated gauge staff marker recognition: Active',
    '>>> [TELEMETRY] Connected to Nagpur Civil Defense hydrological mesh',
  ]);

  // Reporting feedback
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Switch station
  const handleSelectStation = (index: number) => {
    setSelectedStationIndex(index);
    setWaterLevelCm(STATIONS[index].baseLevelCm);
    setLiveConfidence(STATIONS[index].confidence);
  };

  // Device Camera activation
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Camera permission denied.');
      setUseDeviceCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (useDeviceCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [useDeviceCamera, startCamera, stopCamera]);

  // Log generator interval for live AI inference stream
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      const jitter = (Math.random() * 0.4 - 0.2).toFixed(1);
      const confJitter = (Math.random() * 0.6 - 0.3);
      setLiveConfidence((prev) => Math.min(99.2, Math.max(88.0, Number((prev + confJitter).toFixed(1)))));

      const newLog =
        riskStatus === 'Flood Warning' || riskStatus === 'Critical'
          ? `[${now}] [WARN] ${currentStation.stationCode}: Level ${waterLevelCm}cm (+${jitter}cm) > Threshold ${currentStation.criticalThresholdCm}cm! Risk: ${riskStatus}`
          : `[${now}] [INFO] ${currentStation.stationCode}: Frame analyzed. Level: ${waterLevelCm}cm | Flow: ${dynamicFlowRate}m³/s | Conf: ${liveConfidence}%`;

      setLogs((prev) => [...prev.slice(-18), newLog]);
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, currentStation, waterLevelCm, riskStatus, dynamicFlowRate, liveConfidence]);

  // Canvas High-Fidelity Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanLineY = 120;
    let scanSpeed = 2.5;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      if (useDeviceCamera && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
      } else {
        // High-Fidelity Realistic Waterway Canal Simulation
        // Sky / Bridge background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Concrete Embankment Wall on the left/right
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, height * 0.2, width * 0.35, height * 0.8);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(width * 0.8, height * 0.2, width * 0.2, height * 0.8);

        // Embankment stone texture stripes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        for (let y = height * 0.25; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width * 0.35, y);
          ctx.stroke();
        }

        // Bridge pier / pillar in the center where the gauge staff is mounted
        ctx.fillStyle = '#475569';
        ctx.fillRect(width * 0.45, height * 0.15, width * 0.18, height * 0.85);
        ctx.fillStyle = '#334155';
        ctx.fillRect(width * 0.45, height * 0.15, 8, height * 0.85);

        // Water Calculation based on waterLevelCm
        // High level = water rises higher up the canvas (smaller Y coordinate)
        const waterNormalized = Math.min(1, Math.max(0, (waterLevelCm - 50) / 300));
        const waterSurfaceY = height * 0.85 - waterNormalized * (height * 0.55);

        // Water Body with Gradients & Depth
        const waterGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, height);
        if (riskStatus === 'Critical' || riskStatus === 'Flood Warning') {
          waterGrad.addColorStop(0, 'rgba(30, 58, 138, 0.88)'); // Turbulent deep blue/brown
          waterGrad.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
        } else {
          waterGrad.addColorStop(0, 'rgba(14, 116, 144, 0.82)'); // Clean canal teal
          waterGrad.addColorStop(1, 'rgba(15, 23, 42, 0.94)');
        }
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, waterSurfaceY, width, height - waterSurfaceY);

        // Animated Waves & Water Foam
        const time = Date.now() * 0.003;
        ctx.strokeStyle = riskStatus === 'Critical' ? '#f87171' : '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, waterSurfaceY);
        for (let x = 0; x <= width; x += 15) {
          const waveHeight = Math.sin(x * 0.03 + time * 3) * 4 + Math.cos(x * 0.015 - time) * 3;
          ctx.lineTo(x, waterSurfaceY + waveHeight);
        }
        ctx.stroke();

        // Second wave ripple layer for realism
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, waterSurfaceY + 8);
        for (let x = 0; x <= width; x += 20) {
          const waveHeight = Math.cos(x * 0.04 - time * 2) * 3;
          ctx.lineTo(x, waterSurfaceY + 8 + waveHeight);
        }
        ctx.stroke();

        // 2. Physical Water Gauge Staff (Measuring Ruler)
        // Mounted on the central pier
        const staffX = width * 0.51;
        const staffY = height * 0.18;
        const staffWidth = 32;
        const staffHeight = height * 0.75;

        // Staff Backplate (White with black border)
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(staffX, staffY, staffWidth, staffHeight);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(staffX, staffY, staffWidth, staffHeight);

        // Staff Graduated Markings (Tick Marks: 10, 14, 16, 20, 24, 28, 30... exactly like the reel!)
        const marks = [
          { val: '30', level: 300 },
          { val: '28', level: 280 },
          { val: '24', level: 240 },
          { val: '20', level: 200 },
          { val: '16', level: 160 },
          { val: '14', level: 140 },
          { val: '10', level: 100 },
        ];

        marks.forEach((m) => {
          const markY = staffY + (1 - (m.level - 50) / 300) * (staffHeight - 20);
          if (markY >= staffY && markY <= staffY + staffHeight) {
            // Alternating checker pattern on gauge
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(staffX + 2, markY - 8, 10, 16);

            // Tick lines
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(staffX + 12, markY);
            ctx.lineTo(staffX + staffWidth - 2, markY);
            ctx.stroke();

            // Number Label
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(m.val, staffX + 15, markY + 4);
          }
        });

        // 3. AI Computer Vision Detection Bounding Box & HUD
        // Bounding Box around the Gauge Staff
        const bboxPad = 12;
        const bboxX = staffX - bboxPad;
        const bboxY = staffY - bboxPad;
        const bboxW = staffWidth + bboxPad * 2;
        const bboxH = staffHeight + bboxPad * 2;

        // Glowing Cyan Bounding Box
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bboxX, bboxY, bboxW, bboxH);

        // Corner Brackets for High-Tech AI Box
        const bracketLen = 14;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#22d3ee';

        // Top-Left
        ctx.beginPath();
        ctx.moveTo(bboxX - 2, bboxY + bracketLen);
        ctx.lineTo(bboxX - 2, bboxY - 2);
        ctx.lineTo(bboxX + bracketLen, bboxY - 2);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(bboxX + bboxW - bracketLen, bboxY - 2);
        ctx.lineTo(bboxX + bboxW + 2, bboxY - 2);
        ctx.lineTo(bboxX + bboxW + 2, bboxY + bracketLen);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(bboxX - 2, bboxY + bboxH - bracketLen);
        ctx.lineTo(bboxX - 2, bboxY + bboxH + 2);
        ctx.lineTo(bboxX + bracketLen, bboxY + bboxH + 2);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(bboxX + bboxW - bracketLen, bboxY + bboxH + 2);
        ctx.lineTo(bboxX + bboxW + 2, bboxY + bboxH + 2);
        ctx.lineTo(bboxX + bboxW + 2, bboxY + bboxH - bracketLen);
        ctx.stroke();

        // 4. Laser Scan Line sweeping vertically over gauge staff
        scanLineY += scanSpeed;
        if (scanLineY > bboxY + bboxH - 10 || scanLineY < bboxY + 10) {
          scanSpeed *= -1;
        }

        ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bboxX - 6, scanLineY);
        ctx.lineTo(bboxX + bboxW + 6, scanLineY);
        ctx.stroke();

        // 5. Leader Line to the Floating Info HUD (Identical to Reel!)
        const hudX = width * 0.06;
        const hudY = height * 0.22;
        const hudW = 180;
        const hudH = 105;

        // Line connecting HUD to Gauge Staff
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hudX + hudW, hudY + hudH * 0.5);
        ctx.lineTo(staffX - bboxPad, staffY + (staffHeight * 0.35));
        ctx.stroke();

        // Small circle anchor at connection point
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(staffX - bboxPad, staffY + (staffHeight * 0.35), 4, 0, Math.PI * 2);
        ctx.fill();

        // 6. Floating On-Screen HUD Card (Identical styling to the Instagram reel!)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)'; // Cyan translucent glass
        ctx.fillRect(hudX, hudY, hudW, hudH);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hudX, hudY, hudW, hudH);

        // Station ID Header
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.fillRect(hudX, hudY, hudW, 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(currentStation.stationCode, hudX + 8, hudY + 16);

        // Telemetry text
        ctx.fillStyle = '#e0f2fe';
        ctx.font = '11px sans-serif';

        // Risk line
        const isAlert = riskStatus === 'Flood Warning' || riskStatus === 'Critical';
        ctx.fillText('Risk: ', hudX + 8, hudY + 42);
        ctx.fillStyle = isAlert ? '#f87171' : '#34d399';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(riskStatus, hudX + 42, hudY + 42);

        // Confidence
        ctx.fillStyle = '#e0f2fe';
        ctx.font = '11px sans-serif';
        ctx.fillText(`Confidence: ${liveConfidence}%`, hudX + 8, hudY + 60);

        // Level
        ctx.fillText(`Level: ${waterLevelCm}cm`, hudX + 8, hudY + 78);

        // Flow
        ctx.fillText(`Flow: ${dynamicFlowRate}m³/s`, hudX + 8, hudY + 96);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    useDeviceCamera,
    waterLevelCm,
    riskStatus,
    dynamicFlowRate,
    liveConfidence,
    currentStation,
  ]);

  // Dispatch Emergency Alert to Dashboard
  const handleDispatchAlert = async () => {
    try {
      setIsReporting(true);
      const res = await api.post('/incidents', {
        type: 'FLOOD',
        severity: riskStatus === 'Critical' ? 'CRITICAL' : 'HIGH',
        description: `[AI FLOOD RISK DETECTION] Real-time automated alert from ${currentStation.stationCode} (${currentStation.name}). Water level: ${waterLevelCm}cm (Flow: ${dynamicFlowRate}m³/s). Threshold exceeded.`,
        latitude: userLat ?? 21.1458,
        longitude: userLng ?? 79.0882,
        address: `${currentStation.location}, Nagpur, Maharashtra`,
        peopleAffected: 50,
        rescueRequired: riskStatus === 'Critical',
      });

      setReportSuccess(true);
      if (onIncidentReported) onIncidentReported(res.data.incident);
      setTimeout(() => setReportSuccess(false), 4000);
    } catch (err: any) {
      console.error('Dispatch error:', err);
      alert('Failed to dispatch alert: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* 1. Iconic Neon Header matching Reel */}
      <div className="bg-slate-900/90 border-b border-cyan-900/60 p-4 sm:p-5 text-center relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-cyan-600/10 pointer-events-none" />
        {onBackToMap && (
          <button
            onClick={onBackToMap}
            className="absolute left-4 top-4 z-20 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow flex items-center gap-1.5 transition"
          >
            <span>← Return to Disaster Map</span>
          </button>
        )}
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AI YOLOv8-CV Hydro-Telemetric Engine &bull; LIVE 30 FPS</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-cyan-400 tracking-wide drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
            AI Flood Risk Detection: Real-Time Waterway Monitoring
          </h2>
          <p className="text-xs text-slate-400">
            Nagpur Regional Drainage Basin &bull; Automated Meniscus Gauging &amp; Hydraulic Flow Estimation
          </p>
        </div>
      </div>

      {/* 2. Main Middle Section: Video Stream + Analytics Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-slate-800">
        {/* Left Side (8 Cols): Video / Simulation Canvas */}
        <div className="lg:col-span-8 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 flex flex-col justify-between">
          <div className="relative aspect-[16/10] sm:aspect-video rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 bg-slate-900">
            {/* Hidden video element for device webcam */}
            <video ref={videoRef} playsInline muted className="hidden" />

            {/* High-Tech Canvas Rendering Video + CV HUD */}
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full h-full object-cover block"
            />

            {/* Top Toolbar overlay on video */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-auto">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-cyan-500/50 text-[11px] font-mono font-bold text-cyan-300 backdrop-blur-md">
                  REC &bull; {currentStation.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    riskStatus === 'Critical' || riskStatus === 'Flood Warning'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {riskStatus}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setUseDeviceCamera(!useDeviceCamera)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                    useDeviceCamera
                      ? 'bg-cyan-600 text-white shadow-lg'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{useDeviceCamera ? 'Using WebCam' : 'Switch to WebCam'}</span>
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Interactive Water Level Slider Overlay (Bottom of Video) */}
            <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-3 z-20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
                  Simulate Water Level:
                </span>
                <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  {waterLevelCm} cm
                </span>
              </div>

              <div className="w-full sm:w-64 flex items-center space-x-2">
                <span className="text-[10px] text-slate-400">80cm</span>
                <input
                  type="range"
                  min={80}
                  max={320}
                  value={waterLevelCm}
                  onChange={(e) => setWaterLevelCm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] text-red-400 font-bold">320cm</span>
              </div>

              <div className="text-[11px] text-slate-400 hidden md:block">
                Drag slider to test live AI reaction &amp; sirens
              </div>
            </div>
          </div>

          {/* Camera Error Alert if user clicked WebCam without permission */}
          {cameraError && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{cameraError} Falling back to high-fidelity AI simulated stream.</span>
            </div>
          )}

          {/* Action Button Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>
                Meniscus Edge Detection: <strong className="text-white">Active (Sobel + Hough)</strong>
              </span>
            </div>

            <button
              onClick={handleDispatchAlert}
              disabled={isReporting}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg ${
                riskStatus === 'Critical' || riskStatus === 'Flood Warning'
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
              }`}
            >
              {isReporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Broadcasting Civil Defense Alert...</span>
                </>
              ) : reportSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Alert Dispatched to Nagpur Hub!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Incident to Command Center</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side (4 Cols): FLOODWATCH ANALYTICS HUD - REALTIME */}
        <div className="lg:col-span-4 p-4 sm:p-5 bg-slate-900/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>FloodWatch Analytics HUD</span>
                </h3>
                <span className="text-[10px] text-slate-400">REALTIME HYDROLOGICAL SENSORS</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>

            {/* Station Switcher Chips */}
            <div className="mb-4">
              <label className="block text-[11px] text-slate-400 font-medium mb-1.5">
                Monitoring Stations:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {STATIONS.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => handleSelectStation(idx)}
                    className={`p-2 rounded-xl text-left border transition ${
                      selectedStationIndex === idx
                        ? 'bg-cyan-600/20 border-cyan-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{st.stationCode}</div>
                    <div className="text-[10px] text-slate-400 truncate">{st.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Telemetry Metric Cards matching Reel */}
            <div className="space-y-2 text-xs">
              {/* Water Level Gauge Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-cyan-900/50 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Water Level</span>
                  <span className="font-mono font-bold text-cyan-300">{waterLevelCm} cm</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      riskStatus === 'Critical'
                        ? 'bg-red-500'
                        : riskStatus === 'Flood Warning'
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, (waterLevelCm / 320) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>Threshold: {currentStation.criticalThresholdCm}cm</span>
                  <span className={waterLevelCm > currentStation.criticalThresholdCm ? 'text-red-400 font-bold' : 'text-slate-400'}>
                    {waterLevelCm > currentStation.criticalThresholdCm ? `+${waterLevelCm - currentStation.criticalThresholdCm}cm OVER` : 'SAFE'}
                  </span>
                </div>
              </div>

              {/* Hydro Parameters Table matching reel */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Rainfall rate:</span>
                  <span className="text-cyan-300 font-bold">{currentStation.rainfallRate} mm/h</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Water Temp:</span>
                  <span className="text-slate-200">{currentStation.waterTemp}°C</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Discharge Flow:</span>
                  <span className="text-emerald-400 font-bold">{dynamicFlowRate} m³/s</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Elevation:</span>
                  <span className="text-slate-200">{currentStation.elevation} m</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">CV Confidence:</span>
                  <span className="text-cyan-400 font-bold">{liveConfidence}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-3">
            <span className="font-bold text-slate-400 block mb-1">Station GPS Coords:</span>
            <span>Nagpur Civil Defense &bull; Station ID 09 &bull; Lat 21.1458, Lng 79.0882</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Panel: Live Python AI Pipeline Code & Logs (Identical to Reel!) */}
      <div className="bg-slate-950 p-4 sm:p-5 border-t border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Python Pipeline Code Editor matching reel */}
          <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>flood_risk_prediction.py</span>
              </span>
              <span className="text-[10px] text-slate-400">Python 3.10 &bull; OpenCV 4.9</span>
            </div>

            <pre className="text-[11px] text-slate-300 overflow-x-auto leading-relaxed space-y-0.5">
              <code>
                <span className="text-purple-400">class</span>{' '}
                <span className="text-amber-300">flood_risk_prediction_pipeline</span>:<br />
                {'    '}<span className="text-purple-400">def</span>{' '}
                <span className="text-blue-400">detect_water_level</span>(frame):<br />
                {'        '}staff_roi = extract_measuring_staff(frame)<br />
                {'        '}waterline = detect_horizontal_meniscus(staff_roi)<br />
                {'        '}level_cm = calibrate_pixels_to_cm(waterline)<br />
                {'        '}flow_q = calculate_manning_flow(level_cm)<br />
                {'        '}<span className="text-purple-400">return</span> &#123;<span className="text-emerald-300">"level"</span>: level_cm, <span className="text-emerald-300">"flow"</span>: flow_q&#125;
              </code>
            </pre>
          </div>

          {/* Right: Live AI Inference Stream Output matching reel */}
          <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 font-mono text-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span>AI Inference Stream (Live)</span>
              </span>
              <span className="text-[10px] text-emerald-400">Sub-20ms Latency</span>
            </div>

            <div className="h-32 overflow-y-auto space-y-1 text-[10px] text-slate-300 pr-1 scrollbar-thin">
              {logs.map((lg, i) => (
                <div
                  key={i}
                  className={`truncate ${
                    lg.includes('[WARN]')
                      ? 'text-red-400 font-bold'
                      : lg.includes('[INFO]')
                      ? 'text-cyan-300'
                      : 'text-slate-400'
                  }`}
                >
                  {lg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
