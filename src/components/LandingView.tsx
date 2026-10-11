/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, ArrowRight, MessageSquare, Lock, HelpCircle } from "lucide-react";
import SecurityGuide from "./SecurityGuide";

interface LandingViewProps {
  onEnter: () => void;
}

export default function LandingView({ onEnter }: LandingViewProps) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 pt-2 pb-8 md:pt-4 md:pb-12 -mt-6 sm:-mt-10 md:-mt-14">
        {/* Decorative ambient glowing backdrops */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none select-none" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none select-none" />

        {/* Viral Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-mono font-medium text-indigo-300 tracking-wide mb-6 shadow-inner select-none"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Pure-RAM Cryptographic Chat</span>
        </motion.div>

        {/* Catchy Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-100 to-slate-400 tracking-tight leading-[1.1] max-w-3xl mx-auto"
        >
          Absolute Privacy.<br className="hidden sm:inline" /> Zero Traces Left Behind.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-slate-400 font-sans max-w-2xl mx-auto leading-relaxed"
        >
          Send secure, ephemeral messages directly in-memory. Every character is encrypted 
          client-side before hitting the server. No databases, no tracking, and zero permanent logs.
        </motion.p>

        {/* Large, Glowing ENTER Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-6 flex justify-center"
        >
          <button
            onClick={onEnter}
            id="enter-chatrooms-btn"
            className="group relative inline-flex items-center space-x-2.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-display font-black text-base px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-900/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-indigo-500/20 active:scale-[0.98] cursor-pointer border border-indigo-500/20"
          >
            {/* Ambient button glow effect */}
            <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-md group-hover:opacity-40 transition duration-300" />
            
            <MessageSquare className="w-4 h-4 text-indigo-200" />
            <span className="relative tracking-wider">ENTER</span>
            <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </motion.div>

        {/* Subtle security notification */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-[11px] text-slate-500 font-mono tracking-wide"
        >
          PREVENT TELEMETRY • END-TO-END AES-256-GCM
        </motion.div>
      </div>

      {/* Zero-Knowledge Protocol Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-4"
      >
        <div className="text-center md:text-left md:px-2">
          <h2 className="text-sm font-mono uppercase tracking-widest text-indigo-400 font-bold">
            Guaranteed Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Built from the ground up for untraceable and tamper-proof security
          </p>
        </div>
        <SecurityGuide />
      </motion.div>
    </div>
  );
}
