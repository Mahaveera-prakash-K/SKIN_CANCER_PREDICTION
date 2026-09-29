import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Users,
  Cpu,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Activity,
  AlertTriangle,
  RefreshCw,
  Database
} from 'lucide-react';
import { User, ModelVersion, SystemHealth, UserRole } from '../types';
import { api } from '../services/api';

interface Props {
  models: ModelVersion[];
  activeModel: ModelVersion | null;
  onModelActivated?: (updated: ModelVersion) => void;
  systemHealth: SystemHealth | null;
  onRefreshHealth: () => void;
}

export const AdminPage: React.FC<Props> = ({
  models,
  activeModel,
  onModelActivated,
  systemHealth,
  onRefreshHealth,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user: User) => {
    setUpdatingUser(user.id);
    try {
      await api.updateUserRoleOrStatus(user.id, { is_active: !user.is_active });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    setUpdatingUser(userId);
    try {
      await api.updateUserRoleOrStatus(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleActivateModel = async (modelId: string) => {
    try {
      const res = await api.activateModel(modelId);
      if (onModelActivated) {
        onModelActivated(res.active_model);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to switch model.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
              Root Administration
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
              Authorized Access Only
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            System Administration & Registry
          </h1>
        </div>

        <button
          onClick={onRefreshHealth}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* System Health Overview */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Runtime Cluster Health Diagnostics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">DATABASE CONNECTION</span>
            <span className="text-emerald-400 font-bold capitalize">
              {systemHealth?.database || 'Connected (SQLite/PostgreSQL)'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">ACTIVE TENSORFLOW MODEL</span>
            <span className="text-cyan-400 font-bold truncate block">
              {activeModel?.model_name || 'EfficientNetV2-B0'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">GRAD-CAM SUBSYSTEM</span>
            <span className="text-purple-400 font-bold">Operational (Jet/Alpha)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-neutral-500 text-[10px] block">REGISTERED USERS</span>
            <span className="text-white font-bold">{users.length} Accounts</span>
          </div>
        </div>
      </div>

      {/* Model Registry Switcher */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Inference Model Version Deployment</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Switch the currently active model served on /api/predictions/predict.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {models.map((m) => {
            const isActive = activeModel?.model_id === m.model_id;
            return (
              <div
                key={m.model_id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                  isActive
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{m.model_name}</span>
                    {isActive ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-500">v{m.version}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                    {m.architecture}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400 font-bold">
                    {(m.metrics.test_accuracy * 100).toFixed(1)}% Acc
                  </span>
                  {!isActive && (
                    <button
                      onClick={() => handleActivateModel(m.model_id)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-cyan-600 text-white text-[10px] font-semibold transition"
                    >
                      Deploy Model
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Management Table */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>User Accounts & Role Permissions</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage authorization tier (Doctor, Researcher, Student, Administrator) and deactivate accounts.
          </p>
        </div>

        {loadingUsers ? (
          <div className="py-8 text-center text-xs text-neutral-400">Loading accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Analyses Run</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-800/30">
                    <td className="py-3 font-semibold text-neutral-200">
                      {u.name}
                    </td>
                    <td className="py-3 text-neutral-400 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-3">
                      <select
                        value={u.role}
                        disabled={updatingUser === u.id}
                        onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                        className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-white text-[11px] font-mono focus:outline-none focus:border-cyan-500"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="DOCTOR">DOCTOR</option>
                        <option value="RESEARCHER">RESEARCHER</option>
                        <option value="STUDENT">STUDENT</option>
                      </select>
                    </td>
                    <td className="py-3 font-mono text-cyan-400 font-bold">
                      {u.prediction_count || 0}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          u.is_active
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        disabled={updatingUser === u.id}
                        onClick={() => handleToggleActive(u)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          u.is_active
                            ? 'bg-neutral-800 hover:bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
