/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Info, Sparkles, Shield, Clock, Users, Zap, Compass, Heart } from "lucide-react";

interface AboutViewProps {
  onGoHome?: () => void;
}

export default function AboutView({ onGoHome }: AboutViewProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8 font-sans text-slate-200">
      {/* Top Header Title for About Page */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-50 tracking-tight">
              About Chatty
            </h1>
            <p className="text-xs sm:text-sm font-medium text-indigo-400 mt-0.5">
              Private conversations. Real connections.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Statement */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 leading-relaxed text-slate-300 text-sm sm:text-base shadow-sm">
        <p className="text-base sm:text-lg text-slate-200 font-medium">
          The way we communicate online has changed—but privacy shouldn&apos;t become the price we pay for connection.
        </p>
        <p>
          Chatty was built around a simple idea: conversations should belong to the people having them.
        </p>
        <p className="text-indigo-300 font-medium bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-4">
          A private, secure, and lightweight communication experience where messages disappear, identities stay protected, and people can connect without leaving behind a permanent digital footprint.
        </p>
      </div>

      {/* Main Sections */}
      <div className="space-y-8 divide-y divide-slate-800/60 text-sm sm:text-base text-slate-300 leading-relaxed">
        
        {/* Section 1 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span>Privacy by design.</span>
          </h2>
          <p>
            Chatty is built with security at its foundation.
          </p>
          <p>
            Messages and attachments are encrypted directly in your browser before they leave your device using modern encryption technology. Conversations are protected with encrypted rooms, optional passphrases, and privacy-focused design choices that put users in control.
          </p>
          <p className="font-semibold text-slate-100 pt-1 text-base">
            Your conversations are yours.
          </p>
        </div>

        {/* Section 2 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Built for the moments that matter.</span>
          </h2>
          <p>
            Not every conversation needs to exist forever.
          </p>
          <p>
            Chatty uses ephemeral messaging designed for temporary communication. Rooms, messages, and shared media automatically expire, helping reduce unnecessary data storage and giving conversations a natural endpoint.
          </p>
          <p className="font-mono text-xs sm:text-sm text-indigo-400 font-medium pt-1">
            Connect. Share. Collaborate. Move on.
          </p>
        </div>

        {/* Section 3 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>More than messaging.</span>
          </h2>
          <p>
            Chatty transforms conversations into shared experiences.
          </p>
          <p className="text-xs sm:text-sm text-slate-400">Inside encrypted rooms, users can:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Play multiplayer games together.</li>
            <li>Collaborate on shared whiteboards.</li>
            <li>Exchange encrypted files and media.</li>
            <li>Share ideas, sketches, and moments in real time.</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-2 italic">
            Communication shouldn&apos;t just be about sending messages—it should be about doing things together.
          </p>
        </div>

        {/* Section 4 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span>Designed for privacy and simplicity.</span>
          </h2>
          <p>
            Chatty removes the friction from secure communication.
          </p>
          <p>
            With anonymous aliases, instant room creation, simple invitations, and a clean interface, users can start private conversations quickly without complicated setup.
          </p>
          <p className="font-semibold text-indigo-300 pt-1">
            Security should feel effortless.
          </p>
        </div>

        {/* Section 5 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>A new approach to online connection.</span>
          </h2>
          <p>
            Traditional platforms often ask users to trade privacy for convenience.
          </p>
          <p>
            Chatty takes a different approach.
          </p>
          <p>
            By combining encryption, ephemeral communication, collaboration tools, and interactive experiences, Chatty creates a new kind of digital space—one designed for private, temporary, and meaningful interactions.
          </p>
        </div>

        {/* Section 6 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Heart className="w-5 h-5 text-indigo-400" />
            <span>Our mission.</span>
          </h2>
          <p>
            Our mission is to create a communication platform where privacy is the default, not an afterthought.
          </p>
          <p>
            We believe people should have the freedom to connect, collaborate, and share without creating permanent records of every interaction.
          </p>
          <div className="pt-3 bg-slate-900/80 border border-slate-800 rounded-xl p-5 text-center space-y-1">
            <p className="text-xs sm:text-sm text-slate-400">The future of communication isn&apos;t about storing more.</p>
            <p className="text-base sm:text-lg font-display font-bold text-indigo-400">It&apos;s about connecting better.</p>
          </div>
        </div>

      </div>

      {/* Page-specific Footer */}
      <footer className="border-t border-slate-800/80 pt-8 pb-4 text-center text-slate-500 text-xs font-mono">
        (c) 2026 Chatty. All Rights Reserved.
      </footer>
    </div>
  );
}
