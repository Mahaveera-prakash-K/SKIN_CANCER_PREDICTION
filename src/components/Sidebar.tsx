import React from 'react';
import {
  LayoutDashboard,
  Scan,
  History,
  BarChart3,
  GitCompare,
  Eye,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  HelpCircle,
  Home
} from 'lucide-react';
import { UserRole } from '../types';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole?: UserRole;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  userRole,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'landing', label: 'Home & Overview', icon: Home },
    { id: 'dashboard', label: 'Research Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Skin Lesion', icon: Scan },
    { id: 'history', label: 'Prediction History', icon: History },
    { id: 'metrics', label: 'Model Metrics', icon: BarChart3 },
    { id: 'comparison', label: 'Model Comparison', icon: GitCompare },
    { id: 'explainability', label: 'Grad-CAM Explainability', icon: Eye },
    { id: 'profile', label: 'Researcher Profile', icon: UserIcon },
  ];

  if (userRole === 'ADMIN') {
    navItems.push({ id: 'admin', label: 'Admin & System Health', icon: ShieldAlert });
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-14 bottom-0 left-0 z-30 w-64 border-r border-neutral-800/80 bg-neutral-950/95 flex flex-col justify-between py-4 px-3 transform transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="px-3">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-400">
              Navigation
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-cyan-400' : 'text-neutral-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Session Box */}
        <div className="space-y-3 pt-4 border-t border-neutral-800/80">
          <div className="px-3 py-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="font-semibold text-neutral-200">HAM10000 Dataset</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                7 Classes
              </span>
            </div>
            <p className="text-[10px] leading-tight text-neutral-400">
              Zero-leakage patient-stratified evaluation partition.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
