import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  Calendar,
  Layers,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface Props {
  user: User;
  onUpdateUser: (updated: User) => void;
}

export const ProfilePage: React.FC<Props> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!name.trim()) return;

    setUpdatingProfile(true);
    try {
      const updated = await api.updateProfile(name);
      onUpdateUser(updated);
      setProfileMsg({ type: 'success', text: 'Researcher profile name updated.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword.length < 8) {
      setPassMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setChangingPass(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPassMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Title */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
          Account Administration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Researcher Profile
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Manage your researcher credentials and review role authorization permissions.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <div className="text-xs text-neutral-400">{user.email}</div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {user.role} ROLE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono border-t sm:border-t-0 sm:border-l border-neutral-800 pt-4 sm:pt-0 sm:pl-6">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] text-neutral-500 block">TOTAL ANALYSES</span>
            <span className="text-base font-bold text-cyan-400">
              {user.prediction_count || 0}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[10px] text-neutral-500 block">MEMBER SINCE</span>
            <span className="text-neutral-200">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Update Info Form */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-cyan-400" />
          <span>Update Account Details</span>
        </h3>

        {profileMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}
          >
            {profileMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Full Legal / Academic Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Email Address (Fixed)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-950/50 border border-neutral-800 text-neutral-500 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={updatingProfile}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-50"
          >
            {updatingProfile ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-400" />
          <span>Security & Password Update</span>
        </h3>

        {passMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              passMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}
          >
            {passMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{passMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              New Password (Min. 8 characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition disabled:opacity-50"
          >
            {changingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
