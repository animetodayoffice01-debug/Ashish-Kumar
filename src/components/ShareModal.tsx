import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Send, Twitter, Linkedin, Mail, Share2 } from 'lucide-react';

interface Props {
  url: string;
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<Props> = ({ url, title, description, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      color: 'bg-emerald-600',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${url}`)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-zinc-800',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-600',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-rose-600',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-rose-400">
          <Share2 className="w-5 h-5" />
          <span className="text-xs uppercase font-bold tracking-wider">Share Profile</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Share this Bio Link</h3>
        <p className="text-xs text-zinc-400 mb-6">Send this page to your audience or friends across any platform.</p>

        {/* Quick Social Buttons */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {shareOptions.map((opt) => (
            <a
              key={opt.name}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className={`w-11 h-11 rounded-2xl ${opt.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                <opt.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">{opt.name}</span>
            </a>
          ))}
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-zinc-300 outline-none select-all font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
