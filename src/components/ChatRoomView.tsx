/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Users, Lock, LogOut, Copy, Check, 
  Clock, ShieldCheck, RefreshCw, AlertCircle, X, CheckSquare, Sparkles,
  Paperclip, FileText, Video, Download, Coins, QrCode, Wallet, ExternalLink, Zap,
  Gamepad2
} from "lucide-react";
import { encryptText, decryptText, hashString } from "../lib/crypto";
import { Message, RoomSession } from "../types";
import GameCenter from "./GameCenter";
import ChatGameCard from "./ChatGameCard";

/**
 * Interface representing a secure decrypted Chatty game card prompt
 */
interface ChattyGamePrompt {
  __isGamePrompt: true;
  gameType: "truthdare" | "trivia" | "challenge";
  category: string;
  type?: "truth" | "dare";
  text?: string;
  target?: string;
  question?: string;
  options?: string[];
  answerIndex?: number;
  explanation?: string;
  challengeGame?: "tictactoe" | "connectfour" | "rps";
}

/**
 * Helper to parse a decrypted message content and see if it's a game card prompt
 */
function parseGameMessage(text: string): ChattyGamePrompt | null {
  try {
    if (text.startsWith("{") && text.endsWith("}")) {
      const parsed = JSON.parse(text);
      if (parsed && parsed.__isGamePrompt === true) {
        return parsed as ChattyGamePrompt;
      }
    }
  } catch (e) {
    // Normal text or non-game JSON
  }
  return null;
}

/**
 * Helper to format file sizes in bytes to readable string (e.g. 1.2 MB)
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Interface representing a secure decrypted Chatty file attachment
 */
interface ChattyFileAttachment {
  __isChattyFile: true;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  caption?: string;
}

/**
 * Helper to parse a decrypted message content and see if it's a file attachment
 */
function parseFileMessage(text: string): ChattyFileAttachment | null {
  try {
    if (text.startsWith("{") && text.endsWith("}")) {
      const parsed = JSON.parse(text);
      if (parsed && parsed.__isChattyFile === true) {
        return parsed as ChattyFileAttachment;
      }
    }
  } catch (e) {
    // Normal text message
  }
  return null;
}

/**
 * Bitcoin Address Matching Pattern (supporting Legacy, Segwit, Native Bech32, and Taproot addresses)
 */
const BTC_ADDR_REGEX = /\b(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,65})\b/i;

/**
 * Lightning Network Invoice Matching Pattern (case-insensitive, optionally prefixed with lightning:)
 */
const LN_INVOICE_REGEX = /(?:lightning:)?\b(lnbc[0-9a-zA-Z]{50,1600}|lntb[0-9a-zA-Z]{50,1600})\b/i;

/**
 * Solana Address Matching Pattern (Base58 string of 32-44 characters, excluding 0, O, I, l)
 */
const SOL_ADDR_REGEX = /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/;

/**
 * Ethereum Address Matching Pattern (0x followed by exactly 40 hex characters)
 */
const ETH_ADDR_REGEX = /\b(0x[a-fA-F0-9]{40})\b/i;

interface CryptoToken {
  type: "text" | "btc" | "lightning" | "sol" | "eth";
  text: string;
  value: string;
}

const PRIORITY: Record<string, number> = {
  lightning: 1,
  btc: 2,
  eth: 3,
  sol: 4
};

/**
 * Parses a string and returns tokens for plain text, BTC on-chain, LN invoices, SOL addresses, and ETH addresses
 */
function parseCryptoInvoiceTokens(text: string): CryptoToken[] {
  // Guard to prevent RegExp catastrophic backtracking on large strings (e.g. decrypted base64 file data)
  if (text.length > 2000) {
    return [{ type: "text", text, value: text }];
  }

  const tokens: CryptoToken[] = [];
  let index = 0;
  
  while (index < text.length) {
    const remaining = text.slice(index);
    
    const btcMatch = BTC_ADDR_REGEX.exec(remaining);
    const lnMatch = LN_INVOICE_REGEX.exec(remaining);
    const solMatch = SOL_ADDR_REGEX.exec(remaining);
    const ethMatch = ETH_ADDR_REGEX.exec(remaining);
    
    let nextMatch: { type: "btc" | "lightning" | "sol" | "eth"; match: RegExpExecArray } | null = null;
    
    const matches: { type: "btc" | "lightning" | "sol" | "eth"; match: RegExpExecArray }[] = [];
    if (btcMatch) matches.push({ type: "btc", match: btcMatch });
    if (lnMatch) matches.push({ type: "lightning", match: lnMatch });
    if (solMatch) matches.push({ type: "sol", match: solMatch });
    if (ethMatch) matches.push({ type: "eth", match: ethMatch });
    
    if (matches.length > 0) {
      // Sort matches by index so we process the first one. Tie break with priority.
      matches.sort((a, b) => {
        if (a.match.index !== b.match.index) {
          return a.match.index - b.match.index;
        }
        return PRIORITY[a.type] - PRIORITY[b.type];
      });
      nextMatch = matches[0];
    }
    
    if (!nextMatch) {
      tokens.push({ type: "text", text: remaining, value: remaining });
      break;
    }
    
    const { type, match } = nextMatch;
    const matchStart = match.index;
    const matchText = match[0];
    const matchVal = match[1] || matchText;
    
    if (matchStart > 0) {
      const precedingText = remaining.slice(0, matchStart);
      tokens.push({ type: "text", text: precedingText, value: precedingText });
    }
    
    tokens.push({ type, text: matchText, value: matchVal });
    index += matchStart + matchText.length;
  }
  
  return tokens;
}

