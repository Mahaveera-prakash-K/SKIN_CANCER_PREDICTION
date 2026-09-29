import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '../types';

interface Props {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  initialMode,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('RESEARCHER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        const data = await api.register({ name, email, password, role });
        localStorage.setItem('dermascan_token', data.access_token);
        localStorage.setItem('dermascan_user', JSON.stringify(data.user));
        onSuccess(data.user, data.access_token);
      } else {
        const data = await api.login({ email, password });
        localStorage.setItem('dermascan_token', data.access_token);
        localStorage.setItem('dermascan_user', JSON.stringify(data.user));
        onSuccess(data.user, data.access_token);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoRole: 'ADMIN' | 'DOCTOR' | 'RESEARCHER' | 'STUDENT') => {
    setMode('login');
    setError(null);
    if (demoRole === 'ADMIN') {
      setEmail('admin@dermascan.ai');
      setPassword('DermaScan2026!');
    } else if (demoRole === 'DOCTOR') {
      setEmail('doctor@dermascan.ai');
      setPassword('DoctorPass2026!');
    } else if (demoRole === 'RESEARCHER') {
      setEmail('researcher@dermascan.ai');
      setPassword('ResearchPass2026!');
    } else {
      setEmail('student@dermascan.ai');
      setPassword('StudentPass2026!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure Role-Based Authentication</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Sign In to DermaScan AI' : 'Create Researcher Account'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Access image classification pipelines, Grad-CAM maps, and evaluation benchmarks.
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="mb-4 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
          <span className="text-[11px] font-semibold text-neutral-400 block mb-2">
            Quick Auto-Fill Demo Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('DOCTOR')}
              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition text-left"
            >
              Dr. Sarah Chen (Doctor)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('RESEARCHER')}
              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition text-left"
            >
              Dr. Alex Rivera (Researcher)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('ADMIN')}
              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition text-left"
            >
              Dr. Eleanor Vance (Admin)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('STUDENT')}
              className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition text-left"
            >
              Maya Lin (Student)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.org"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Academic Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="RESEARCHER">Researcher (Full benchmarking & Grad-CAM)</option>
                <option value="DOCTOR">Doctor / Clinician (Clinical review)</option>
                <option value="STUDENT">Student (Educational insights)</option>
                <option value="ADMIN">Administrator (Model & user controls)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-neutral-800/80 text-center">
          {mode === 'login' ? (
            <p className="text-xs text-neutral-400">
              Need an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Register here
              </button>
            </p>
          ) : (
            <p className="text-xs text-neutral-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
