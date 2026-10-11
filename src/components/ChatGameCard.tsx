/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, CheckCircle2, HelpCircle, Send, Shuffle, 
  HelpCircle as HelpIcon, Trophy, HeartHandshake, AlertCircle, Gamepad2, PenTool
} from "lucide-react";
import { TRUTH_DARES, TRIVIA_QUESTIONS, TriviaQuestion } from "../lib/gameData";

export interface GamePromptPayload {
  __isGamePrompt: true;
  gameType: "truthdare" | "trivia" | "challenge";
  category: string;
  type?: "truth" | "dare"; // truth or dare
  text?: string;            // truth or dare / challenge text
  target?: string;          // truth or dare
  question?: string;        // trivia
  options?: string[];       // trivia
  answerIndex?: number;     // trivia
  explanation?: string;     // trivia
  challengeGame?: "tictactoe" | "connectfour" | "rps" | "chess" | "checkers" | "canvas" | string;
}

interface ChatGameCardProps {
  prompt: GamePromptPayload;
  isOwnMessage: boolean;
  senderName: string;
  onPostResponse: (text: string) => Promise<void>;
  onJoinGame?: (gameType: string) => void;
}

export default function ChatGameCard({ prompt, isOwnMessage, senderName, onPostResponse, onJoinGame }: ChatGameCardProps) {
  // Common states
  const [loading, setLoading] = useState(false);

  // Truth or dare states
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [answerText, setAnswerText] = useState("");

  // Trivia states
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [bragged, setBragged] = useState(false);

  // Handle drawing a new Truth or Dare in the same category
  const handleDrawTruthDare = async (drawType: "truth" | "dare") => {
    if (loading) return;
    setLoading(true);
    try {
      const categoryKey = prompt.category as "friendly" | "deep" | "party";
      const pool = TRUTH_DARES[categoryKey]?.[drawType === "truth" ? "truths" : "dares"] || [];
      if (pool.length === 0) return;

      const randomText = pool[Math.floor(Math.random() * pool.length)];
      const participants = ["Someone", "The next sender", "The person to your left", "You!", "Anyone!"];
      const target = participants[Math.floor(Math.random() * participants.length)];

      const newPayload: GamePromptPayload = {
        __isGamePrompt: true,
        gameType: "truthdare",
        category: prompt.category,
        type: drawType,
        text: randomText,
        target: target,
      };

      await onPostResponse(JSON.stringify(newPayload));
    } catch (e) {
      console.error("Failed to post new Truth/Dare:", e);
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer to Truth or Dare
  const handleSubmitTDAnswer = async () => {
    if (!answerText.trim() || loading) return;
    setLoading(true);
    try {
      const formattedResponse = `🔮 Response to ${prompt.type?.toUpperCase()}: "${prompt.text}"\n💬 Answer: "${answerText.trim()}"`;
      await onPostResponse(formattedResponse);
      setAnswerText("");
      setShowAnswerInput(false);
    } catch (e) {
      console.error("Failed to post answer:", e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Trivia choice select
  const handleTriviaSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedOption(index);
    setHasAnswered(true);
  };

  // Post Trivia results to chat (Brag)
  const handleBragTrivia = async () => {
    if (selectedOption === null || bragged || loading) return;
    setLoading(true);
    try {
      const isCorrect = selectedOption === prompt.answerIndex;
      const selectedText = prompt.options?.[selectedOption] || "";
      const correctText = prompt.options?.[prompt.answerIndex!] || "";
      
      let message = "";
      if (isCorrect) {
        message = `🏆 Trivia Success! I correctly answered the question:\n"${prompt.question}"\nI picked: "${selectedText}" (Correct!)`;
      } else {
        message = `😅 Trivia Attempt! I tried the question:\n"${prompt.question}"\nI picked: "${selectedText}" (Oops! Correct was: "${correctText}")`;
      }
      await onPostResponse(message);
      setBragged(true);
    } catch (e) {
      console.error("Failed to brag:", e);
    } finally {
      setLoading(false);
    }
  };

  // Draw and post another Trivia question from the same category
  const handleNextTrivia = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const categoryQuestions = TRIVIA_QUESTIONS[prompt.category] || [];
      if (categoryQuestions.length === 0) return;

      // Try to find a different question, otherwise pick random
      const filtered = categoryQuestions.filter(q => q.question !== prompt.question);
      const chosen = filtered.length > 0 
        ? filtered[Math.floor(Math.random() * filtered.length)] 
        : categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];

      // Randomly order options on launch
      const originalOptions = chosen.options;
      const correctAnswerText = originalOptions[chosen.answerIndex];
      const shuffledOptions = [...originalOptions];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffledOptions[i];
        shuffledOptions[i] = shuffledOptions[j];
        shuffledOptions[j] = temp;
      }
      const newAnswerIndex = shuffledOptions.indexOf(correctAnswerText);

      const newPayload: GamePromptPayload = {
        __isGamePrompt: true,
        gameType: "trivia",
        category: prompt.category,
        question: chosen.question,
        options: shuffledOptions,
        answerIndex: newAnswerIndex !== -1 ? newAnswerIndex : chosen.answerIndex,
        explanation: chosen.explanation,
      };

      await onPostResponse(JSON.stringify(newPayload));
    } catch (e) {
      console.error("Failed to post next trivia question:", e);
    } finally {
      setLoading(false);
    }
  };

  // Render Truth or Dare Bubble
  if (prompt.gameType === "truthdare") {
    return (
      <div 
        id="truthdare-chat-card"
        className="w-full max-w-[340px] sm:max-w-[400px] bg-slate-950 border border-purple-500/30 rounded-2xl p-4 shadow-xl text-left overflow-hidden space-y-3.5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
              <Shuffle className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 font-display">Truth or Dare</h4>
              <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">{prompt.category} node</p>
            </div>
          </div>
          <span className="text-[8px] font-mono bg-purple-950/80 text-purple-400 border border-purple-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Active Game
          </span>
        </div>

        {/* Challenge prompt box */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-center space-y-2">
          <span className="inline-flex text-[9px] font-bold font-mono tracking-widest uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-md">
            {prompt.type === "truth" ? "🔮 TRUTH" : "⚡️ DARE"}
          </span>
          <p className="text-xs font-medium text-slate-200 leading-relaxed font-sans px-1">
            "{prompt.text}"
          </p>
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            Target: <span className="text-rose-400 font-bold">{prompt.target}</span>
          </div>
        </div>

        {/* Inline Answer Input Toggle */}
        <AnimatePresence>
          {showAnswerInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-1 overflow-hidden"
            >
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer or dare confirmation here..."
                maxLength={500}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 font-sans"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAnswerInput(false)}
                  className="px-2.5 py-1 text-[10px] font-bold text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTDAnswer}
                  disabled={!answerText.trim() || loading}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Answer</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-semibold">
          {!showAnswerInput && (
            <button
              onClick={() => setShowAnswerInput(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Answer This</span>
            </button>
          )}
          <button
            onClick={() => handleDrawTruthDare("truth")}
            disabled={loading}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
          >
            <span>🔮 Next Truth</span>
          </button>
          <button
            onClick={() => handleDrawTruthDare("dare")}
            disabled={loading}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
          >
            <span>⚡ Next Dare</span>
          </button>
        </div>
      </div>
    );
  }

  // Render Trivia Bubble
  if (prompt.gameType === "trivia") {
    return (
      <div 
        id="trivia-chat-card"
        className="w-full max-w-[340px] sm:max-w-[400px] bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 shadow-xl text-left overflow-hidden space-y-3.5"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 font-display">Trivia Challenge</h4>
              <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                {prompt.category === "tech" ? "Technology" : prompt.category === "science" ? "Science" : "Culture"} node
              </p>
            </div>
          </div>
          <span className="text-[8px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Interactive
          </span>
        </div>

        {/* Question Text */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 min-h-[60px] flex items-center justify-center text-center">
          <p className="text-xs font-semibold text-slate-200 leading-relaxed font-sans">
            {prompt.question}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-1.5">
          {prompt.options?.map((opt, i) => {
            const isCorrectIndex = i === prompt.answerIndex;
            const isSelected = i === selectedOption;

            let btnStyle = "bg-slate-900/40 border-slate-850 hover:border-emerald-500/30 text-slate-300";
            if (hasAnswered) {
              if (isCorrectIndex) {
                btnStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold";
              } else if (isSelected) {
                btnStyle = "bg-rose-500/10 border-rose-500/50 text-rose-400";
              } else {
                btnStyle = "bg-slate-950/40 border-slate-900 text-slate-600";
              }
            }

            return (
              <button
                key={i}
                disabled={hasAnswered}
                onClick={() => handleTriviaSelect(i)}
                className={`w-full py-2 px-3 border rounded-xl text-xs text-left transition-all ${btnStyle} ${!hasAnswered ? "cursor-pointer active:scale-[0.99]" : "cursor-default"}`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {hasAnswered && isCorrectIndex && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Correct Explanation block */}
        <AnimatePresence>
          {hasAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 space-y-1"
            >
              <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Explanation:</div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                {prompt.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Row */}
        {hasAnswered && (
          <div className="flex items-center space-x-2 pt-1 text-[10px] font-semibold">
            {!bragged && (
              <button
                onClick={handleBragTrivia}
                disabled={loading}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Trophy className="w-3 h-3" />
                <span>Brag about score</span>
              </button>
            )}
            <button
              onClick={handleNextTrivia}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
            >
              <Shuffle className="w-3 h-3" />
              <span>Next</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Render Challenge Lobby card
  if (prompt.gameType === "challenge") {
    let gameName = "Rock Paper Scissors";
    let gameIcons = "✊✋";

    if (prompt.challengeGame === "connectfour") {
      gameName = "Connect Four";
      gameIcons = "🔴🟡";
    } else if (prompt.challengeGame === "tictactoe") {
      gameName = "Tic-Tac-Toe";
      gameIcons = "❌⭕";
    } else if (prompt.challengeGame === "chess") {
      gameName = "Chess";
      gameIcons = "👑♟️";
    } else if (prompt.challengeGame === "checkers") {
      gameName = "Checkers";
      gameIcons = "⚪🔴";
    } else if (prompt.challengeGame === "canvas") {
      gameName = "Canvas";
      gameIcons = "✏️🎨";
    }

    const isCanvas = prompt.challengeGame === "canvas";

    return (
      <div 
        id="challenge-chat-card"
        className="w-full max-w-[340px] sm:max-w-[400px] bg-slate-950 border border-indigo-500/35 rounded-2xl p-4.5 shadow-xl text-left space-y-3.5 relative overflow-hidden"
      >
        {/* Subtle glowing mesh in background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-400">
              {isCanvas ? (
                <PenTool className="w-4 h-4 animate-bounce text-rose-400" />
              ) : (
                <Gamepad2 className="w-4 h-4 animate-bounce" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 font-display">
                {isCanvas ? "Canvas" : "Multiplayer Game"}
              </h4>
              <p className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest">
                {isCanvas ? "Interactive Board" : "Game Invite"}
              </p>
            </div>
          </div>
          <span className="text-[8.5px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {isCanvas ? "Active Board" : "Waiting..."}
          </span>
        </div>

        {/* Invite Prompt Details */}
        <div className="bg-slate-900/40 border border-slate-850/80 rounded-xl p-3.5 text-center space-y-3 relative z-10">
          <span className="inline-flex text-[10px] font-black font-mono tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2.5 py-1 rounded-lg">
            {gameIcons} {gameName.toUpperCase()}
          </span>
          <p className="text-[12.5px] font-medium text-slate-200 leading-relaxed font-sans px-1">
            {isCanvas ? (
              `"${senderName} has opened a collaborative Canvas board! Join in to draw, doodle, and sketch together!"`
            ) : (
              `"${senderName} has started a ${gameName} game and is waiting for a challenger!"`
            )}
          </p>
          <div className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider">
            {isCanvas ? (
              <span className="text-emerald-400 font-bold">Open Collaboration (All Welcome)</span>
            ) : (
              <span>Required: <span className="text-amber-400 font-bold">1 Opponent</span></span>
            )}
          </div>
        </div>

        {/* Action button */}
        {onJoinGame && (
          <button
            onClick={() => onJoinGame(prompt.challengeGame || "connectfour")}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/15 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99] relative z-10"
          >
            {isCanvas ? <PenTool className="w-3.5 h-3.5" /> : <Gamepad2 className="w-3.5 h-3.5" />}
            <span>{isCanvas ? "Join Board" : "Join & Play Now"}</span>
          </button>
        )}
      </div>
    );
  }

  return null;
}