/**
 * Parses and replaces Bitcoin, Solana, and Ethereum addresses and Lightning invoices with elegant interactive buttons
 */
function renderDecryptedTextWithBtc(
  text: string, 
  isOwnMessage: boolean, 
  onPayBtc: (addr: string, type: "onchain" | "lightning" | "sol" | "eth") => void
): React.ReactNode {
  try {
    const tokens = parseCryptoInvoiceTokens(text);
    return (
      <>
        {tokens.map((token, i) => {
          if (token.type === "btc") {
            return (
              <button
                key={`btc_${i}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayBtc(token.value, "onchain");
                }}
                className={`inline-flex items-center space-x-1 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm mx-1 align-middle ${
                  isOwnMessage 
                    ? "border-amber-500/40 text-amber-300 hover:border-amber-500/60" 
                    : "border-amber-500/30 text-amber-500 hover:border-amber-500/50"
                }`}
              >
                <Coins className="w-3.5 h-3.5 mr-0.5 animate-pulse text-amber-500" />
                <span>Pay the BTC Invoice</span>
              </button>
            );
          }
          
          if (token.type === "lightning") {
            return (
              <button
                key={`ln_${i}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayBtc(token.value, "lightning");
                }}
                className={`inline-flex items-center space-x-1 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm mx-1 align-middle ${
                  isOwnMessage 
                    ? "border-amber-500/40 text-amber-300 hover:border-amber-500/60" 
                    : "border-amber-500/30 text-amber-500 hover:border-amber-500/50"
                }`}
              >
                <Zap className="w-3.5 h-3.5 mr-0.5 animate-pulse text-amber-500" />
                <span>Pay the ⚡️Invoice</span>
              </button>
            );
          }

          if (token.type === "sol") {
            return (
              <button
                key={`sol_${i}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayBtc(token.value, "sol");
                }}
                className={`inline-flex items-center space-x-1 px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm mx-1 align-middle ${
                  isOwnMessage 
                    ? "border-purple-500/40 text-purple-300 hover:border-purple-500/60" 
                    : "border-purple-500/30 text-purple-400 hover:border-purple-500/50"
                }`}
              >
                <Wallet className="w-3.5 h-3.5 mr-0.5 animate-pulse text-purple-400" />
                <span>Pay the SOL Invoice</span>
              </button>
            );
          }

          if (token.type === "eth") {
            return (
              <button
                key={`eth_${i}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPayBtc(token.value, "eth");
                }}
                className={`inline-flex items-center space-x-1 px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm mx-1 align-middle ${
                  isOwnMessage 
                    ? "border-sky-500/40 text-sky-300 hover:border-sky-500/60" 
                    : "border-sky-500/30 text-sky-400 hover:border-sky-500/50"
                }`}
              >
                <Coins className="w-3.5 h-3.5 mr-0.5 animate-pulse text-sky-400" />
                <span>Pay the ETH Invoice</span>
              </button>
            );
          }
          
          return <span key={`txt_${i}`}>{token.text}</span>;
        })}
      </>
    );
  } catch (e) {
    return <span>{text}</span>;
  }
}

interface ChatRoomViewProps {
  session: RoomSession;
  cryptoKey: CryptoKey;
  onLeave: () => void;
}

