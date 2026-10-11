/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Shield } from "lucide-react";

interface PrivacyViewProps {
  onGoHome?: () => void;
}

export default function PrivacyView({ onGoHome }: PrivacyViewProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8 font-sans text-slate-200">
      {/* Top Header Title for Privacy Page */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-50 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs font-mono text-indigo-400 mt-0.5">
              Effective Date: August 3, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Intro Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 leading-relaxed text-slate-300 text-sm sm:text-base shadow-sm">
        <p>
          Welcome to Chatty (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). Your privacy is the foundational principle behind everything we design and build. This Privacy Policy outlines how Chatty handles data, how our zero-log architecture protects your communications, and the technical measures we implement across our web application and services (collectively, the &quot;Services&quot;).
        </p>
        <p>
          Chatty is built as a privacy-first, ephemeral communication platform. Messages and media are encrypted directly in your browser using client-side Web Crypto standards before transmission, and room sessions exist temporarily without permanent database retention.
        </p>
        <p>
          By accessing or using Chatty, you acknowledge and accept the privacy practices detailed in this Privacy Policy.
        </p>
      </div>

      {/* Summary Table Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono text-indigo-400">
          Privacy at a Glance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">🔒 Client-Side Encryption</span>
            <p className="text-slate-400">Messages and files are encrypted in your browser using AES-GCM (256-bit) before transmission. We cannot read your conversations.</p>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">⚡ Zero-Log Ephemeral Rooms</span>
            <p className="text-slate-400">Conversations, media, whiteboards, and game states exist temporarily in active room memory and self-destruct upon expiration.</p>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">🎭 Anonymous Aliases</span>
            <p className="text-slate-400">No account creation, phone number, or email required to join or create encrypted rooms. Choose any temporary alias.</p>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">🛡️ Automated AI Moderation</span>
            <p className="text-slate-400">Stateless AI safety checks screen media for harmful material without storing images or training AI models on your files.</p>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-8 divide-y divide-slate-800/60 text-sm sm:text-base text-slate-300 leading-relaxed">
        
        {/* Section 1 */}
        <div className="pt-6 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">1.</span>
            <span>Information We Process (And What We Do Not Store)</span>
          </h2>
          <p>Chatty is engineered to minimize data processing and avoid permanent storage whenever possible.</p>
          
          <div className="space-y-4 pl-2 sm:pl-4">
            <div>
              <h3 className="font-semibold text-slate-200 text-sm sm:text-base mb-1.5">A. Account & Registration Data (Zero Required Accounts)</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                Chatty does not require account creation, email addresses, phone numbers, or social media logins to access encrypted rooms. Users interact using voluntary, temporary display aliases that are purged when the room session ends.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-200 text-sm sm:text-base mb-1.5">B. Chat Content, Files & Collaboration Data</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                All message text, file attachments, images, drawing canvas strokes, and interactive game movements sent within a room are encrypted on your local device before transmission.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm mt-1.5 pl-2">
                <li><strong className="text-slate-200">Encrypted Transmission:</strong> Payload data is transmitted across WebSockets in ciphertext.</li>
                <li><strong className="text-slate-200">Zero Server Database Logging:</strong> Chat messages and shared media files are held exclusively in temporary room memory (RAM) and are never written to disk or long-term databases.</li>
                <li><strong className="text-slate-200">Automatic Memory Purging:</strong> When a room expires or all participants disconnect, the session memory is permanently destroyed.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-200 text-sm sm:text-base mb-1.5">C. Technical & Diagnostic Logs</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                To route real-time web traffic, prevent distributed denial-of-service (DDoS) attacks, enforce rate limits, and maintain system stability, our web server infrastructure temporarily processes minimal technical parameters:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm mt-1.5 pl-2">
                <li>IP address (processed transiently for connection routing and rate-limiting)</li>
                <li>Browser user-agent and operating system details</li>
                <li>Room connection timestamps and WebSocket status codes</li>
              </ul>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">
                These operational logs are separated from encrypted payload traffic and automatically rotated and purged.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-200 text-sm sm:text-base mb-1.5">D. Cryptocurrency & Wallet Tipping Information</h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                When utilizing optional crypto tipping or wallet address sharing features, public blockchain wallet addresses broadcasted in chat are processed as room messages. Chatty never requests, collects, accesses, or stores private keys, seed phrases, or financial account details.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">2.</span>
            <span>How We Use Information</span>
          </h2>
          <p className="text-slate-300">Information processed by Chatty is strictly limited to the following essential operational purposes:</p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li><strong className="text-slate-200">Service Delivery:</strong> Facilitating real-time encrypted messaging, ephemeral file distribution, whiteboard collaboration, and interactive multiplayer games.</li>
            <li><strong className="text-slate-200">Security & Protection:</strong> Defending the platform against automated spam, abusive bots, denial-of-service attacks, and exploit attempts.</li>
            <li><strong className="text-slate-200">Automated Content Moderation:</strong> Running stateless AI safety screening on shared media to prevent illegal or harmful content without storing files.</li>
            <li><strong className="text-slate-200">System Performance:</strong> Monitoring network latency, memory allocation, and connection stability.</li>
          </ul>
          <p className="text-slate-400 text-xs sm:text-sm italic pt-1 border-l-2 border-indigo-500/40 pl-3 mt-2">
            Chatty does NOT track users across third-party websites, sell user data, build advertising profiles, or monetize user communications in any form.
          </p>
        </div>

        {/* Section 3 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">3.</span>
            <span>Client-Side End-to-End Encryption & Key Security</span>
          </h2>
          <p>
            Chatty employs browser-native Web Crypto API standards (AES-GCM 256-bit) to encrypt message text, attachments, and collaborative inputs prior to sending them over the network.
          </p>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm space-y-2 text-slate-300">
            <p className="font-semibold text-slate-100">Key Security Principles:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>Encryption keys and optional room passphrases reside exclusively in participant browser memory.</li>
              <li>Unencrypted passphrases and decryption keys are <strong className="text-slate-200">never transmitted to or stored on Chatty servers</strong>.</li>
              <li>Because Chatty servers never hold the decryption keys, we cannot decrypt, read, or disclose your private room communications even under legal request.</li>
              <li>Users are responsible for safeguarding room passphrases and room invitation links. Lost passphrases cannot be recovered by Chatty.</li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">4.</span>
            <span>Ephemeral Design & Data Expiration</span>
          </h2>
          <p>
            Conversations on Chatty are ephemeral by design. Rooms, messages, and attachments automatically expire and are purged when:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>The designated room expiration timer (e.g., 24 hours) elapses.</li>
            <li>All active room participants disconnect from the room session.</li>
            <li>A participant manually triggers a room clear or room deletion command.</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-400 pt-1">
            Once a room session is purged from memory, the ciphertext is permanently unrecoverable. Users should not use Chatty for permanent data archiving or legally mandated record-keeping.
          </p>
        </div>

        {/* Section 5 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">5.</span>
            <span>Automated AI Safety & Moderation</span>
          </h2>
          <p>
            To foster a safe online environment without compromising user privacy, Chatty utilizes automated AI safety evaluations (powered by server-side Gemini API integrations) to detect illegal, extreme, or harmful content in shared media.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li><strong className="text-slate-200">Stateless Evaluation:</strong> Media submitted for safety checks is processed in volatile memory and immediately discarded after classification.</li>
            <li><strong className="text-slate-200">No AI Training:</strong> Content processed for safety moderation is not stored, logged, or used to train public AI models.</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">6.</span>
            <span>Interactive Features, Whiteboards & Games</span>
          </h2>
          <p>
            Interactive features such as collaborative whiteboards and multiplayer games transmit real-time state coordinates (e.g., vector stroke paths, player positions) to synchronized room participants via WebSockets.
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            This collaborative state data is processed in ephemeral room memory and dissolved completely when the room session terminates.
          </p>
        </div>

        {/* Section 7 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">7.</span>
            <span>Blockchain & Cryptocurrency Transactions</span>
          </h2>
          <p>
            Optional cryptocurrency features allow users to share public wallet addresses or interact with third-party web3 browser extensions (e.g. MetaMask).
          </p>
          <p className="text-xs sm:text-sm text-slate-300">
            Public blockchain transactions occur directly on decentralized peer-to-peer networks and are publicly indexed according to each blockchain&apos;s architecture. Chatty does not operate cryptocurrency exchanges, custodial wallets, or payment intermediaries.
          </p>
        </div>

        {/* Section 8 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">8.</span>
            <span>Infrastructure & Third-Party Service Providers</span>
          </h2>
          <p>
            Chatty relies on secure, enterprise-grade cloud hosting infrastructure (such as Cloud Run containers and edge proxy networks) to deliver web assets and route WebSocket traffic globally.
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            Infrastructure partners are strictly prohibited from utilizing network traffic for independent commercial purposes. They process transient technical headers solely to route packets and safeguard physical and cloud infrastructure.
          </p>
        </div>

        {/* Section 9 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">9.</span>
            <span>Cookies & Local Storage Usage</span>
          </h2>
          <p>
            Chatty does not use persistent tracking cookies, cross-site targeting cookies, or third-party ad telemetry scripts.
          </p>
          <p className="text-xs sm:text-sm text-slate-300">
            We utilize standard browser <code className="text-indigo-400 font-mono bg-slate-900 px-1 py-0.5 rounded">sessionStorage</code> or <code className="text-indigo-400 font-mono bg-slate-900 px-1 py-0.5 rounded">localStorage</code> strictly for functional client-side requirements (such as retaining your chosen display alias, dark theme preference, or room session token during your current browser tab lifetime).
          </p>
        </div>

        {/* Section 10 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">10.</span>
            <span>Children&apos;s Privacy</span>
          </h2>
          <p>
            Chatty is not intended for or directed toward children under the age of 13 (or under 16 in certain jurisdictions). Because Chatty does not require registration, collect personal profiles, or store user information, we do not knowingly solicit or maintain personal data from minors.
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            If you believe a minor has shared personal information through the Services, please contact us at <a href="mailto:contact@chatty.xyz" className="text-indigo-400 hover:underline font-mono">contact@chatty.xyz</a> so we can take immediate corrective measures.
          </p>
        </div>

        {/* Section 11 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">11.</span>
            <span>Global Users & Data Transfers</span>
          </h2>
          <p>
            Chatty operates globally. Transient network traffic may route through cloud servers located in various geographic regions. By using Chatty, you understand that technical packet routing may occur across international borders in compliance with global security and privacy standards (including GDPR and CCPA/CPRA frameworks).
          </p>
        </div>

        {/* Section 12 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">12.</span>
            <span>Your Rights & Privacy Controls</span>
          </h2>
          <p>
            Depending on your legal jurisdiction (e.g., GDPR, CCPA, CPRA), you possess specific privacy rights regarding personal data processing. Because Chatty operates on a zero-log, zero-account, client-side encrypted model:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li><strong className="text-slate-200">Right to Delete:</strong> You can instantly wipe local room state, aliases, and keys by closing your browser tab or clicking &quot;Leave Room.&quot;</li>
            <li><strong className="text-slate-200">Right to Access:</strong> Since we do not retain message histories or user profiles on servers, we hold no readable personal data archives linked to your identity.</li>
          </ul>
        </div>

        {/* Section 13 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">13.</span>
            <span>Changes to This Privacy Policy</span>
          </h2>
          <p>
            We may update this Privacy Policy periodically to reflect enhancements in our architecture, new features, or regulatory updates. Any changes will be published on this page with an updated Effective Date. Your continued use of Chatty after revisions are posted indicates your consent to the updated policy.
          </p>
        </div>

        {/* Section 14 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">14.</span>
            <span>Contact Information</span>
          </h2>
          <p>
            If you have questions, feedback, or inquiries regarding this Privacy Policy or our zero-knowledge architectural design, please contact our team:
          </p>
          <div className="pt-1 bg-slate-900/80 border border-slate-800 rounded-xl p-4 w-fit">
            <p className="text-xs font-mono text-slate-400">Email:</p>
            <a href="mailto:contact@chatty.xyz" className="text-sm font-mono text-indigo-400 hover:underline">
              contact@chatty.xyz
            </a>
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
