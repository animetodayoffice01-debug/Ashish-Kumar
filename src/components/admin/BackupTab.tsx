import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Download, Upload, RefreshCw, Trash2, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface Props {
  onRefreshData: () => Promise<void>;
}

export const BackupTab: React.FC<Props> = ({ onRefreshData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetType, setResetType] = useState<'appearance' | 'remove-demo' | 'all' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const backup = await api.exportBackup();
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `biolink-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setStatusMessage('Backup file downloaded successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert('Backup failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (!window.confirm('Restore this backup file? Existing data will be overwritten.')) return;

        setIsRestoring(true);
        await api.restoreBackup(json);
        await onRefreshData();
        setStatusMessage('Backup restored successfully!');
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (err: any) {
        alert('Restore failed: ' + err.message);
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteReset = async () => {
    if (!resetType) return;
    try {
      await api.resetData(resetType, confirmPassword);
      await onRefreshData();
      setStatusMessage(`Completed ${resetType} reset!`);
      setResetType(null);
      setConfirmPassword('');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert('Reset failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>Backup, Restore & Reset</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Save complete snapshots of your configuration, links, categories, and restore at any time.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Create Backup */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Create & Download Backup</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Downloads a JSON archive containing all profile data, links, categories, appearance presets, and settings.
          </p>
          <button
            onClick={handleDownloadBackup}
            disabled={isExporting}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Download Full Backup'}</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Restore from Backup</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Upload a previously exported JSON backup file to instantly restore your entire website state.
          </p>
          <label className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 transition flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-violet-400" />
            <span>Select Backup File to Restore</span>
            <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Reset Operations Section */}
      <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Reset Operations</span>
        </h3>
        <p className="text-xs text-zinc-400">
          Revert settings, clean sample links, or restore system to initial setup.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Reset Appearance */}
          <button
            onClick={() => setResetType('appearance')}
            className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-left transition space-y-1"
          >
            <h4 className="text-xs font-bold text-white">Reset Appearance</h4>
            <p className="text-[11px] text-zinc-400">
              Revert theme, colors, and layout to creator defaults.
            </p>
          </button>

          {/* Remove Demo Data */}
          <button
            onClick={() => setResetType('remove-demo')}
            className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-left transition space-y-1"
          >
            <h4 className="text-xs font-bold text-amber-400">Remove Demo Data</h4>
            <p className="text-[11px] text-zinc-400">
              Clear preloaded sample links so you start completely clean.
            </p>
          </button>

          {/* Reset All Data */}
          <button
            onClick={() => setResetType('all')}
            className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-rose-500/50 text-left transition space-y-1"
          >
            <h4 className="text-xs font-bold text-rose-400">Reset All Data</h4>
            <p className="text-[11px] text-zinc-400">
              Complete factory reset to initial blank state.
            </p>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {resetType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Confirm {resetType}
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to proceed with <strong>{resetType}</strong>? This action will modify your database.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setResetType(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
