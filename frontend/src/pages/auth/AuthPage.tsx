import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';

interface AuthPageProps {
  onAuthSuccess: (user: any, token: string) => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative selection:bg-red-500 selection:text-white">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Switcher Tab Pill */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-slate-800 mb-4 max-w-xs mx-auto backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-red-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-red-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {mode === 'login' ? (
          <LoginPage
            onLoginSuccess={onAuthSuccess}
            onNavigateToSignUp={() => setMode('signup')}
          />
        ) : (
          <SignUpPage
            onSignUpSuccess={onAuthSuccess}
            onNavigateToLogin={() => setMode('login')}
          />
        )}

        <div className="text-center text-[11px] text-slate-500 mt-6">
          <p>ResQGrid AI &bull; Nagpur Civil Defense &amp; Disaster Resilience</p>
        </div>
      </div>
    </div>
  );
};
