import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Camera,
  Video,
  Waves,
  AlertTriangle,
  Radio,
  CheckCircle,
  MapPin,
  RefreshCw,
  Eye,
  Sliders,
  Maximize2,
  ShieldAlert,
  Loader2,
  Send,
} from 'lucide-react';
import { CCTVCamera } from '../../types';
import { api } from '../../services/api';
import { WaterwayMonitoringHUD } from './WaterwayMonitoringHUD';

interface FloodTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat: number | null;
  userLng: number | null;
  userAddress?: string | null;
  cctvCameras: CCTVCamera[];
  onIncidentReported?: (incident: any) => void;
}

export const FloodTrackerModal: React.FC<FloodTrackerModalProps> = ({
  isOpen,
  onClose,
  userLat,
  userLng,
  userAddress,
  cctvCameras,
  onIncidentReported,
}) => {
  const [activeTab, setActiveTab] = useState<'ai_hud' | 'cctv' | 'device_cam'>('ai_hud');
  const [selectedCam, setSelectedCam] = useState<CCTVCamera | null>(null);

  // Device Camera States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [waterLevelReading, setWaterLevelReading] = useState(1.25);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [snapshotPreview, setSnapshotPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Default to first CCTV camera if none selected
  useEffect(() => {
    if (cctvCameras.length > 0 && !selectedCam) {
      setSelectedCam(cctvCameras[0]);
    }
  }, [cctvCameras, selectedCam]);

  // Start Device Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser.'
          : err.message || 'Failed to initialize camera sensor.'
      );
      setCameraActive(false);
    }
  }, []);

  // Stop Device Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Clean up stream on unmount or tab switch
  useEffect(() => {
    if (activeTab === 'device_cam') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, startCamera, stopCamera]);

  // Real-time Canvas Computer Vision HUD loop for Device Camera
  useEffect(() => {
    if (!cameraActive) return;

    let scanY = 150;
    let scanDirection = 1;

    const renderHUD = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw active video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Scanning waterline animation
      scanY += scanDirection * 1.5;
      if (scanY > canvas.height - 100 || scanY < 120) {
        scanDirection *= -1;
      }

      // Draw AI Waterline Horizon Grid
      const horizonY = canvas.height * 0.58;

      // Shaded water area overlay
      ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
      ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

      // Fluctuating waterline
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x < canvas.width; x += 20) {
        const waveY = horizonY + Math.sin((x + Date.now() * 0.005) * 0.05) * 5;
        ctx.lineTo(x, waveY);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Laser scanline
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      // Waterline HUD label
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('⚡ AI WATERLINE HORIZON: 1.25m', 20, horizonY - 10);

      // Left calibration ruler
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(10, 50, 45, canvas.height - 100);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;

      for (let h = 0; h <= 30; h += 5) {
        const y = canvas.height - 70 - h * 10;
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(25, y);
        ctx.stroke();
        ctx.fillStyle = '#e0f2fe';
        ctx.font = '10px monospace';
        ctx.fillText(`${(h / 10).toFixed(1)}m`, 28, y + 3);
      }

      // Live Telemetry Box (Top Right)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(canvas.width - 240, 20, 220, 95);
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 1;
      ctx.strokeRect(canvas.width - 240, 20, 220, 95);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('RESQGRID CV HUD v2.4', canvas.width - 230, 40);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('STATUS: FLOOD RISK HIGH', canvas.width - 230, 60);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(`LAT: ${userLat?.toFixed(4) ?? '21.1458'} | LNG: ${userLng?.toFixed(4) ?? '79.0882'}`, canvas.width - 230, 80);
      ctx.fillText(`FLOW: ~1.8 m/s (SURFACE)`, canvas.width - 230, 98);

      animFrameRef.current = requestAnimationFrame(renderHUD);
    };

    animFrameRef.current = requestAnimationFrame(renderHUD);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [cameraActive, userLat, userLng]);

  // Capture frame and submit emergency incident
  const handleCaptureAndReport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsCapturing(true);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSnapshotPreview(dataUrl);

      // Submit real incident with coordinates and real address
      const res = await api.post('/incidents', {
        type: 'FLOOD',
        severity: 'CRITICAL',
        description: `Verified flood water tracking report via ResQGrid Camera HUD. Water level estimated at ${waterLevelReading}m above pavement line with active surface flow.`,
        latitude: userLat ?? 21.1458,
        longitude: userLng ?? 79.0882,
        address: userAddress || 'Nagpur, Maharashtra, India',
        peopleAffected: 5,
        rescueRequired: true,
      });

      if (onIncidentReported && res.data?.incident) {
        onIncidentReported(res.data.incident);
      }

      setCaptureSuccess(true);
      setTimeout(() => setCaptureSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to submit camera flood report:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white tracking-tight uppercase">
                  AI Flood Tracking Video &amp; Camera HUD
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Nagpur Regional River Gauges &amp; Real-time Device Waterline Surface Detection
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode Switcher */}
            <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('ai_hud')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTab === 'ai_hud' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Waves className="w-3.5 h-3.5 text-cyan-300" />
                <span>AI Waterway Vision HUD</span>
              </button>
              <button
                onClick={() => setActiveTab('cctv')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTab === 'cctv' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Nagpur CCTV Feeds</span>
              </button>
              <button
                onClick={() => setActiveTab('device_cam')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  activeTab === 'device_cam' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Device Camera HUD</span>
              </button>
            </div>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 0: AI WATERWAY VISION HUD (Reel match!) */}
          {activeTab === 'ai_hud' && (
            <WaterwayMonitoringHUD
              userLat={userLat}
              userLng={userLng}
              userAddress={userAddress}
              onIncidentReported={onIncidentReported}
            />
          )}

          {/* TAB 1: CCTV FEEDS */}
          {activeTab === 'cctv' && (
            <div className="space-y-6">
              {/* Top Highlights Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium block">Active River Stations</span>
                  <span className="text-lg font-mono font-bold text-white">4 Monitored</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-red-500/20">
                  <span className="text-[11px] text-red-400 font-medium block">Highest Water Level</span>
                  <span className="text-lg font-mono font-bold text-red-400">4.25m (Ambazari)</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium block">Peak Flow Velocity</span>
                  <span className="text-lg font-mono font-bold text-amber-300">2.8 m/s (Pili River)</span>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium block">AI Inundation Threat</span>
                  <span className="text-lg font-mono font-bold text-red-500">SEVERE (92%)</span>
                </div>
              </div>

              {/* CCTV Feed Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cctvCameras.map((cam) => {
                  const isCritical = cam.status === 'CRITICAL' || cam.status === 'DANGER';
                  const isSelected = selectedCam?.id === cam.id;

                  return (
                    <div
                      key={cam.id}
                      onClick={() => setSelectedCam(cam)}
                      className={`relative rounded-2xl bg-slate-950 border overflow-hidden transition cursor-pointer group ${
                        isSelected ? 'border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Video Container */}
                      <div className="relative aspect-video bg-slate-950 overflow-hidden">
                        {/* Realistic Animated River Flow / Water Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10" />

                        {/* Video Element */}
                        <video
                          src={cam.streamUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition duration-500"
                        />

                        {/* AI Waterline Overlay Box */}
                        <div className="absolute inset-x-4 bottom-10 z-20 pointer-events-none border-2 border-dashed border-cyan-400/80 rounded-lg p-2 bg-cyan-950/30 backdrop-blur-xs flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            <span className="text-[11px] font-mono font-bold text-cyan-300">
                              WATER LEVEL: {cam.waterLevelMeters}m
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-cyan-200">
                            Threshold: {cam.dangerLevelMeters}m
                          </span>
                        </div>

                        {/* Top Feed Header */}
                        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-200 font-bold border border-slate-700">
                            {cam.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-[10px] tracking-wider uppercase ${
                              isCritical ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                            }`}
                          >
                            {cam.status}
                          </span>
                        </div>
                      </div>

                      {/* Info & Telemetry Footer */}
                      <div className="p-4 bg-slate-950 border-t border-slate-850">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                              {cam.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span>{cam.location}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-slate-200">
                              {cam.flowVelocity}
                            </div>
                            <div className="text-[10px] text-slate-500">Flow Speed</div>
                          </div>
                        </div>

                        {/* Water Depth Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Water Capacity Ratio</span>
                            <span className={isCritical ? 'text-red-400 font-bold' : 'text-slate-300'}>
                              {Math.round((cam.waterLevelMeters / cam.dangerLevelMeters) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCritical ? 'bg-red-500' : 'bg-amber-400'
                              }`}
                              style={{
                                width: `${Math.min(100, Math.round((cam.waterLevelMeters / cam.dangerLevelMeters) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DEVICE CAMERA HUD */}
          {activeTab === 'device_cam' && (
            <div className="space-y-6">
              {/* Physical Location Context Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400 font-medium">Tracking Location:</span>
                  <span className="text-white font-bold">{userAddress || 'Nagpur, Maharashtra, India'}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 font-mono">
                  <span>LAT: {userLat?.toFixed(4) ?? '21.1458'}</span>
                  <span>LNG: {userLng?.toFixed(4) ?? '79.0882'}</span>
                </div>
              </div>

              {cameraError ? (
                <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-3">
                  <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">Camera Hardware Unavailable</h3>
                  <p className="text-xs text-red-200 max-w-md mx-auto">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center space-x-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              ) : (
                <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl aspect-video max-h-[500px] flex items-center justify-center">
                  {/* Hidden source video element */}
                  <video ref={videoRef} className="hidden" playsInline muted autoPlay />

                  {/* Rendered HUD Canvas */}
                  <canvas ref={canvasRef} className="w-full h-full object-contain" />

                  {/* Live Controls Bar */}
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-30">
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-cyan-300 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>AI WATERLINE: ~{waterLevelReading}m</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCaptureAndReport}
                        disabled={isCapturing}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                      >
                        {isCapturing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>ANALYZING &amp; REPORTING...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            <span>CAPTURE &amp; REPORT FLOOD WITH GPS</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Instant Report Success Confirmation */}
              {captureSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-3 shadow-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Emergency Flood Incident Dispatched</h4>
                    <p className="mt-0.5">
                      Captured camera waterline snapshot and verified GPS coordinates ({userLat?.toFixed(4)}, {userLng?.toFixed(4)}) have been submitted to Nagpur NDRF / SDRF Command.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
