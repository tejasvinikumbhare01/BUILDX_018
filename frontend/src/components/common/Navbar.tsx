import React from 'react';
import { Shield, Radio, AlertTriangle, LifeBuoy, MapPin, UserCheck, LogOut, Bot, Navigation, BarChart3, Lock, Video, Sparkles, Award, Layers } from 'lucide-react';
import { User, UserRole } from '../../types';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userLat: number | null;
  userLng: number | null;
  userAddress?: string | null;
  isTracking: boolean;
  onOpenReportModal: () => void;
  onOpenRescueModal: () => void;
  onOpenAIModal: () => void;
  onOpenLoginModal: () => void;
  onOpenFloodModal?: () => void;
  onLogout: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  userLat,
  userLng,
  userAddress,
  isTracking,
  onOpenReportModal,
  onOpenRescueModal,
  onOpenAIModal,
  onOpenLoginModal,
  onOpenFloodModal,
  onLogout,
  onSwitchRole,
}) => {
  return (
    <header className="sticky top-0 z-[500] w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('map')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 p-0.5 shadow-md shadow-red-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900">ResQGrid</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-red-100 text-red-700 border border-red-300 tracking-widest uppercase">
                AI
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500">Nagpur Urban Disaster Defense</p>
          </div>
        </div>

        {/* Live Location & Physical Address Pill */}
        <div className="hidden md:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs max-w-sm lg:max-w-md shadow-sm">
          <div className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
            {isTracking ? (
              <>
                <span className="absolute w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
              </>
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            )}
          </div>
          <div className="flex items-center space-x-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            {userAddress ? (
              <span className="text-slate-800 font-semibold truncate flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline" />
                <span className="truncate">{userAddress}</span>
              </span>
            ) : userLat !== null && userLng !== null ? (
              <span className="font-mono text-emerald-700 font-bold">
                {userLat.toFixed(4)}, {userLng.toFixed(4)} (Nagpur GPS)
              </span>
            ) : (
              <span className="text-amber-700 font-medium">Nagpur Center (Standby)</span>
            )}
          </div>
        </div>

        {/* Clean, Simple 3-Tab Navigation */}
        <nav className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Disaster Map</span>
          </button>
          <button
            onClick={() => setActiveTab('flood')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeTab === 'flood'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>AI Flood Watch</span>
          </button>
          <button
            onClick={() => setActiveTab('twists')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeTab === 'twists'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Relief &amp; Evacuation</span>
          </button>
        </nav>

        {/* Action Buttons & Auth */}
        <div className="flex items-center space-x-2">
          {/* Quick SOS Trigger */}
          <button
            onClick={onOpenRescueModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-500/20 transition active:scale-95 animate-pulse"
          >
            <LifeBuoy className="w-4 h-4" />
            <span className="tracking-wider">SOS RESCUE</span>
          </button>

          {/* Report Incident Trigger */}
          <button
            onClick={onOpenReportModal}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            <span>Report</span>
          </button>

          {/* ResQ AI Assistant Trigger */}
          <button
            onClick={onOpenAIModal}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-500/30 transition"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">ResQ AI</span>
          </button>

          {/* User Role / Auth */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <span className="hidden sm:inline text-[11px] font-bold text-slate-700 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {user.role}
              </span>

              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-red-600 rounded-xl hover:bg-slate-100 transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-md"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
