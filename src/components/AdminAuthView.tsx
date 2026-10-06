import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Lock, KeyRound, ArrowLeft, ShieldAlert, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface Props {
  onSuccess: (token: string, expiresAt: number) => void;
  onCancel: () => void;
}

export const AdminAuthView: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState<boolean>(true);
  const [isDefaultPassword, setIsDefaultPassword] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Check auth status on mount
  useEffect(() => {
    let timer: any = null;
    api
      .getAuthStatus()
      .then((status) => {
        setHasPassword(status.hasPassword);
        setIsDefaultPassword(status.isDefaultPassword);
        setIsLocked(status.isLocked);
        if (status.isLocked && status.lockRemainingSeconds > 0) {
          setLockCountdown(status.lockRemainingSeconds);
        }
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // Lock countdown timer
  useEffect(() => {
    if (lockCountdown <= 0) {
      if (isLocked) setIsLocked(false);
      return;
    }
    const interval = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockCountdown, isLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLocked) {
      setError(`Locked due to failed attempts. Please wait ${lockCountdown} seconds.`);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    // First-run setup flow
    if (!hasPassword) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.setupPassword(password);
        onSuccess(res.token, res.expiresAt);
      } catch (err: any) {
        setError(err.message || 'Setup failed');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Standard Login flow
    setIsLoading(true);
    try {
      const res = await api.login(password);
      onSuccess(res.token, res.expiresAt);
    } catch (err: any) {
      setError(err.message || 'Incorrect password.');
      // Check if locked
      api.getAuthStatus().then((s) => {
        if (s.isLocked) {
          setIsLocked(true);
          setLockCountdown(s.lockRemainingSeconds);
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 py-8 relative selection:bg-rose-500 selection:text-white">
      {/* Return to Public button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bio Link</span>
        </button>
      </div>

      <div className="w-full max-w-sm rounded-3xl bg-zinc-900/90 border border-zinc-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-violet-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
            <Lock className="w-7 h-7" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center text-white mb-1">
          {!hasPassword ? 'Admin Setup' : 'Admin Security Access'}
        </h2>
        <p className="text-xs text-zinc-400 text-center mb-6 leading-relaxed">
          {!hasPassword
            ? 'Set a master password to protect and manage your Instagram bio hub.'
            : isDefaultPassword
            ? 'Default admin password is set to "admin123". You can change this anytime.'
            : 'Enter your master admin password to unlock management features.'}
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        {isLocked && (
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <p>Temporary lockout active: wait <strong>{lockCountdown}s</strong>.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {!hasPassword ? 'Create Master Password' : 'Password'}
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={isLocked || isLoading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!hasPassword && (
              <p className="text-[11px] text-zinc-500 mt-1">Must be at least 6 characters.</p>
            )}
          </div>

          {!hasPassword && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Confirm Master Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked || isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : !hasPassword ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Initialize Admin</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Unlock Admin Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
          <button
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white transition"
          >
            Return to Public Profile
          </button>
        </div>
      </div>
    </div>
  );
};
