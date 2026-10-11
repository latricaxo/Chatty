/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Lock, Home } from "lucide-react";

interface HeaderProps {
  onBrandClick?: () => void;
  onHomeClick?: () => void;
}

export default function Header({ onBrandClick, onHomeClick }: HeaderProps) {
  return (
    <header className="w-full py-4 border-b border-slate-900 bg-slate-950/20 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onBrandClick}
          id="header-brand-btn"
          className="flex items-center space-x-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl cursor-pointer hover:opacity-95 transition-all duration-200 active:scale-98"
          aria-label="Go to landing page"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 shadow-md shadow-indigo-500/5">
            <Lock className="w-4.5 h-4.5 text-indigo-400" />
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/80 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-bold text-base tracking-tight text-slate-100">
                Chatty
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-sans tracking-wide hidden sm:block">
              Zero-knowledge server • Volatile in-memory sessions
            </p>
          </div>
        </button>

        {/* Home Button in Header */}
        {onHomeClick && (
          <button
            onClick={onHomeClick}
            id="header-home-btn"
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span>Home</span>
          </button>
        )}
      </div>
    </header>
  );
}
