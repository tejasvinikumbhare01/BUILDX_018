import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Waves,
  LifeBuoy,
  Building2,
  Flame,
  Users,
  Plane,
  WifiOff,
  Cpu,
  Layers,
  FileCheck2,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface JudgesTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const JudgesTourModal: React.FC<JudgesTourModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      step: '01',
      title: 'AI Flood Risk & Waterway CV Monitoring',
      tabKey: 'flood',
      problem: 'September cloudburst in Nagpur causes Nag River to rise suddenly before low-lying colonies are warned.',
      solution: 'Real-time computer vision gauge detection bounding box tracks millimeter water rise at Ambazari Dam and Nag River culverts 38 minutes before manual municipal alarms.',
      techStack: 'FastAPI + OpenCV Gauge Ruler + Python Inference Pipeline + YOLOv8',
      keyMetrics: '38-min early warning • 91.7% detection confidence',
      badge: 'Live CV HUD',
    },
    {
      step: '02',
      title: 'Nagpur Emergency Scenario Response Hub',
      tabKey: 'nagpur',
      problem: 'Underpasses flood with no central registry, helplines get jammed, and a family gets stuck in 5.5ft water at Narendra Nagar.',
      solution: 'Automated road blockage registry flags Narendra Nagar underpass as BLOCKED in GIS routing and dispatches SDRF Swift Water Team 01 with live GPS tracking.',
      techStack: 'PostgreSQL Spatial GIS + Socket.IO Telemetry + Leaflet',
      keyMetrics: '4-min SDRF boat dispatch • Zero helpline jamming via web SOS',
      badge: 'Scenario Hub',
    },
    {
      step: '03',
      title: 'Smart Shelter Capacity Load Balancing',
      tabKey: 'shelters',
      problem: 'Residents do not know shelter occupancy; Somany High School is at 106% capacity while nearby Dharampeth Hall sits empty.',
      solution: 'Real-time algorithm flags Somany High School as overloaded (Red) and automatically redirects evacuees to Dharampeth Community Hall (565 free beds).',
      techStack: 'Prisma ORM + Dynamic Load Balancer + Turn-by-Turn Routing',
      keyMetrics: '100% capacity balance • 565 vacant beds utilized',
      badge: 'Shelter Balancer',
    },
    {
      step: '04',
      title: 'Itwari Market Fire & GIS Hydrant Navigator',
      tabKey: 'map',
      problem: 'Fire tenders lose crucial minutes finding working hydrants and navigating narrow, congested market alleyways.',
      solution: 'Live GIS mapping locates 8 operational fire hydrants with water pressure ratings and calculates detours around blocked market lanes.',
      techStack: 'OpenStreetMap GIS + Hydrant Sensor Telemetry',
      keyMetrics: '120m to closest 3.9-bar hydrant • Zero bottleneck delays',
      badge: 'Hydrant GIS',
    },
    {
      step: '05',
      title: 'Next-Gen Innovations: Drones & LoRa Mesh',
      tabKey: 'innovation',
      problem: 'Cellular networks collapse during disasters; ground teams cannot spot rooftop survivors across flooded sectors.',
      solution: 'Autonomous AI Drones (Thermal IR + Inundation LIDAR) spot trapped survivors; P2P LoRa mesh beacons relay offline SOS packets with zero internet.',
      techStack: 'Aerial YOLOv8 + Sub-GHz LoRa Mesh Protocol + Hydraulic Twin',
      keyMetrics: '100% offline SOS capability • 3 airborne thermal drones',
      badge: 'Innovations',
    },
    {
      step: '06',
      title: 'Inter-Agency Common Operational Picture',
      tabKey: 'coordination',
      problem: 'SDRF, Fire Brigade, Police, and NMC work in silos, sending duplicate boats to cleared colonies while others wait 4 hours.',
      solution: 'Unified Command Grid displays verified sector clearance logs and auto-assigns exclusive zone ownership across all response agencies.',
      techStack: 'Socket.IO Room Multicasting + Role-Based Access Control',
      keyMetrics: '0 duplicate deployments • 100% inter-agency sync',
      badge: 'Agency Ops',
    },
  ];

  const current = tourSteps[activeStep];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black uppercase tracking-wider text-amber-400">
                  Judges&#39; Live Evaluation &amp; Demo Guide
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-200">
                  ResQGrid AI
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                How ResQGrid AI Solves Every Nagpur Track Requirement
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-100 text-xs">
          {tourSteps.map((step, idx) => (
            <button
              key={step.step}
              onClick={() => setActiveStep(idx)}
              className={`py-3 px-2 text-center font-bold transition border-b-2 flex flex-col items-center justify-center gap-1 ${
                activeStep === idx
                  ? 'border-amber-500 bg-white text-slate-900 shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span className="text-[10px] font-mono">Step {step.step}</span>
              <span className="hidden sm:inline text-[11px] truncate max-w-[110px]">{step.badge}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                Evaluation Step {current.step} of 06
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">{current.title}</h3>
            </div>
            <button
              onClick={() => {
                onSelectTab(current.tabKey);
                onClose();
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition flex items-center space-x-1.5 shrink-0"
            >
              <span>Jump to Live Feature</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Problem vs Solution Comparison Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-red-700 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>Nagpur Hackathon Problem Statement</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{current.problem}</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>ResQGrid AI Engineered Solution</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{current.solution}</p>
            </div>
          </div>

          {/* Tech Architecture & Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Underlying Technology Stack
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-1">{current.techStack}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Quantifiable Resilience Impact
              </span>
              <p className="text-xs font-bold text-emerald-700 mt-1">{current.keyMetrics}</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200"
          >
            Previous Step
          </button>

          <span className="text-xs font-mono text-slate-500">
            {activeStep + 1} / {tourSteps.length}
          </span>

          {activeStep < tourSteps.length - 1 ? (
            <button
              onClick={() => setActiveStep((prev) => Math.min(tourSteps.length - 1, prev + 1))}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center space-x-1"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onSelectTab('flood');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center space-x-1"
            >
              <span>Start Interactive Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
