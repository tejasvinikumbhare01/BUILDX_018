import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
  onNavigateToSignUp?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleQuickFill = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = response.data;
      if (rememberMe) {
        localStorage.setItem('resqgrid_token', token);
        localStorage.setItem('resqgrid_user', JSON.stringify(user));
      }

      setSuccessMsg('Authentication verified. Welcome back!');
      setTimeout(() => {
        onLoginSuccess(user, token);
      }, 400);
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.error || err.message;
      if (serverMsg?.includes('Invalid email or password')) {
        setError('Incorrect email or password. Please try again or use a demo account.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to reach server. Please ensure the backend is running on port 5000.');
      } else {
        setError(serverMsg || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 mb-3 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Nagpur Emergency Operations &amp; Live Tracking</span>
        </div>

        <div className="flex items-center justify-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/25">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-1.5">
              <span>ResQGrid</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-500/30">
                AI
              </span>
            </h1>
            <p className="text-xs text-slate-400">Intelligent Disaster Management Platform</p>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Portal Sign In</h2>
            <p className="text-xs text-slate-400">Authenticate to access live telemetry</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Demo Accounts Quick-Fill */}
        <div className="mb-5 pb-4 border-b border-slate-800">
          <div className="text-[11px] text-slate-400 mb-2">Demo Accounts (1-click fill):</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('citizen@resqgrid.org', 'ResQ@2026')}
              className={`px-2 py-1.5 rounded-lg border text-xs font-medium text-center transition ${
                email === 'citizen@resqgrid.org'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              👤 Citizen
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('responder@resqgrid.org', 'ResQ@2026')}
              className={`px-2 py-1.5 rounded-lg border text-xs font-medium text-center transition ${
                email === 'responder@resqgrid.org'
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              🛡️ Responder
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@resqgrid.org', 'ResQ@2026')}
              className={`px-2 py-1.5 rounded-lg border text-xs font-medium text-center transition ${
                email === 'admin@resqgrid.org'
                  ? 'bg-red-600/20 border-red-500 text-red-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              ⚡ Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <span className="text-[11px] text-slate-400">Demo: ResQ@2026</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-red-600 focus:ring-red-500"
              />
              <span>Remember session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/25 transition flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to ResQGrid</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        {onNavigateToSignUp && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="text-red-400 hover:text-red-300 font-semibold underline ml-1"
            >
              Create Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
