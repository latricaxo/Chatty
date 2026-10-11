/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, Key, EyeOff, Trash2, Server } from "lucide-react";

export default function SecurityGuide() {
  const points = [
    {
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      title: "End-to-End Encryption (E2EE)",
      description: "Messages are encrypted in your browser using AES-GCM (256-bit keys) before being sent. No plaintext ever leaves your device.",
    },
    {
      icon: <Key className="w-5 h-5 text-indigo-400" />,
      title: "Zero-Knowledge Server",
      description: "Room passwords are never transmitted. The server cannot read your messages because it never receives your decryption key.",
    },
    {
      icon: <Server className="w-5 h-5 text-blue-400" />,
      title: "In-Memory Volatile RAM",
      description: "No databases are used. All room configurations, access markers, and encrypted payloads are held strictly in temporary RAM.",
    },
    {
      icon: <Trash2 className="w-5 h-5 text-rose-400" />,
      title: "24h Auto-Erasure",
      description: "All messages are programmatically pruned after 24 hours.",
    },
  ];

  return (
    <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-slate-950/20">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-2.5 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
          <EyeOff className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-slate-100 tracking-tight">Zero-Knowledge Protocol</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">How Chatty protects and hides your conversations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {points.map((point, index) => (
          <div
            key={index}
            className="flex flex-col space-y-3.5 p-5 bg-slate-950/40 rounded-2xl border border-slate-900/80 hover:border-slate-800/80 transition-all shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/40">
                {point.icon}
              </div>
              <h4 className="font-display font-bold text-sm text-slate-200 tracking-tight">{point.title}</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {point.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
