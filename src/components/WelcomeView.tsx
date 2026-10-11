/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { KeyRound, Sparkles, PlusCircle, ArrowRight, UserCheck, Shuffle, Info } from "lucide-react";
import { deriveKeyFromPassword, encryptText, VALIDATOR_PHRASE } from "../lib/crypto";
import { RoomSession } from "../types";

interface WelcomeViewProps {
  onSessionCreated: (session: RoomSession, key: CryptoKey) => void;
}

// Word lists for generating fun anonymous names & room IDs
const ADJECTIVES = ["silent", "shadow", "cryptic", "cozy", "veiled", "whispering", "covert", "shielded", "cosmic", "stealthy", "hollow", "spectral"];
const NOUNS = ["fox", "ghost", "owl", "matrix", "haven", "beacon", "delta", "nebula", "vault", "echo", "cipher", "spire"];

export default function WelcomeView({ onSessionCreated }: WelcomeViewProps) {
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");
  const [roomId, setRoomId] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("room") || "";
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [anonName, setAnonName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRandomRoomId = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const randNum = Math.floor(100 + Math.random() * 900);
    setRoomId(`${adj}-${noun}-${randNum}`);
    setError(null);
  };

  const handleTabChange = (tab: "join" | "create") => {
    setActiveTab(tab);
    setError(null);
    if (tab === "create") {
      generateRandomRoomId();
    }
  };

  const generateRandomAnonName = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const capAdj = adj.charAt(0).toUpperCase() + adj.slice(1);
    const capNoun = noun.charAt(0).toUpperCase() + noun.slice(1);
    setAnonName(`${capAdj}${capNoun}`);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    const cleanRoomId = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleanRoomId) {
      setError("Please enter a valid room address. Only alphanumeric characters, hyphens, and underscores are allowed.");
      return;
    }

    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    const finalAnonName = anonName.trim() || `Anon-${Math.floor(1000 + Math.random() * 9000)}`;

    setLoading(true);

    try {
      if (activeTab === "create") {
        // --- CREATE ROOM FLOW ---
        // 1. Derive CryptoKey using cleanRoomId as the salt
        const cryptoKey = await deriveKeyFromPassword(password, cleanRoomId);

        // 2. Encrypt the standard VALIDATOR_PHRASE to prove password ownership later
        const encryptedValidator = await encryptText(VALIDATOR_PHRASE, cryptoKey);

        // 3. Register room on the server
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: cleanRoomId,
            validator: encryptedValidator,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create secure room.");
        }

        // Generate a random sender authorship token (secret uuid held client-side only)
        const senderToken = crypto.randomUUID();

        // 4. Session constructed successfully!
        const session: RoomSession = {
          roomId: cleanRoomId,
          anonymousName: finalAnonName,
          senderToken,
        };

        onSessionCreated(session, cryptoKey);

      } else {
        // --- JOIN ROOM FLOW ---
        // 1. Retrieve the room's stored validator from server
        const res = await fetch(`/api/rooms/${cleanRoomId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Room not found. Check the address or create a new room.");
        }

        const storedValidator = data.room.validator;

        // 2. Derive key using guest's candidate password
        const cryptoKey = await deriveKeyFromPassword(password, cleanRoomId);

        // 3. Attempt to decrypt the validator payload
        try {
          const decryptedPhrase = await import("../lib/crypto").then(m => m.decryptText(storedValidator, cryptoKey));
          
          if (decryptedPhrase !== VALIDATOR_PHRASE) {
            throw new Error(); // Fail block
          }
        } catch (decryptErr) {
          throw new Error("Invalid password. Local cryptographic decryption failed.");
        }

        // Decryption succeeded! Candidate password is correct.
        const senderToken = crypto.randomUUID();
        const session: RoomSession = {
          roomId: cleanRoomId,
          anonymousName: finalAnonName,
          senderToken,
        };

        onSessionCreated(session, cryptoKey);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected security system error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      {/* Title block */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-medium border border-indigo-500/20 mb-4 font-mono">
          <KeyRound className="w-3.5 h-3.5" />
          <span>100% Private</span>
        </span>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-100 tracking-tight leading-tight">
          Private Chatrooms
        </h2>
        <p className="text-slate-400 text-sm mt-2.5 leading-relaxed">
          Create or join an encrypted chat room.
        </p>
      </div>

      <div className="bg-slate-900/25 border border-slate-800/80 rounded-2xl p-6.5 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden shadow-indigo-950/10">
        {/* Subtle accent border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500/40"></div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl mb-6.5 border border-slate-900">
          <button
            onClick={() => handleTabChange("join")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === "join"
                ? "bg-slate-800 text-slate-100 shadow-md border border-slate-700/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Join Existing</span>
          </button>
          <button
            onClick={() => handleTabChange("create")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === "create"
                ? "bg-slate-800 text-slate-100 shadow-md border border-slate-700/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create New</span>
          </button>
        </div>

        <form onSubmit={handleAction} className="space-y-6">
          {/* Room ID Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                Room Address
              </label>
              {activeTab === "create" && (
                <button
                  type="button"
                  onClick={generateRandomRoomId}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors font-mono cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>GENERATE ROOM ADDRESS</span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. sapphire-delta-352"
                required
                readOnly={activeTab === "create"}
                className={`w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 font-mono transition-all shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.5)] ${
                  activeTab === "create" ? "cursor-not-allowed text-slate-400 select-none bg-slate-950/30" : ""
                }`}
              />
            </div>
          </div>

          {/* Password (The Cryptographic Key Seed) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                Room Password
              </label>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                <div className="absolute right-0 bottom-6 w-52 p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-400 leading-normal invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-10 font-sans shadow-xl">
                  Used as the salt-seed to derive the AES key. Plaintext never stored or sent to the server.
                </div>
              </div>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Display Username */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                Your Anonymous Handle <span className="text-slate-500 font-sans lowercase font-normal italic">(optional)</span>
              </label>
              <button
                type="button"
                onClick={generateRandomAnonName}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors font-mono cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Random Handle</span>
              </button>
            </div>
            <input
              type="text"
              value={anonName}
              onChange={(e) => setAnonName(e.target.value)}
              placeholder="e.g. CrypticGhost (defaults to Anon)"
              maxLength={24}
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Action Error Container */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs leading-relaxed"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Trigger */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/15 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
          >
            <span className="font-semibold tracking-wide uppercase text-xs">{loading ? "Deriving Key..." : activeTab === "create" ? "Initialize Secure Room" : "Join Secure Room"}</span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
}