export default function ChatRoomView({ session, cryptoKey, onLeave }: ChatRoomViewProps) {
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
  const [activeUsersCount, setActiveUsersCount] = useState(1);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pollError, setPollError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [userTokenHash, setUserTokenHash] = useState<string>("");
  const [localDisplayName, setLocalDisplayName] = useState(session.anonymousName);

  // Editing state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // File upload & viewer state
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string; dataUrl: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxFile, setLightboxFile] = useState<{ name: string; dataUrl: string } | null>(null);

  // Bitcoin / Lightning / Solana / Ethereum Invoice active state
  const [activeBtcInvoiceAddress, setActiveBtcInvoiceAddress] = useState<string | null>(null);
  const [activeInvoiceType, setActiveInvoiceType] = useState<"onchain" | "lightning" | "sol" | "eth">("onchain");
  const [btcCopied, setBtcCopied] = useState(false);
  const [btcCheckingStatus, setBtcCheckingStatus] = useState<"idle" | "checking" | "verified">("idle");
  const [showGameCenter, setShowGameCenter] = useState(false);
  const [activeCenterGame, setActiveCenterGame] = useState<string | null>(null);

  const handlePayBtc = (address: string, type: "onchain" | "lightning" | "sol" | "eth" = "onchain") => {
    setActiveBtcInvoiceAddress(address);
    setActiveInvoiceType(type);
    setBtcCheckingStatus("idle");
  };

  // Triple-tap detection states and tactile shake state
  const [isShaking, setIsShaking] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const lastTapRef = useRef<number>(0);

  const postGameResult = async (text: string) => {
    if (!userTokenHash) return;
    try {
      // Check if text represents a whiteboard sketch file payload
      let isWhiteboardSketch = false;
      let whiteboardDataUrl = "";
      let whiteboardType = "";
      let whiteboardName = "";
      try {
        if (text.startsWith("{") && text.endsWith("}")) {
          const parsed = JSON.parse(text);
          if (parsed && parsed.__isChattyFile === true && parsed.fileName?.startsWith("whiteboard-sketch-")) {
            isWhiteboardSketch = true;
            whiteboardDataUrl = parsed.fileData;
            whiteboardType = parsed.fileType;
            whiteboardName = parsed.fileName;
          }
        }
      } catch (e) {}

      if (isWhiteboardSketch) {
        const modRes = await fetch("/api/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: whiteboardDataUrl,
            fileType: whiteboardType,
            fileName: whiteboardName,
          }),
        });
        if (!modRes.ok) {
          throw new Error("AI Moderation is temporarily unavailable.");
        }
        const modData = await modRes.json();
        if (!modData.safe) {
          throw new Error(`Whiteboard sketch contains inappropriate content and was blocked by AI Moderation: ${modData.reason}`);
        }
      }

      const encryptedPayload = await encryptText(text, cryptoKey);
      const res = await fetch(`/api/rooms/${session.roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: localDisplayName,
          senderTokenHash: userTokenHash,
          encryptedText: encryptedPayload,
        }),
      });
      if (!res.ok) throw new Error("Failed to post game outcome.");
      await fetchMessages();
    } catch (err: any) {
      console.error("Failed to post game outcome:", err);
      setPollError(err.message || "Failed to post game outcome.");
    }
  };

  const triggerPurgeAction = async () => {
    if (clearingAll) return;
    setClearingAll(true);
    try {
      const res = await fetch(`/api/rooms/${session.roomId}/messages`, {
        method: "DELETE"
      });
      if (!res.ok) {
        throw new Error("Server rejected message purge.");
      }
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 800);
      
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([150, 100, 150]);
      }
      await fetchMessages();
    } catch (err: any) {
      console.error("Failed to purge room messages via triple-tap:", err);
    } finally {
      setClearingAll(false);
    }
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Exclude clicks on interactive elements inside the board
    const target = e.target as HTMLElement;
    if (
      target.closest("button") || 
      target.closest("input") || 
      target.closest("a") ||
      target.closest("textarea") ||
      target.isContentEditable
    ) {
      return;
    }

    const now = Date.now();
    if (now - lastTapRef.current > 500) {
      setTapCount(1);
    } else {
      const nextCount = tapCount + 1;
      setTapCount(nextCount);
      if (nextCount === 3) {
        triggerPurgeAction();
        setTapCount(0);
      }
    }
    lastTapRef.current = now;
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File selection handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // clear so user can select same file again
    }
  };

  const readFile = (file: File) => {
    const MAX_SIZE = 40 * 1024 * 1024; // 40MB limit
    if (file.size > MAX_SIZE) {
      setPollError("File is too large. Maximum size allowed is 40MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => {
      setPollError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  // Derive the SHA-256 hash of the client's senderToken once on mount
  useEffect(() => {
    let active = true;
    hashString(session.senderToken).then((hash) => {
      if (active) {
        setUserTokenHash(hash);
      }
    });
    return () => { active = false; };
  }, [session.senderToken]);

  // Fetch messages and active user count from the server
  const fetchMessages = async (showLoader = false) => {
    if (!userTokenHash) return;
    if (showLoader) setLoading(true);

    try {
      const res = await fetch(
        `/api/rooms/${session.roomId}/messages?userTokenHash=${userTokenHash}&userName=${encodeURIComponent(localDisplayName)}`
      );
      if (!res.ok) {
        throw new Error("Failed to sync room data with the server.");
      }
      const data = await res.json();
      const fetchedMessages: Message[] = data.messages || [];
      setMessagesList(fetchedMessages);
      setActiveUsersCount(data.activeUsersCount || 1);
      setPollError(null);

      // If the server assigned or updated our name to ensure it is unique, sync it locally and to sessionStorage
      if (data.assignedName && data.assignedName !== localDisplayName) {
        setLocalDisplayName(data.assignedName);
        session.anonymousName = data.assignedName;
        try {
          const savedSession = sessionStorage.getItem("privacy_chat_session");
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            parsed.anonymousName = data.assignedName;
            sessionStorage.setItem("privacy_chat_session", JSON.stringify(parsed));
          }
        } catch (e) {
          console.warn("Could not save updated session name:", e);
        }
      }

      // Trigger bulk read receipts for unread messages sent by other users
      const unreadIds = fetchedMessages
        .filter((msg) => msg.senderTokenHash !== userTokenHash && (!msg.readBy || !msg.readBy[userTokenHash]))
        .map((msg) => msg.id);

      if (unreadIds.length > 0) {
        fetch(`/api/rooms/${session.roomId}/messages/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderTokenHash: userTokenHash,
            senderName: data.assignedName || localDisplayName,
            messageIds: unreadIds,
          }),
        }).catch((err) => console.error("Error marking messages as read:", err));
      }
    } catch (err: any) {
      setPollError(err.message || "Connection lost. Reconnecting...");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Toggle reaction on a message
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!userTokenHash) return;
    try {
      const res = await fetch(`/api/rooms/${session.roomId}/messages/${messageId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderTokenHash: userTokenHash,
          senderName: localDisplayName,
          emoji,
        }),
      });
      if (!res.ok) {
        throw new Error("Server rejected reaction.");
      }
      await fetchMessages();
    } catch (err: any) {
      console.error("Failed to toggle reaction:", err);
    }
  };

  // Poll server for updates every 3 seconds
  useEffect(() => {
    if (!userTokenHash) return;

    fetchMessages(true); // Initial load with spinner

    pollIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [session.roomId, userTokenHash]);

  // Handle client-side decryption of incoming messages
  useEffect(() => {
    const decryptAllNewMessages = async () => {
      let updated = false;
      const newDecryptedMap = { ...decryptedMap };

      for (const msg of messagesList) {
        const cacheKey = `${msg.id}_${msg.editedAt || "original"}`;
        // If message is not decrypted yet or is newly edited, decrypt it
        if (!newDecryptedMap[cacheKey]) {
          try {
            const payload = JSON.parse(msg.encryptedText);
            const cleartext = await decryptText(payload, cryptoKey);
            newDecryptedMap[cacheKey] = cleartext;
            updated = true;
          } catch (err) {
            newDecryptedMap[cacheKey] = "🔒 [Decryption Failed: This message was encrypted with a different key/password]";
            updated = true;
          }
        }
      }

      if (updated) {
        setDecryptedMap(newDecryptedMap);
        scrollToBottom();
      }
    };

    if (messagesList.length > 0) {
      decryptAllNewMessages();
    }
  }, [messagesList, cryptoKey]);

  // Scroll to bottom when messages load or decrypt
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Trigger scroll to bottom on initial load
  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading]);

  // Post a new encrypted message (text or file attachment)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !userTokenHash) return;

    const hasText = !!inputText.trim();
    const hasFile = !!selectedFile;
    if (!hasText && !hasFile) return;

    const currentText = inputText.trim();
    const currentFile = selectedFile;

    // Reset inputs immediately for fluid, responsive visual feedback
    setInputText("");
    setSelectedFile(null);
    setSending(true);

    try {
      // Run AI moderation if an image or video is attached
      if (currentFile && (currentFile.type.startsWith("image/") || currentFile.type.startsWith("video/"))) {
        const modRes = await fetch("/api/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: currentFile.dataUrl,
            fileType: currentFile.type,
            fileName: currentFile.name,
          }),
        });
        if (!modRes.ok) {
          throw new Error("AI Moderation is temporarily unavailable.");
        }
        const modData = await modRes.json();
        if (!modData.safe) {
          throw new Error(`Media Blocked by AI Moderation: ${modData.reason}`);
        }
      }

      let cleartextPayload: string;

      if (currentFile) {
        // We are sending an encrypted file payload (including an optional caption)
        const filePayloadObj = {
          __isChattyFile: true,
          fileName: currentFile.name,
          fileType: currentFile.type,
          fileSize: currentFile.size,
          fileData: currentFile.dataUrl,
          caption: currentText,
        };
        cleartextPayload = JSON.stringify(filePayloadObj);
      } else {
        // We are sending a regular plaintext message
        cleartextPayload = currentText;
      }

      // 1. Encrypt payload client-side
      const encryptedPayload = await encryptText(cleartextPayload, cryptoKey);

      // 2. Transmit to server
      const res = await fetch(`/api/rooms/${session.roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: localDisplayName,
          senderTokenHash: userTokenHash,
          encryptedText: encryptedPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Server rejected message transmission.");
      }

      await fetchMessages();
      scrollToBottom();
    } catch (err: any) {
      setPollError(err.message || "Failed to send encrypted message.");
      // Restore states on failure
      setInputText(currentText);
      setSelectedFile(currentFile);
    } finally {
      setSending(false);
    }
  };

  // Post a direct message string (useful for bots and games)
  const handleSendMessageText = async (text: string) => {
    if (!userTokenHash) return;
    try {
      const encryptedPayload = await encryptText(text, cryptoKey);
      const res = await fetch(`/api/rooms/${session.roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: localDisplayName,
          senderTokenHash: userTokenHash,
          encryptedText: encryptedPayload,
        }),
      });
      if (res.ok) {
        await fetchMessages();
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to send direct message:", err);
    }
  };

  // Submit edits to an existing message
  const handleSaveEdit = async (messageId: string) => {
    if (!editingText.trim() || savingEdit || !userTokenHash) return;

    setSavingEdit(true);
    try {
      const encryptedPayload = await encryptText(editingText.trim(), cryptoKey);

      const res = await fetch(`/api/rooms/${session.roomId}/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderTokenHash: userTokenHash,
          editedEncryptedText: encryptedPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Server rejected message edit.");
      }

      setEditingMessageId(null);
      setEditingText("");
      await fetchMessages();
    } catch (err: any) {
      console.error("Failed to update post:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId: string, isWhiteboardBypass?: boolean) => {
    try {
      const res = await fetch(`/api/rooms/${session.roomId}/messages/${messageId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderTokenHash: userTokenHash,
          isWhiteboardBypass: isWhiteboardBypass || false,
        }),
      });

      if (!res.ok) {
        throw new Error("Server rejected message deletion.");
      }

      await fetchMessages();
    } catch (err: any) {
      console.error("Failed to delete post:", err);
    }
  };

  const copyRoomInvite = () => {
    const inviteText = session.roomId;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate standard remaining time in hours for the message
  const getRemainingTime = (createdAtIso: string) => {
    const createdTime = new Date(createdAtIso).getTime();
    const expiryTime = createdTime + 24 * 60 * 60 * 1000;
    const timeLeftMs = expiryTime - Date.now();

    if (timeLeftMs <= 0) return "Expired";
    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const mins = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${mins}m remaining`;
    }
    return `${mins}m remaining`;
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-120px)] min-h-[500px] relative"
    >
      {/* Top Room Control Panel */}
      <div className="bg-slate-900/25 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-4 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        {/* Left Info Column */}
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-indigo-400 hidden sm:block">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-[10px] font-mono tracking-wider font-bold">ROOM ADDRESS:</span>
              <span className="font-mono font-bold text-xs text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                {session.roomId}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="font-mono text-slate-200 font-bold">{activeUsersCount}</span>
                <span>online</span>
              </span>
              <span className="flex items-center space-x-1.5 border-l border-slate-800 pl-4">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] tracking-wide font-medium">End-to-End Encrypted</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex items-center space-x-2 self-end md:self-auto">
          {/* Game Center trigger button */}
          <button
            onClick={() => {
              setActiveCenterGame(null);
              setShowGameCenter(true);
            }}
            className="flex items-center space-x-2 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 hover:border-indigo-500/40 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-400 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Gamepad2 className="w-3.5 h-3.5 animate-pulse" />
            <span>Play Games</span>
          </button>

          {/* Copy Invite details */}
          <button
            onClick={copyRoomInvite}
            className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Invite to Room</span>
              </>
            )}
          </button>

          {/* Secure Leave Room */}
          <button
            onClick={onLeave}
            className="flex items-center space-x-2 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 hover:border-rose-500/20 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Room</span>
          </button>
        </div>
      </div>

      {/* Network or Sync Error Banner */}
      <AnimatePresence>
        {pollError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl flex items-center justify-between text-amber-400 text-xs"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{pollError}</span>
            </div>
            <button 
              onClick={() => fetchMessages()}
              className="hover:text-amber-300 font-bold underline flex items-center space-x-1 font-mono cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Retry</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Messages Board */}
      <motion.div
        onClick={handleBoardClick}
        animate={isShaking ? {
          x: [0, -12, 12, -10, 10, -8, 8, -5, 5, -2, 2, 0],
          y: [0, 8, -8, 6, -6, 4, -4, 2, -2, 1, -1, 0],
          rotate: [0, -2, 2, -1.5, 1.5, -1, 1, -0.5, 0.5, 0]
        } : {}}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex-1 bg-slate-900/10 border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col mb-4 backdrop-blur-md shadow-2xl relative"
      >
        {/* Glowing drag-drop overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-indigo-950/80 backdrop-blur-sm border-2 border-dashed border-indigo-500/50 rounded-2xl flex flex-col items-center justify-center space-y-3 pointer-events-none"
            >
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                <Paperclip className="w-8 h-8 animate-bounce" />
              </div>
              <p className="text-sm font-bold text-slate-100 font-display">Drop file to encrypt</p>
              <p className="text-xs text-slate-400 font-sans">Images, Videos, PDFs up to 40MB</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Loading Spinner overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono tracking-wide">Connecting securely...</p>
            </div>
          </div>
        )}

        {/* Message Thread Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messagesList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-11 h-11 bg-slate-950 rounded-full border border-slate-900 flex items-center justify-center mb-4 text-indigo-400 shadow-sm">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <p className="text-sm text-slate-200 font-bold font-display tracking-tight">No messages yet</p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
                Be the first to post a message. The messages will automatically self-delete in 24 hours.
              </p>
            </div>
          ) : (
            messagesList.map((msg) => {
              const cacheKey = `${msg.id}_${msg.editedAt || "original"}`;
              const decryptedText = decryptedMap[cacheKey] || "Decrypting message...";
              const isOwnMessage = msg.senderTokenHash === userTokenHash;

              // Skip rendering real-time canvas sync messages in the main chat thread
              const isCanvasAction = (() => {
                try {
                  if (decryptedText.startsWith("{") && decryptedText.endsWith("}")) {
                    const parsed = JSON.parse(decryptedText);
                    return parsed && parsed.__isCanvasAction === true;
                  }
                } catch (e) {}
                return false;
              })();

              if (isCanvasAction) return null;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} group/msg`}
                >
                  {/* Sender & Timestamp Header */}
                  <div className="flex items-center space-x-2 mb-1.5 text-[10px] text-slate-400 px-1 font-mono">
                    <span className={`font-bold ${isOwnMessage ? "text-indigo-400" : "text-sky-400"}`}>
                      {isOwnMessage ? `${msg.senderName} (You)` : msg.senderName}
                    </span>
                    <span className="text-slate-700">•</span>
                    <span title={new Date(msg.createdAt).toLocaleString()}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {/* Message Content Container */}
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                    
                    {/* Actual Message Bubble Content */}
                    {editingMessageId === msg.id ? (
                      /* Inline Message Editor */
                      <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-3 w-72 sm:w-96 space-y-2.5 shadow-xl">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          maxLength={1000}
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 font-sans"
                        />
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingMessageId(null)}
                            className="p-1 px-2.5 rounded-lg border border-slate-850 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(msg.id)}
                            disabled={savingEdit || !editingText.trim()}
                            className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white flex items-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>{savingEdit ? "Saving..." : "Save"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Plaintext decrypted content container / File media block */
                      (() => {
                        const gamePrompt = parseGameMessage(decryptedText);
                        if (gamePrompt) {
                          return (
                            <ChatGameCard
                              prompt={gamePrompt as any}
                              isOwnMessage={isOwnMessage}
                              senderName={msg.senderName}
                              onPostResponse={async (resp) => {
                                await handleSendMessageText(resp);
                              }}
                              onJoinGame={(game) => {
                                setActiveCenterGame(game);
                                setShowGameCenter(true);
                              }}
                            />
                          );
                        }

                        const fileAttachment = parseFileMessage(decryptedText);
                        
                        if (fileAttachment) {
                          const isImage = fileAttachment.fileType.startsWith("image/");
                          const isVideo = fileAttachment.fileType.startsWith("video/");
                          
                          return (
                            <div
                              className={`rounded-2xl shadow-sm overflow-hidden flex flex-col relative border ${
                                isOwnMessage
                                  ? "bg-indigo-900/30 border-indigo-500/10 text-slate-100"
                                  : "bg-slate-950/80 border-slate-900 text-slate-100"
                              }`}
                            >
                              {/* Media / File View */}
                              {isImage ? (
                                <div className="p-1.5 relative group">
                                  <img
                                    src={fileAttachment.fileData}
                                    alt={fileAttachment.fileName}
                                    className="max-w-full max-h-[260px] rounded-xl object-contain bg-slate-950/40 border border-slate-900/30 cursor-pointer hover:opacity-95 transition-opacity"
                                    onClick={() => setLightboxFile({ name: fileAttachment.fileName, dataUrl: fileAttachment.fileData })}
                                  />
                                  {/* Fast Download Hover Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const link = document.createElement("a");
                                      link.href = fileAttachment.fileData;
                                      link.download = fileAttachment.fileName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    title="Download image"
                                    className="absolute bottom-4 right-4 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-850 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer opacity-0 group-hover:opacity-100 animate-none z-10"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : isVideo ? (
                                <div className="p-1.5 bg-black/10">
                                  <video
                                    src={fileAttachment.fileData}
                                    controls
                                    className="max-w-full max-h-[280px] rounded-xl bg-slate-950 border border-slate-900/50 shadow-inner"
                                  />
                                </div>
                              ) : (
                                /* Document / Generic File card */
                                <div className="p-4 flex items-center justify-between space-x-4 bg-slate-950/40 min-w-[240px] max-w-[340px]">
                                  <div className="flex items-center space-x-3 overflow-hidden">
                                    <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/15 text-indigo-400 rounded-xl flex-shrink-0">
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="text-left overflow-hidden">
                                      <p className="text-xs font-semibold text-slate-200 truncate pr-2" title={fileAttachment.fileName}>
                                        {fileAttachment.fileName}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                        {formatFileSize(fileAttachment.fileSize)}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.href = fileAttachment.fileData;
                                      link.download = fileAttachment.fileName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    title="Download file"
                                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                              
                              {/* Caption / Text details */}
                              {fileAttachment.caption && (
                                <div className="px-4 py-2.5 text-[13px] leading-relaxed border-t border-slate-900/30 break-words whitespace-pre-wrap">
                                  <p>{renderDecryptedTextWithBtc(fileAttachment.caption, isOwnMessage, handlePayBtc)}</p>
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        // Default regular text bubble
                        return (
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed break-words whitespace-pre-wrap shadow-sm relative w-fit max-w-full ${
                              isOwnMessage
                                ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-500/20 font-medium"
                                : "bg-slate-950/85 border border-slate-900/80 text-slate-100 rounded-tl-none"
                            }`}
                          >
                            <p>{renderDecryptedTextWithBtc(decryptedText, isOwnMessage, handlePayBtc)}</p>
                            
                            {msg.editedAt && (
                              <span className="block text-[8px] text-slate-400/80 text-right mt-1 font-mono italic">
                                Edited {new Date(msg.editedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                        );
                      })()
                    )}

                    {/* Read Receipts block */}
                    {editingMessageId !== msg.id && isOwnMessage && (() => {
                      const readers = Object.values(msg.readBy || {}) as { name: string; readAt: string }[];
                      return (
                        <div className="flex items-center justify-end space-x-1 text-[9px] text-slate-500 font-mono mt-1">
                          {readers.length > 0 ? (
                            <div className="flex items-center space-x-1 text-emerald-400" title={`Seen by: ${readers.map((u) => u.name).join(", ")}`}>
                              <span className="flex">
                                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                                <Check className="w-3 h-3 text-emerald-400 stroke-[3] -ml-1.5" />
                              </span>
                              <span>Seen by {readers.length === 1 ? readers[0].name : `${readers.length} friends`}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-slate-600">
                              <Check className="w-3 h-3" />
                              <span>Sent</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Actions Row Below Message: "edit" and "delete" text words */}
                    {editingMessageId !== msg.id && (() => {
                      const gamePrompt = parseGameMessage(decryptedText);
                      const isGameBroadcast = !!gamePrompt;
                      const fileAttachment = parseFileMessage(decryptedText);
                      const isFile = !!fileAttachment;
                      const isWhiteboardSketch = fileAttachment?.fileName.startsWith("whiteboard-sketch-");

                      const showEdit = isOwnMessage && !isFile && !isGameBroadcast;
                      const showDelete = isOwnMessage || isGameBroadcast || isWhiteboardSketch;

                      if (!showEdit && !showDelete) return null;

                      return (
                        <div className={`flex items-center space-x-2.5 mt-1 px-1 text-[11px] font-mono text-slate-400 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                          {showEdit && (
                            <button
                              onClick={() => {
                                setEditingMessageId(msg.id);
                                setEditingText(decryptedText);
                              }}
                              className="hover:text-indigo-400 transition-colors cursor-pointer font-medium"
                            >
                              edit
                            </button>
                          )}
                          {showEdit && showDelete && (
                            <span className="text-slate-600 text-[10px]">•</span>
                          )}
                          {showDelete && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="hover:text-rose-400 transition-colors cursor-pointer font-medium"
                            >
                              delete
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Message Composition Input Form */}
      <form onSubmit={handleSendMessage} className="relative">
        {/* Floating selected file preview block */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 p-3 bg-slate-950/90 border border-slate-800/80 rounded-xl flex items-center justify-between shadow-xl"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                {/* Thumbnail */}
                {selectedFile.type.startsWith("image/") ? (
                  <img
                    src={selectedFile.dataUrl}
                    alt={selectedFile.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                  />
                ) : selectedFile.type.startsWith("video/") ? (
                  <div className="w-10 h-10 rounded-lg bg-indigo-950/50 border border-indigo-800/20 flex items-center justify-center text-indigo-400">
                    <Video className="w-5 h-5 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-semibold text-slate-200 truncate pr-4">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{formatFileSize(selectedFile.size)} • {selectedFile.type || "unknown file type"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex bg-slate-950/40 border border-slate-800/80 rounded-2xl p-2.5 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all backdrop-blur-xl shadow-2xl items-center">
          {/* File input element */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
          />
          
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            title="Attach picture, video, or file"
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-900/60 rounded-xl transition-all disabled:opacity-40 cursor-pointer mr-1"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={selectedFile ? "Add a caption to the file..." : "Type message here..."}
            maxLength={1000}
            disabled={sending}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none disabled:opacity-50"
          />
          
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline px-1">
              {inputText.length}/1000
            </span>
            <button
              type="submit"
              disabled={sending || (!inputText.trim() && !selectedFile)}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed cursor-pointer font-bold"
            >
              {sending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-2.5 font-mono">
          Messages and attachments are encrypted in-browser before transit. Cleared completely after 24 hours.
        </p>
      </form>

      {/* Fullscreen Lightbox Portal overlay */}
      <AnimatePresence>
        {lightboxFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <button 
              onClick={() => setLightboxFile(null)} 
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={lightboxFile.dataUrl} 
              alt={lightboxFile.name} 
              className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl border border-slate-900/50" 
            />
            <p className="text-slate-300 mt-4 font-mono text-xs max-w-xl text-center truncate px-6">{lightboxFile.name}</p>
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = lightboxFile.dataUrl;
                link.download = lightboxFile.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="mt-4 flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Original</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bitcoin / Lightning Payment Modal overlay */}
      <AnimatePresence>
        {activeBtcInvoiceAddress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setActiveBtcInvoiceAddress(null);
                  setBtcCheckingStatus("idle");
                }} 
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="text-center space-y-2 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${
                  activeInvoiceType === "sol"
                    ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                    : activeInvoiceType === "eth"
                    ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-550"
                }`}>
                  {activeInvoiceType === "lightning" ? (
                    <Zap className="w-6 h-6 animate-pulse text-amber-550" />
                  ) : activeInvoiceType === "sol" ? (
                    <Wallet className="w-6 h-6 text-purple-400" />
                  ) : activeInvoiceType === "eth" ? (
                    <Coins className="w-6 h-6 text-sky-400" />
                  ) : (
                    <Coins className="w-6 h-6 text-amber-500" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-100 font-display">
                  {activeInvoiceType === "lightning" 
                    ? "Pay Lightning Invoice" 
                    : activeInvoiceType === "sol"
                    ? "Pay Solana Invoice"
                    : activeInvoiceType === "eth"
                    ? "Pay Ethereum Invoice"
                    : "Pay Bitcoin Invoice"
                  }
                </h3>
                <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto">
                  Scan the QR code or copy the secure, end-to-end encrypted {
                    activeInvoiceType === "lightning" 
                      ? "lightning invoice" 
                      : activeInvoiceType === "sol"
                      ? "Solana address"
                      : activeInvoiceType === "eth"
                      ? "Ethereum address"
                      : "Bitcoin address"
                  } to complete the payment.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col items-center justify-center mb-6">
                <div className="bg-white p-3 rounded-xl shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=${
                      activeInvoiceType === "sol"
                        ? "168-85-247"
                        : activeInvoiceType === "eth"
                        ? "56-189-248"
                        : "247-147-26"
                    }&data=${
                      activeInvoiceType === "lightning" 
                        ? `lightning:${activeBtcInvoiceAddress}` 
                        : activeInvoiceType === "sol"
                        ? `solana:${activeBtcInvoiceAddress}`
                        : activeInvoiceType === "eth"
                        ? `ethereum:${activeBtcInvoiceAddress}`
                        : `bitcoin:${activeBtcInvoiceAddress}`
                    }`}
                    alt="Crypto Invoice QR Code"
                    className="w-[180px] h-[180px] object-contain select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-3 uppercase tracking-wider font-bold">
                  Scan with any {
                    activeInvoiceType === "lightning" 
                      ? "Lightning" 
                      : activeInvoiceType === "sol"
                      ? "Solana"
                      : activeInvoiceType === "eth"
                      ? "Ethereum"
                      : "Bitcoin"
                  } wallet
                </p>
              </div>

              {/* Address and Interactive Action block */}
              <div className="space-y-4">
                <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between space-x-3">
                  <div className="text-left overflow-hidden flex-1">
                    <span className="text-[9px] text-slate-500 font-mono font-bold block mb-1">
                      {activeInvoiceType === "lightning" 
                        ? "LIGHTNING INVOICE STRING" 
                        : activeInvoiceType === "sol"
                        ? "SOLANA WALLET ADDRESS"
                        : activeInvoiceType === "eth"
                        ? "ETHEREUM WALLET ADDRESS"
                        : "INVOICE WALLET ADDRESS"
                      }
                    </span>
                    <p className={`text-xs font-mono truncate pr-2 ${
                      activeInvoiceType === "sol"
                        ? "text-purple-400"
                        : activeInvoiceType === "eth"
                        ? "text-sky-400"
                        : "text-amber-400"
                    }`} title={activeBtcInvoiceAddress}>
                      {activeBtcInvoiceAddress}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeBtcInvoiceAddress);
                      setBtcCopied(true);
                      setTimeout(() => setBtcCopied(false), 2000);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex-shrink-0 flex items-center justify-center min-w-[40px]"
                  >
                    {btcCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {/* Wallet buttons removed as requested */}
              </div>

              <p className="text-[10px] text-slate-500 text-center mt-6 font-mono">
                All transactions are verified client-side directly on the {
                  activeInvoiceType === "lightning" 
                    ? "Lightning network" 
                    : activeInvoiceType === "sol"
                    ? "Solana blockchain"
                    : activeInvoiceType === "eth"
                    ? "Ethereum blockchain"
                    : "blockchain"
                }.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Center Modal overlay */}
      <AnimatePresence>
        {showGameCenter && (
          <GameCenter
            onClose={() => setShowGameCenter(false)}
            localDisplayName={localDisplayName}
            onPostToChat={postGameResult}
            messagesList={messagesList}
            decryptedMap={decryptedMap}
            userTokenHash={userTokenHash}
            initialGame={activeCenterGame}
          />
        )}
      </AnimatePresence>



    </div>
  );
}
