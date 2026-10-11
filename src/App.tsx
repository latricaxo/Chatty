/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import WelcomeView from "./components/WelcomeView";
import ChatRoomView from "./components/ChatRoomView";
import LandingView from "./components/LandingView";
import PrivacyView from "./components/PrivacyView";
import TermsView from "./components/TermsView";
import AboutView from "./components/AboutView";
import { RoomSession } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [session, setSession] = useState<RoomSession | null>(null);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    const savedSession = sessionStorage.getItem("privacy_chat_session");
    const savedKeyJWK = sessionStorage.getItem("privacy_chat_key_jwk");
    return !!(savedSession && savedKeyJWK);
  });

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Restore session from tab sessionStorage if page is refreshed
  useEffect(() => {
    const savedSession = sessionStorage.getItem("privacy_chat_session");
    const savedKeyJWK = sessionStorage.getItem("privacy_chat_key_jwk");

    if (savedSession && savedKeyJWK) {
      try {
        const parsedSession = JSON.parse(savedSession);
        const parsedKey = JSON.parse(savedKeyJWK);
        
        // Re-import the raw cryptokey from JWK format securely
        crypto.subtle
          .importKey(
            "jwk",
            parsedKey,
            { name: "AES-GCM" },
            false,
            ["encrypt", "decrypt"]
          )
          .then((key) => {
            setSession(parsedSession);
            setCryptoKey(key);
          })
          .catch(() => {
            handleLeaveSession();
          });
      } catch (err) {
        handleLeaveSession();
      }
    }
  }, []);

  const handleSessionCreated = async (newSession: RoomSession, key: CryptoKey) => {
    setSession(newSession);
    setCryptoKey(key);

    // Save transient credentials to sessionStorage (holds state only within active tab)
    try {
      sessionStorage.setItem("privacy_chat_session", JSON.stringify(newSession));
      const jwk = await crypto.subtle.exportKey("jwk", key);
      sessionStorage.setItem("privacy_chat_key_jwk", JSON.stringify(jwk));
      
      // Sync URL address with room parameter for simple copying
      const url = new URL(window.location.href);
      url.searchParams.set("room", newSession.roomId);
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      console.warn("Storage persistence warning:", err);
    }
  };

  const handleLeaveSession = () => {
    setSession(null);
    setCryptoKey(null);
    sessionStorage.removeItem("privacy_chat_session");
    sessionStorage.removeItem("privacy_chat_key_jwk");
    
    // Reset URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete("room");
    window.history.replaceState({}, "", url.toString());
  };

  return (
    <div className="min-h-screen bg-[#060811] flex flex-col text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header showing server latency, memory status, and logo */}
      <Header 
        onBrandClick={() => {
          navigateTo("/");
          setHasEntered(false);
        }}
        onHomeClick={
          currentPath === "/privacy" || currentPath === "/terms" || currentPath === "/about"
            ? () => {
                navigateTo("/");
                setHasEntered(false);
              }
            : undefined
        }
      />
      
      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentPath === "/privacy" ? (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="py-2 w-full"
            >
              <PrivacyView onGoHome={() => {
                navigateTo("/");
                setHasEntered(false);
              }} />
            </motion.div>
          ) : currentPath === "/terms" ? (
            <motion.div
              key="terms"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="py-2 w-full"
            >
              <TermsView onGoHome={() => {
                navigateTo("/");
                setHasEntered(false);
              }} />
            </motion.div>
          ) : currentPath === "/about" ? (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="py-2 w-full"
            >
              <AboutView onGoHome={() => {
                navigateTo("/");
                setHasEntered(false);
              }} />
            </motion.div>
          ) : !hasEntered ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="py-6 flex flex-col items-center justify-center w-full"
            >
              <LandingView onEnter={() => setHasEntered(true)} />
            </motion.div>
          ) : !session || !cryptoKey ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="py-6 flex flex-col items-center justify-center"
            >
              <WelcomeView onSessionCreated={handleSessionCreated} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <ChatRoomView 
                session={session} 
                cryptoKey={cryptoKey} 
                onLeave={handleLeaveSession} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer on non-standalone pages */}
      {currentPath !== "/privacy" && currentPath !== "/terms" && currentPath !== "/about" && (
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-10 mt-4">
          <footer className="flex flex-col sm:flex-row items-center justify-between text-slate-600 text-[11px] mt-8 font-mono space-y-2 sm:space-y-0">
            <div>© {new Date().getFullYear()} Chatty. All Rights Reserved.</div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateTo("/about")}
                className="hover:text-indigo-400 transition-colors cursor-pointer underline decoration-slate-700 underline-offset-4"
              >
                About
              </button>
              <span>•</span>
              <button
                onClick={() => navigateTo("/privacy")}
                className="hover:text-indigo-400 transition-colors cursor-pointer underline decoration-slate-700 underline-offset-4"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => navigateTo("/terms")}
                className="hover:text-indigo-400 transition-colors cursor-pointer underline decoration-slate-700 underline-offset-4"
              >
                Terms
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
