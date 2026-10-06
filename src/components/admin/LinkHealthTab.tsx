import React, { useState } from 'react';
import { api } from '../../lib/api';
import { ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, Link as LinkIcon } from 'lucide-react';

interface HealthReport {
  totalChecked: number;
  issuesFound: number;
  issues: {
    id?: string;
    title?: string;
    url?: string;
    type: string;
    message: string;
  }[];
}

export const LinkHealthTab: React.FC = () => {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await api.checkLinkHealth();
      setReport(res);
    } catch (err: any) {
      alert('Health scan failed: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Link Health & Integrity Scanner</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Audit your bio links for broken syntax, protocol errors, and duplicate URLs.
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Run Health Check'}</span>
        </button>
      </div>

      {!report && !isScanning && (
        <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Scanner Ready</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Click &quot;Run Health Check&quot; to inspect all URLs, sanitize protocols, and check for duplicate destinations without impacting live visitors.
          </p>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Links Inspected</p>
                <p className="text-2xl font-black text-white">{report.totalChecked}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Issues Flagged</p>
                <p
                  className={`text-2xl font-black ${
                    report.issuesFound === 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {report.issuesFound}
                </p>
              </div>
              {report.issuesFound === 0 ? (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              )}
            </div>
          </div>

          {report.issuesFound === 0 ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>All links are healthy! Valid protocols, titles, and unique URLs verified.</span>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Issues Requiring Attention ({report.issues.length})
              </h3>
              <div className="space-y-2">
                {report.issues.map((iss, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-3 text-xs"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-zinc-200">{iss.message}</p>
                      {iss.url && (
                        <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{iss.url}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
