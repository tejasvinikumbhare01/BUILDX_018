import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@resqgrid.org');
  const [password, setPassword] = useState('ResQ@2026');
  const [name, setName] = useState('Director Sarah Vance');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [phone, setPhone] = useState('+1-800-555-0199');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.post('/auth/register', {
          email,
          password,
          name,
          role,
          phone,
        });
        localStorage.setItem('resqgrid_token', res.data.token);
        onAuthSuccess(res.data.user, res.data.token);
        onClose();
      } else {
        const res = await api.post('/auth/login', {
          email,
          password,
        });
        localStorage.setItem('resqgrid_token', res.data.token);
        onAuthSuccess(res.data.user, res.data.token);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (targetEmail: string, targetPass: string, targetRole: UserRole, targetName: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setRole(targetRole);
    setName(targetName);
    setIsRegister(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel-elevated w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              {isRegister ? 'Create ResQGrid Account' : 'Secure Platform Access'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Quick Demo Credentials Autofill */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Quick Preset Accounts (Real PostgreSQL Seeded)
          </span>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@resqgrid.org', 'ResQ@2026', 'ADMIN', 'Director Sarah Vance')}
              className="px-2 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('responder@resqgrid.org', 'ResQ@2026', 'RESPONDER', 'Capt. Marcus Reed')}
              className="px-2 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-300 text-[11px] font-semibold transition text-center"
            >
              Responder
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('citizen@resqgrid.org', 'ResQ@2026', 'CITIZEN', 'Elena Rostova')}
              className="px-2 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 text-blue-300 text-[11px] font-semibold transition text-center"
            >
              Citizen
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="block text-slate-400 font-medium mb-1">Full Name</label>
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                <User className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Officer / Citizen Name"
                  className="bg-transparent w-full text-white outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-medium mb-1">Email Address</label>
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@resqgrid.org"
                className="bg-transparent w-full text-white outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Password</label>
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent w-full text-white outline-none"
                required
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1-800-555-0100"
                    className="bg-transparent w-full text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Assigned Operational Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="CITIZEN">Citizen (Civilian User)</option>
                  <option value="RESPONDER">Responder (Rescue &amp; Medical Personnel)</option>
                  <option value="ADMIN">Admin (Command Center Staff)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isRegister ? 'Register Account' : 'Authenticate & Sign In'}</span>
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            {isRegister
              ? 'Already registered? Sign in with existing credentials'
              : 'Need a new account? Register as Citizen or Responder'}
          </button>
        </div>
      </div>
    </div>
  );
};
