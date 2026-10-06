import React, { useState } from 'react';
import { X, Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';

interface Props {
  url: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<Props> = ({ url, title, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    url
  )}&margin=10`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `biolink-qr-${Date.now()}.png`;
      a.click();
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 text-rose-400">
          <QrIcon className="w-5 h-5" />
          <span className="text-xs uppercase font-bold tracking-wider">Share Bio Link</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-zinc-400 mb-5 break-all line-clamp-1">{url}</p>

        <div className="bg-white p-3 rounded-2xl shadow-inner inline-block mx-auto mb-6">
          <img
            src={qrImageUrl}
            alt="Bio Link QR Code"
            className="w-56 h-56 rounded-lg object-contain"
            crossOrigin="anonymous"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-200 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
