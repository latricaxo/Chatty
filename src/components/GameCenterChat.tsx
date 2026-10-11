/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare } from "lucide-react";
import { Message } from "../types";

interface GameCenterChatProps {
  messagesList: Message[];
  decryptedMap: Record<string, string>;
  userTokenHash: string;
  localDisplayName: string;
  onPostMessage: (text: string) => Promise<void>;
}

export default function GameCenterChat({ 
  messagesList, 
  decryptedMap, 
  userTokenHash, 
  localDisplayName, 
  onPostMessage 
}: GameCenterChatProps) {
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of the mini chat without affecting the main viewport scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messagesList]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const currentText = inputText.trim();
    setInputText("");
    setSending(true);
    try {
      await onPostMessage(currentText);
    } catch (err) {
      console.error("Failed to post message from game chat:", err);
      setInputText(currentText); // Restore input text on error
    } finally {
      setSending(false);
    }
  };

  // Filter out system or binary file messages to keep the game chat clean, and limit to last 20 messages
  const displayMessages = messagesList
    .filter((msg) => {
      const cacheKey = `${msg.id}_${msg.editedAt || "original"}`;
      const text = decryptedMap[cacheKey] || "";
      // Ignore stringified file attachments, system messages, or canvas drawing actions
      return !text.startsWith('{"__isChattyFile"') && 
             !text.startsWith('{"__isGamePrompt"') && 
             !text.includes('"__isCanvasAction"');
    })
    .slice(-15);

  return (
    <div className="w-full mt-6 bg-slate-950/80 border border-slate-850 rounded-2xl overflow-hidden flex flex-col h-56 max-w-sm sm:max-w-md mx-auto shadow-inner">
      {/* Mini Header */}
      <div className="bg-slate-900/50 border-b border-slate-850 px-3 py-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center space-x-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider">Chat</span>
        </div>
        <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 px-1.5 py-0.5 rounded text-[8px]">
          Room Feed
        </span>
      </div>

      {/* Message List */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-850"
      >
        {displayMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-[10px] text-slate-500 font-mono">No chat comments yet.</p>
          </div>
        ) : (
          displayMessages.map((msg) => {
            const cacheKey = `${msg.id}_${msg.editedAt || "original"}`;
            const decryptedText = decryptedMap[cacheKey] || "🔒 Encrypted Message";
            const isOwnMessage = msg.senderTokenHash === userTokenHash;

            return (
              <div 
                key={msg.id} 
                className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
              >
                {/* Sender Indicator */}
                <span className="text-[8px] font-mono text-slate-500 mb-0.5 px-1">
                  {isOwnMessage ? `${msg.senderName} (You)` : msg.senderName}
                </span>
                
                {/* Text Bubble */}
                <div 
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] leading-normal max-w-[85%] break-words whitespace-pre-wrap ${
                    isOwnMessage 
                      ? "bg-indigo-600/90 text-white rounded-tr-none border border-indigo-500/25" 
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {decryptedText}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send Input Form */}
      <form onSubmit={handleSend} className="p-2 border-t border-slate-850 bg-slate-900/30 flex items-center space-x-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type comments, reactions..."
          maxLength={150}
          className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/15"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
