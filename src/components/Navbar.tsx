import React from 'react';
import { Activity, Shield, Sparkles, User as UserIcon, LogOut, Cpu } from 'lucide-react';
import { User, ModelVersion, SystemHealth } from '../types';

interface Props {
  user: User | null;
  activeModel: ModelVersion | null;
  systemHealth: SystemHealth | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({
  user,
  activeModel,
  systemHealth,
  onOpenAuth,
  onLogout,
  currentTab,
  onSelectTab,
}) => {
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'DOCTOR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'RESEARCHER':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'STUDENT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('landing')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold tracking-wider">
            <Activity className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-mono">DERMASCAN</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium hidden sm:block">
              Skin Lesion Classification & Explainability
            </p>
          </div>
        </div>

        {/* Center: Active Model & Health Status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-neutral-400">Model:</span>
            <span className="font-semibold text-neutral-200">
              {activeModel ? `${activeModel.model_name} (${activeModel.version})` : 'EfficientNetV2-B0'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                systemHealth?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-neutral-400">System:</span>
            <span className="font-medium text-neutral-200 capitalize">
              {systemHealth?.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Right: User Profile / Auth CTA */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectTab('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 transition text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-neutral-200">{user.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-neutral-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
