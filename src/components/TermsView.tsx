/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { FileText } from "lucide-react";

interface TermsViewProps {
  onGoHome?: () => void;
}

export default function TermsView({ onGoHome }: TermsViewProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8 font-sans text-slate-200">
      {/* Top Header Title for Terms Page */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-50 tracking-tight">
              Terms and Conditions
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
          Welcome to Chatty. These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Chatty website, web application, software, and related real-time communication services (collectively, the &quot;Services&quot;).
        </p>
        <p>
          Chatty is designed as a privacy-first, ephemeral communication platform enabling secure, encrypted messaging, real-time collaboration (whiteboards &amp; mini-games), media sharing, and crypto interactions without permanent data storage.
        </p>
        <p>
          By accessing, browsing, or using Chatty, you agree to be bound by these Terms. If you do not agree with any portion of these Terms, you may not access or use the Services.
        </p>
      </div>

      {/* Summary Table Card */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-indigo-400">
          Terms at a Glance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">🔐 Client Encryption &amp; Passphrases</span>
            <p className="text-slate-400">You are responsible for safeguarding your room links and passphrases. Unencrypted keys are never sent to Chatty, so lost keys cannot be recovered.</p>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">⌛ Ephemeral Memory Storage</span>
            <p className="text-slate-400">Conversations, whiteboards, and game states exist temporarily in volatile memory. Chatty does not store permanent chat history.</p>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">🤝 Acceptable Usage</span>
            <p className="text-slate-400">Illegal acts, harassment, malware distribution, scraping, and security tampering are strictly prohibited.</p>
          </div>
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200 block mb-1">🪙 Crypto &amp; Financial Disclaimer</span>
            <p className="text-slate-400">Crypto tipping and wallet address sharing features are optional and user-driven. Blockchain transactions are irreversible and at your own risk.</p>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-8 divide-y divide-slate-800/60 text-sm sm:text-base text-slate-300 leading-relaxed">
        
        {/* Section 1 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">1.</span>
            <span>Acceptance of Terms</span>
          </h2>
          <p>By accessing or using Chatty, you confirm that:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>You have read and understood these Terms.</li>
            <li>You agree to comply with all applicable laws and regulations.</li>
            <li>You are authorized to use the Services.</li>
            <li>You will use Chatty responsibly and in accordance with these Terms.</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">
            If you are using Chatty on behalf of another person, organization, or group, you confirm that you have authority to accept these Terms on their behalf.
          </p>
        </div>

        {/* Section 2 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">2.</span>
            <span>Description of Services</span>
          </h2>
          <p>Chatty provides privacy-focused communication tools designed for secure and temporary digital interactions.</p>
          <p className="text-xs sm:text-sm text-slate-400">The Services may include:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>End-to-end encrypted messaging</li>
            <li>Ephemeral chat rooms</li>
            <li>Encrypted file and media sharing</li>
            <li>Anonymous aliases</li>
            <li>Real-time collaboration tools</li>
            <li>Shared whiteboards and drawing features</li>
            <li>Interactive multiplayer games</li>
            <li>Crypto wallet sharing and tipping features</li>
            <li>Future features, tools, or services introduced over time</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">
            Chatty may update, modify, expand, suspend, or discontinue features at any time to improve the platform.
          </p>
        </div>

        {/* Section 3 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">3.</span>
            <span>Privacy and Security Disclaimer</span>
          </h2>
          <p>
            Chatty is designed with privacy and security as core principles. The Services may use client-side encryption technologies intended to protect user communications before transmission.
          </p>
          <p className="font-medium text-slate-200 text-xs sm:text-sm">However, users acknowledge that:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>No security system can guarantee absolute protection.</li>
            <li>Users are responsible for protecting their own devices and access credentials.</li>
            <li>Users should carefully protect passphrases and room information.</li>
            <li>Anyone with access to a room invitation, room identifier, or passphrase may potentially access that room.</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-400 pt-1">
            Chatty cannot recover lost encryption keys, passphrases, or access information.
          </p>
        </div>

        {/* Section 4 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">4.</span>
            <span>Ephemeral Messaging</span>
          </h2>
          <p>
            Chatty may provide temporary communication features where messages, files, and media automatically expire after a designated period.
          </p>
          <p className="font-medium text-slate-200 text-xs sm:text-sm">Users understand that:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Expiration features are designed to reduce long-term storage.</li>
            <li>Temporary deletion does not guarantee immediate removal from all devices, backups, caches, or third-party systems outside Chatty&apos;s control.</li>
            <li>Users should not rely on ephemeral messaging for legally required records or permanent storage.</li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">5.</span>
            <span>User Accounts and Identity</span>
          </h2>
          <p>
            Chatty may allow users to access services through accounts, anonymous aliases, or temporary identities.
          </p>
          <p className="font-medium text-slate-200 text-xs sm:text-sm">Users agree to:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Provide accurate information when required.</li>
            <li>Maintain control over account access information.</li>
            <li>Protect room links, passphrases, and invitations.</li>
            <li>Be responsible for activity associated with their account or access method.</li>
            <li>Notify Chatty of suspected unauthorized access where applicable.</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">6.</span>
            <span>User Content</span>
          </h2>
          <p>Users may submit, transmit, or share content through Chatty, including:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Messages</li>
            <li>Images</li>
            <li>Videos</li>
            <li>Audio files</li>
            <li>Documents</li>
            <li>Drawings</li>
            <li>Other shared content</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">
            Users retain ownership of their content. By using the Services, you grant Chatty only the limited permissions necessary to operate, maintain, and provide the Services. Chatty does not claim ownership of user content.
          </p>
        </div>

        {/* Section 7 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">7.</span>
            <span>Crypto and Digital Asset Features</span>
          </h2>
          <p>Chatty may include optional cryptocurrency-related features, including:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Wallet address sharing</li>
            <li>Crypto tipping</li>
            <li>Blockchain-related interactions</li>
          </ul>
          <p className="font-medium text-slate-200 text-xs sm:text-sm pt-1">Users understand that:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Chatty does not provide financial, investment, or trading advice.</li>
            <li>Cryptocurrency transactions involve risk.</li>
            <li>Users are solely responsible for verifying wallet addresses and transaction details.</li>
            <li>Blockchain transactions may be irreversible.</li>
            <li>Chatty is not responsible for losses resulting from user actions, incorrect information, third-party wallets, exchanges, or blockchain networks.</li>
          </ul>
        </div>

        {/* Section 8 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">8.</span>
            <span>Interactive Features and Games</span>
          </h2>
          <p>Chatty may provide interactive features, including games and collaborative tools.</p>
          <p className="font-medium text-slate-200 text-xs sm:text-sm">Users understand that:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Games and interactive features are provided for entertainment purposes.</li>
            <li>Features may change or be removed at any time.</li>
            <li>Chatty does not guarantee uninterrupted availability or error-free operation.</li>
          </ul>
        </div>

        {/* Section 9 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">9.</span>
            <span>User Responsibilities</span>
          </h2>
          <p>Users agree to use Chatty responsibly. Users must not:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Use Chatty for illegal activities.</li>
            <li>Threaten, harass, abuse, or harm others.</li>
            <li>Share unlawful or harmful content.</li>
            <li>Attempt unauthorized access.</li>
            <li>Circumvent security features.</li>
            <li>Distribute malware or malicious code.</li>
            <li>Exploit vulnerabilities.</li>
            <li>Abuse automated systems.</li>
            <li>Impersonate another person or organization.</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">
            Chatty reserves the right to restrict or terminate access for violations of these Terms.
          </p>
        </div>

        {/* Section 10 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">10.</span>
            <span>Prohibited Activities</span>
          </h2>
          <p>Users may not:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Use Chatty to violate applicable laws.</li>
            <li>Attempt to compromise encryption or security systems.</li>
            <li>Reverse engineer, copy, or modify the Services without permission.</li>
            <li>Scrape or collect user data without authorization.</li>
            <li>Use Chatty to facilitate fraud, scams, or illegal transactions.</li>
            <li>Interfere with platform operations.</li>
          </ul>
        </div>

        {/* Section 11 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">11.</span>
            <span>Intellectual Property Rights</span>
          </h2>
          <p>
            All content, technology, software, designs, branding, interfaces, features, and materials provided through Chatty are owned by or licensed to Chatty unless otherwise stated.
          </p>
          <p className="text-xs sm:text-sm text-slate-400">This includes:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Chatty name and branding</li>
            <li>Website design</li>
            <li>Software</li>
            <li>User interface elements</li>
            <li>Platform features</li>
            <li>Graphics and visual assets</li>
            <li>Technology systems</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">
            Users may not copy, distribute, modify, reverse engineer, sell, or republish any part of the Services without prior written permission.
          </p>
        </div>

        {/* Section 12 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">12.</span>
            <span>Third-Party Services</span>
          </h2>
          <p>
            Chatty may rely on third-party services necessary to operate the platform. These services may include:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Hosting providers</li>
            <li>Cloud infrastructure providers</li>
            <li>Authentication services</li>
            <li>Analytics providers</li>
            <li>Blockchain networks</li>
            <li>Payment providers</li>
            <li>Other technology partners</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">
            Third-party providers maintain their own terms and privacy policies. Chatty is not responsible for the availability, security, or practices of third-party services.
          </p>
        </div>

        {/* Section 13 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">13.</span>
            <span>Availability of Services</span>
          </h2>
          <p>
            We strive to maintain reliable access to Chatty. However, we do not guarantee uninterrupted availability.
          </p>
          <p className="text-xs sm:text-sm text-slate-400">The Services may become unavailable due to:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Maintenance</li>
            <li>Updates</li>
            <li>Security issues</li>
            <li>Technical failures</li>
            <li>Third-party outages</li>
            <li>Events outside our control</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">
            Chatty may modify or discontinue features at any time.
          </p>
        </div>

        {/* Section 14 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">14.</span>
            <span>Payments and Subscriptions</span>
          </h2>
          <p>If Chatty offers paid features, subscriptions, or premium services:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Pricing will be displayed before purchase.</li>
            <li>Payment terms will be provided at checkout.</li>
            <li>Features may change over time.</li>
            <li>Users are responsible for maintaining accurate payment information.</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">Additional payment terms may apply.</p>
        </div>

        {/* Section 15 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">15.</span>
            <span>Refund Policy</span>
          </h2>
          <p>
            Refund policies for paid features, subscriptions, or purchases will be provided at the time of purchase. Nothing in these Terms limits consumer rights provided under applicable laws.
          </p>
        </div>

        {/* Section 16 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">16.</span>
            <span>Disclaimer of Warranties</span>
          </h2>
          <p>
            Chatty is provided on an &quot;as available&quot; and &quot;as is&quot; basis. To the fullest extent permitted by law, Chatty makes no guarantees regarding:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Continuous availability</li>
            <li>Complete security</li>
            <li>Successful message delivery</li>
            <li>Permanent preservation of data</li>
            <li>Accuracy of user-generated content</li>
            <li>Third-party services</li>
            <li>Cryptocurrency transactions</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">Use of Chatty is at your own risk.</p>
        </div>

        {/* Section 17 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">17.</span>
            <span>Limitation of Liability</span>
          </h2>
          <p>
            To the fullest extent permitted by law, Chatty, its owners, affiliates, partners, and service providers shall not be liable for damages resulting from:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Use or inability to use the Services</li>
            <li>Lost access to encrypted rooms</li>
            <li>Lost passphrases</li>
            <li>User-generated content</li>
            <li>Third-party service failures</li>
            <li>Cryptocurrency transactions</li>
            <li>Security incidents beyond reasonable control</li>
          </ul>
        </div>

        {/* Section 18 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">18.</span>
            <span>Indemnification</span>
          </h2>
          <p>
            You agree to defend, indemnify, and hold harmless Chatty, its owners, affiliates, partners, employees, and service providers from claims, damages, liabilities, costs, and expenses arising from:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Your use of the Services.</li>
            <li>Your violation of these Terms.</li>
            <li>Your violation of applicable laws.</li>
            <li>Your misuse of Chatty.</li>
          </ul>
        </div>

        {/* Section 19 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">19.</span>
            <span>International Users</span>
          </h2>
          <p>Chatty may be accessed by users worldwide. Users acknowledge that:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs sm:text-sm pl-2 sm:pl-4">
            <li>Services may rely on technology located in multiple countries.</li>
            <li>Data processing may occur internationally.</li>
            <li>Laws may vary depending on location.</li>
          </ul>
          <p className="text-xs sm:text-sm text-slate-300 pt-1">
            Users are responsible for complying with applicable local laws.
          </p>
        </div>

        {/* Section 20 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">20.</span>
            <span>Governing Law</span>
          </h2>
          <p>
            These Terms shall be governed by applicable laws in the jurisdiction where Chatty operates, without regard to conflict of law principles. Any disputes shall be handled according to applicable legal requirements.
          </p>
        </div>

        {/* Section 21 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">21.</span>
            <span>Changes to These Terms</span>
          </h2>
          <p>
            Chatty may update these Terms from time to time. Changes will be posted with a revised Effective Date. Continued use of Chatty after updates are posted constitutes acceptance of the updated Terms.
          </p>
        </div>

        {/* Section 22 */}
        <div className="pt-6 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span className="text-indigo-400 font-mono">22.</span>
            <span>Contact Information</span>
          </h2>
          <p>
            If you have questions regarding these Terms and Conditions, please contact:
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
