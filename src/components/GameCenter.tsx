/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Gamepad2, Trophy, User, RotateCcw, HelpCircle, 
  Shuffle, HelpCircle as HelpIcon, ArrowLeft, Timer, 
  CheckCircle2, AlertCircle, Sparkles, Send, Play, Dice5, UserCheck,
  Palette, Paintbrush, PenTool, Crown, Undo, Trash2, Camera, Brush, Eraser, MousePointer
} from "lucide-react";
import { Message } from "../types";
import { TRIVIA_QUESTIONS, TriviaQuestion } from "../lib/gameData";
import GameCenterChat from "./GameCenterChat";

// Types
type GameType = "tictactoe" | "connectfour" | "rps" | "trivia" | "chess" | "checkers" | "canvas";

interface GameCenterProps {
  onClose: () => void;
  localDisplayName: string;
  onPostToChat?: (text: string) => void;
  messagesList?: Message[];
  decryptedMap?: Record<string, string>;
  userTokenHash?: string;
  initialGame?: GameType | null;
}

export default function GameCenter({ 
  onClose, 
  localDisplayName, 
  onPostToChat,
  messagesList = [],
  decryptedMap = {},
  userTokenHash = "",
  initialGame = null
}: GameCenterProps) {
  const [activeGame, setActiveGame] = useState<GameType | null>(initialGame);

  useEffect(() => {
    if (initialGame !== undefined) {
      setActiveGame(initialGame);
    }
  }, [initialGame]);

  return (
    <div className="fixed inset-0 z-50 bg-[#060811]/95 backdrop-blur-xl flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="border-b border-slate-850 px-6 py-4 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Gamepad2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-md font-bold text-slate-100 font-display tracking-tight">Chatty Game Center</h2>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white transition-all cursor-pointer shadow-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {!activeGame ? (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-6"
              >
                {/* 1. Tic-Tac-Toe Card */}
                <GameCard
                  title="Tic-Tac-Toe"
                  description="Classic 3x3 strategic grid."
                  icon={<div className="font-display font-black text-xl text-indigo-400 tracking-wider">X O</div>}
                  badge="Popular"
                  onClick={() => setActiveGame("tictactoe")}
                />

                {/* 2. Connect Four Card */}
                <GameCard
                  title="Connect Four"
                  description="Drop colored chips to line up four vertically, horizontally, or diagonally."
                  icon={<div className="flex space-x-1"><div className="w-3.5 h-3.5 rounded-full bg-rose-500" /><div className="w-3.5 h-3.5 rounded-full bg-amber-400" /></div>}
                  badge="Strategic"
                  onClick={() => setActiveGame("connectfour")}
                />

                {/* 3. Rock, Paper, Scissors Card */}
                <GameCard
                  title="Rock Paper Scissors"
                  description="The ultimate decider. Choose wisely, read your opponent, and win the rounds."
                  icon={<div className="text-xl">✊ ✋ ✌️</div>}
                  badge="Classic"
                  onClick={() => setActiveGame("rps")}
                />

                {/* 4. Trivia Challenge Card */}
                <GameCard
                  title="Trivia Challenge"
                  description="Test your brain on Tech, Science, and Pop Culture."
                  icon={<HelpCircle className="w-5 h-5 text-emerald-400" />}
                  badge="Brain"
                  onClick={() => setActiveGame("trivia")}
                />

                {/* 5. Chess Card */}
                <GameCard
                  title="Chess"
                  description="Classic board game of kings and queens. Command your pieces."
                  icon={<Crown className="w-5 h-5 text-amber-400" />}
                  badge="Classic"
                  onClick={() => setActiveGame("chess")}
                />

                {/* 6. Checkers Card */}
                <GameCard
                  title="Checkers"
                  description="Diagonal jumps and crown-captures. Classic board action."
                  icon={<div className="text-xl">🔴⚪</div>}
                  badge="Strategic"
                  onClick={() => setActiveGame("checkers")}
                />

                {/* 8. Canvas Card */}
                <GameCard
                  title="Canvas"
                  description="Doodle, sketch, or annotate together in real time on a shared whiteboard."
                  icon={<PenTool className="w-5 h-5 text-rose-400" />}
                  badge="Collab"
                  onClick={() => setActiveGame("canvas")}
                />
              </motion.div>
            ) : (
              <motion.div
                key="game_container"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 flex flex-col justify-center py-4"
              >
                {/* Back Button */}
                <button
                  onClick={() => setActiveGame(null)}
                  className="self-start mb-6 flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors py-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Menu</span>
                </button>

                {/* Render Selected Game */}
                {activeGame === "tictactoe" && (
                  <TicTacToeGame 
                    localDisplayName={localDisplayName} 
                    onPostToChat={onPostToChat} 
                    messagesList={messagesList}
                    decryptedMap={decryptedMap}
                    userTokenHash={userTokenHash}
                  />
                )}
                {activeGame === "connectfour" && (
                  <ConnectFourGame 
                    localDisplayName={localDisplayName} 
                    onPostToChat={onPostToChat} 
                    messagesList={messagesList}
                    decryptedMap={decryptedMap}
                    userTokenHash={userTokenHash}
                  />
                )}
                {activeGame === "rps" && (
                  <RpsGame 
                    localDisplayName={localDisplayName} 
                    onPostToChat={onPostToChat} 
                    messagesList={messagesList}
                    decryptedMap={decryptedMap}
                    userTokenHash={userTokenHash}
                  />
                )}
                {activeGame === "trivia" && (
                  <TriviaGame localDisplayName={localDisplayName} onPostToChat={onPostToChat} />
                )}
                {activeGame === "chess" && (
                  <ChessGame 
                    localDisplayName={localDisplayName} 
                    onPostToChat={onPostToChat} 
                    messagesList={messagesList}
                    decryptedMap={decryptedMap}
                    userTokenHash={userTokenHash}
                  />
                )}
                {activeGame === "checkers" && (
                  <CheckersGame 
                    localDisplayName={localDisplayName} 
                    onPostToChat={onPostToChat} 
                    messagesList={messagesList}
                    decryptedMap={decryptedMap}
                    userTokenHash={userTokenHash}
                  />
                )}

                {activeGame === "canvas" && (
                  <CanvasGame 
                    localDisplayName={localDisplayName} 
                    onPostToChat={onPostToChat} 
                    messagesList={messagesList}
                    decryptedMap={decryptedMap}
                    userTokenHash={userTokenHash}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// CARD COMPONENT
// ----------------------------------------------------
interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  onClick: () => void;
}

function GameCard({ title, description, icon, badge, onClick }: GameCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-colors">
            {icon}
          </div>
          <span className="text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-100 font-display group-hover:text-indigo-300 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {description}
          </p>
        </div>
      </div>
      <div className="pt-5 flex items-center justify-end">
        <span className="text-[10px] font-mono text-indigo-400 font-bold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
          Play Game →
        </span>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------
// GAME 1: TIC TAC TOE
// ----------------------------------------------------
function TicTacToeGame({ 
  localDisplayName, 
  onPostToChat,
  messagesList = [],
  decryptedMap = {},
  userTokenHash = ""
}: { 
  localDisplayName: string; 
  onPostToChat?: (text: string) => void;
  messagesList?: Message[];
  decryptedMap?: Record<string, string>;
  userTokenHash?: string;
}) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);

  const checkWinner = (grid: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
        return { winner: grid[a], line };
      }
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const nextBoard = [...board];
    const currentSymbol = isXNext ? "X" : "O";
    nextBoard[index] = currentSymbol;
    setBoard(nextBoard);

    const winResult = checkWinner(nextBoard);
    if (winResult) {
      setWinner(winResult.winner);
      setWinLine(winResult.line);
      return;
    }

    if (nextBoard.every(cell => cell !== null)) {
      setWinner("Draw");
      return;
    }

    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinLine(null);
  };

  const handleShareResult = () => {
    if (!winner || !onPostToChat) return;
    let message = "";
    if (winner === "Draw") {
      message = `🤝 Tic-Tac-Toe match ended in a DRAW between ${localDisplayName} and Player 2`;
    } else {
      const victor = winner === "X" ? localDisplayName : "Player 2";
      message = `🏆 Tic-Tac-Toe Victory! ${victor} won the match!`;
    }
    onPostToChat(message);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-center mb-6">
        <h3 className="text-sm font-bold font-display text-slate-100 flex items-center space-x-2">
          <span>Tic-Tac-Toe</span>
        </h3>
      </div>

      {/* Board Status */}
      <div className="mb-6 font-mono text-xs text-slate-400 text-center">
        {winner ? (
          winner === "Draw" ? (
            <span className="text-amber-400 font-bold">IT'S A DRAW!</span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>VICTORY FOR {winner === "X" ? "X" : "O"}!</span>
            </span>
          )
        ) : (
          <span>Turn: <strong className="text-indigo-400">{isXNext ? "X" : "O"}</strong> ({isXNext ? localDisplayName : "Player 2"})</span>
        )}
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-3.5 w-64 h-64 bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
        {board.map((cell, i) => {
          const isWinningCell = winLine?.includes(i);
          return (
            <motion.button
              whileTap={{ scale: cell || winner ? 1 : 0.92 }}
              key={i}
              onClick={() => handleCellClick(i)}
              disabled={!!cell || !!winner}
              className={`w-full h-full rounded-xl flex items-center justify-center text-2xl font-black font-display border transition-all ${
                isWinningCell 
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                  : cell === "X"
                  ? "bg-indigo-500/5 border-indigo-500/10 text-indigo-400"
                  : cell === "O"
                  ? "bg-rose-500/5 border-rose-500/10 text-rose-400"
                  : "bg-slate-900/50 border-slate-850 hover:border-slate-700 cursor-pointer text-transparent"
              }`}
            >
              {cell}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Controls */}
      <div className="mt-6 flex space-x-3 w-full">
        <button
          onClick={resetGame}
          className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>

        {winner && onPostToChat && (
          <button
            onClick={handleShareResult}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post to Chat</span>
          </button>
        )}
      </div>

      {onPostToChat && !winner && (
        <button
          onClick={() => {
            const payload = {
              __isGamePrompt: true,
              gameType: "challenge",
              challengeGame: "tictactoe"
            };
            onPostToChat(JSON.stringify(payload));
          }}
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 hover:from-indigo-600/20 hover:to-purple-600/20 border border-indigo-500/15 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <Gamepad2 className="w-3.5 h-3.5 animate-pulse" />
          <span>📢 Invite Room to Tic-Tac-Toe</span>
        </button>
      )}

      {/* Game spectator chat */}
      {onPostToChat && (
        <GameCenterChat
          messagesList={messagesList}
          decryptedMap={decryptedMap}
          userTokenHash={userTokenHash}
          localDisplayName={localDisplayName}
          onPostMessage={async (text) => {
            onPostToChat(text);
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// GAME 2: CONNECT FOUR
// ----------------------------------------------------
function ConnectFourGame({ 
  localDisplayName, 
  onPostToChat,
  messagesList = [],
  decryptedMap = {},
  userTokenHash = ""
}: { 
  localDisplayName: string; 
  onPostToChat?: (text: string) => void;
  messagesList?: Message[];
  decryptedMap?: Record<string, string>;
  userTokenHash?: string;
}) {
  const COLS = 7;
  const ROWS = 6;
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [isRedNext, setIsRedNext] = useState(true); // Red is 'R', Yellow is 'Y'
  const [winner, setWinner] = useState<string | null>(null);
  const [winningCoords, setWinningCoords] = useState<[number, number][] | null>(null);

  const checkWinner = (board: (string | null)[][]) => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const val = board[r][c];
        if (val && val === board[r][c+1] && val === board[r][c+2] && val === board[r][c+3]) {
          return { winner: val, coords: [[r, c], [r, c+1], [r, c+2], [r, c+3]] as [number, number][] };
        }
      }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) {
        const val = board[r][c];
        if (val && val === board[r+1][c] && val === board[r+2][c] && val === board[r+3][c]) {
          return { winner: val, coords: [[r, c], [r+1, c], [r+2, c], [r+3, c]] as [number, number][] };
        }
      }
    }
    // Diagonal Up-Right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const val = board[r][c];
        if (val && val === board[r-1][c+1] && val === board[r-2][c+2] && val === board[r-3][c+3]) {
          return { winner: val, coords: [[r, c], [r-1, c+1], [r-2, c+2], [r-3, c+3]] as [number, number][] };
        }
      }
    }
    // Diagonal Down-Right
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const val = board[r][c];
        if (val && val === board[r+1][c+1] && val === board[r+2][c+2] && val === board[r+3][c+3]) {
          return { winner: val, coords: [[r, c], [r+1, c+1], [r+2, c+2], [r+3, c+3]] as [number, number][] };
        }
      }
    }
    return null;
  };

  const makeMove = (colIndex: number) => {
    if (winner) return;

    // Find lowest empty cell in this column
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][colIndex] === null) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) return; // Column is full

    const nextGrid = grid.map(row => [...row]);
    const currentPiece = isRedNext ? "R" : "Y";
    nextGrid[targetRow][colIndex] = currentPiece;
    setGrid(nextGrid);

    const winResult = checkWinner(nextGrid);
    if (winResult) {
      setWinner(winResult.winner);
      setWinningCoords(winResult.coords);
      return;
    }

    const isDraw = nextGrid.every(row => row.every(cell => cell !== null));
    if (isDraw) {
      setWinner("Draw");
      return;
    }

    setIsRedNext(!isRedNext);
  };

  const resetGame = () => {
    setGrid(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setIsRedNext(true);
    setWinner(null);
    setWinningCoords(null);
  };

  const handleShareResult = () => {
    if (!winner || !onPostToChat) return;
    let message = "";
    if (winner === "Draw") {
      message = `🤝 Connect Four match ended in a DRAW between ${localDisplayName} and Player 2`;
    } else {
      const victor = winner === "R" ? localDisplayName : "Player 2";
      message = `🏆 Connect Four Victory! ${victor} won the match!`;
    }
    onPostToChat(message);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full flex items-center justify-center mb-5">
        <h3 className="text-sm font-bold font-display text-slate-100">Connect Four</h3>
      </div>

      {/* Board Status */}
      <div className="mb-4 font-mono text-xs text-slate-400 text-center">
        {winner ? (
          winner === "Draw" ? (
            <span className="text-amber-400 font-bold">IT'S A DRAW!</span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center justify-center space-x-1.5 animate-bounce">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{winner === "R" ? "RED" : "YELLOW"} PLAYER WINS!</span>
            </span>
          )
        ) : (
          <div className="flex items-center space-x-2">
            <span>Turn:</span>
            <div className={`w-3 h-3 rounded-full ${isRedNext ? "bg-rose-500 shadow-rose-500/50" : "bg-amber-400 shadow-amber-400/50"} shadow-lg animate-pulse`} />
            <span className="font-bold">{isRedNext ? localDisplayName : "Player 2"}</span>
          </div>
        )}
      </div>

      {/* Grid Canvas */}
      <div className="bg-indigo-950 border border-indigo-900 rounded-2xl p-4 shadow-xl">
        {/* Hover Arrow helpers */}
        <div className="grid grid-cols-7 gap-2.5 mb-2 px-1">
          {Array(COLS).fill(0).map((_, c) => {
            const isColFull = grid[0][c] !== null;
            return (
              <button
                key={c}
                disabled={isColFull || !!winner}
                onClick={() => makeMove(c)}
                className={`text-center py-1 rounded transition-all text-sm font-bold flex items-center justify-center h-6 ${
                  isColFull ? "text-slate-600 cursor-not-allowed" : "text-indigo-400 hover:text-white hover:bg-indigo-900/50 cursor-pointer"
                }`}
              >
                ↓
              </button>
            );
          })}
        </div>

        {/* Vertical drop grid */}
        <div className="grid grid-rows-6 gap-2.5">
          {grid.map((row, r) => (
            <div key={r} className="grid grid-cols-7 gap-2.5">
              {row.map((cell, c) => {
                const isWinningCircle = winningCoords?.some(([wr, wc]) => wr === r && wc === c);
                return (
                  <div
                    key={c}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950 border border-slate-900/80 flex items-center justify-center relative overflow-hidden"
                  >
                    {cell === "R" && (
                      <motion.div
                        initial={{ y: -150, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 150, damping: 15 }}
                        className={`w-full h-full rounded-full bg-rose-500 shadow-md ${isWinningCircle ? "ring-4 ring-emerald-400 animate-pulse" : ""}`}
                      />
                    )}
                    {cell === "Y" && (
                      <motion.div
                        initial={{ y: -150, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 150, damping: 15 }}
                        className={`w-full h-full rounded-full bg-amber-400 shadow-md ${isWinningCircle ? "ring-4 ring-emerald-400 animate-pulse" : ""}`}
                      />
                    )}
                    {cell === null && (
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center shadow-inner" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex space-x-3 w-full max-w-xs">
        <button
          onClick={resetGame}
          className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {winner && onPostToChat && (
          <button
            onClick={handleShareResult}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        )}
      </div>

      {onPostToChat && !winner && (
        <button
          onClick={() => {
            const payload = {
              __isGamePrompt: true,
              gameType: "challenge",
              challengeGame: "connectfour"
            };
            onPostToChat(JSON.stringify(payload));
          }}
          className="w-full max-w-xs mt-3 py-2.5 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 hover:from-indigo-600/20 hover:to-purple-600/20 border border-indigo-500/15 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <Gamepad2 className="w-3.5 h-3.5 animate-pulse" />
          <span>📢 Invite Room to Connect Four</span>
        </button>
      )}

      {/* Game spectator chat */}
      {onPostToChat && (
        <GameCenterChat
          messagesList={messagesList}
          decryptedMap={decryptedMap}
          userTokenHash={userTokenHash}
          localDisplayName={localDisplayName}
          onPostMessage={async (text) => {
            onPostToChat(text);
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// GAME 3: ROCK PAPER SCISSORS
// ----------------------------------------------------
const RPS_CHOICES = [
  { name: "rock", label: "Rock", icon: "✊", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
  { name: "paper", label: "Paper", icon: "✋", color: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
  { name: "scissors", label: "Scissors", icon: "✌️", color: "bg-purple-500/10 border-purple-500/20 text-purple-400" }
];

function RpsGame({ 
  localDisplayName, 
  onPostToChat,
  messagesList = [],
  decryptedMap = {},
  userTokenHash = ""
}: { 
  localDisplayName: string; 
  onPostToChat?: (text: string) => void;
  messagesList?: Message[];
  decryptedMap?: Record<string, string>;
  userTokenHash?: string;
}) {
  const [p1Choice, setP1Choice] = useState<string | null>(null);
  const [p2Choice, setP2Choice] = useState<string | null>(null);
  const [score, setScore] = useState({ p1Wins: 0, p2Wins: 0, ties: 0 });
  const [round, setRound] = useState(1);
  const [isP2Turn, setIsP2Turn] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const determineOutcome = (p1: string, p2: string) => {
    if (p1 === p2) return "tie";
    if (
      (p1 === "rock" && p2 === "scissors") ||
      (p1 === "paper" && p2 === "rock") ||
      (p1 === "scissors" && p2 === "paper")
    ) {
      return "p1";
    }
    return "p2";
  };

  const handleSelect = (choice: string) => {
    if (isRevealed) return;

    if (!isP2Turn) {
      setP1Choice(choice);
      setIsP2Turn(true);
    } else {
      setP2Choice(choice);
      const outcome = determineOutcome(p1Choice!, choice);
      
      setScore(prev => {
        const nextScore = { ...prev };
        if (outcome === "p1") nextScore.p1Wins += 1;
        else if (outcome === "p2") nextScore.p2Wins += 1;
        else nextScore.ties += 1;
        return nextScore;
      });

      setIsRevealed(true);
    }
  };

  const handleNextRound = () => {
    setP1Choice(null);
    setP2Choice(null);
    setIsP2Turn(false);
    setIsRevealed(false);
    setRound(prev => prev + 1);
  };

  const resetRps = () => {
    setP1Choice(null);
    setP2Choice(null);
    setIsP2Turn(false);
    setIsRevealed(false);
    setScore({ p1Wins: 0, p2Wins: 0, ties: 0 });
    setRound(1);
  };

  const handleShareResult = () => {
    if (!onPostToChat) return;
    const msg = `✊✋✌️ RPS Scorecard: ${localDisplayName} has won ${score.p1Wins} matches, lost ${score.p2Wins}, and tied ${score.ties} matches against Player 2 in ${round} rounds!`;
    onPostToChat(msg);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
      {/* Header */}
      <h3 className="text-sm font-bold font-display text-slate-100 mb-1">Rock Paper Scissors</h3>
      <p className="text-[9px] font-mono text-indigo-400 mb-5 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-1 rounded-lg">Round {round}</p>

      {/* Score HUD */}
      <div className="grid grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850 w-full mb-6 text-center">
        <div>
          <span className="text-[9px] font-mono text-slate-500 block">YOU</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">{score.p1Wins}</span>
        </div>
        <div className="border-x border-slate-850">
          <span className="text-[9px] font-mono text-slate-500 block">TIES</span>
          <span className="text-sm font-bold text-amber-400 font-mono">{score.ties}</span>
        </div>
        <div>
          <span className="text-[9px] font-mono text-slate-500 block">PLAYER 2</span>
          <span className="text-sm font-bold text-rose-400 font-mono">{score.p2Wins}</span>
        </div>
      </div>

      {/* Battle Stage */}
      <div className="h-28 w-full flex items-center justify-around mb-6 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 relative overflow-hidden">
        {/* Player side */}
        <div className="text-center">
          <span className="text-[9px] font-mono text-slate-500 block mb-2">{localDisplayName.toUpperCase()}</span>
          {p1Choice ? (
            isRevealed ? (
              <div className="text-3xl animate-bounce">
                {RPS_CHOICES.find(c => c.name === p1Choice)?.icon}
              </div>
            ) : (
              <div className="text-xs text-emerald-400 font-mono font-bold animate-pulse">LOCKED 🔒</div>
            )
          ) : (
            <div className="text-2xl text-slate-600 animate-pulse">?</div>
          )}
        </div>

        {/* VERSUS Line */}
        <div className="text-[10px] font-mono text-slate-600 font-bold">VS</div>

        {/* Bot/P2 side */}
        <div className="text-center">
          <span className="text-[9px] font-mono text-slate-500 block mb-2">PLAYER 2</span>
          {p2Choice ? (
            isRevealed ? (
              <div className="text-3xl animate-bounce">
                {RPS_CHOICES.find(c => c.name === p2Choice)?.icon}
              </div>
            ) : (
              <div className="text-xs text-emerald-400 font-mono font-bold animate-pulse">LOCKED 🔒</div>
            )
          ) : (
            <div className="text-2xl text-slate-600 animate-pulse">?</div>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div className="h-8 mb-6 font-display font-bold text-center text-sm flex items-center justify-center">
        {!p1Choice && <span className="text-indigo-400 font-mono text-xs uppercase tracking-wider">{localDisplayName}'s Turn (Select below)</span>}
        {p1Choice && !p2Choice && <span className="text-rose-400 font-mono text-xs uppercase tracking-wider">Player 2's Turn (Pass device)</span>}
        {isRevealed && p1Choice && p2Choice && (
          determineOutcome(p1Choice, p2Choice) === "p1" ? (
            <span className="text-emerald-400">🔥 {localDisplayName.toUpperCase()} WINS THE ROUND!</span>
          ) : determineOutcome(p1Choice, p2Choice) === "p2" ? (
            <span className="text-rose-400">💀 PLAYER 2 WINS THE ROUND!</span>
          ) : (
            <span className="text-amber-400">🤝 IT'S A TIE ROUND!</span>
          )
        )}
      </div>

      {/* Actions */}
      {!isRevealed ? (
        <div className="grid grid-cols-3 gap-3 w-full">
          {RPS_CHOICES.map((choice) => (
            <button
              key={choice.name}
              onClick={() => handleSelect(choice.name)}
              className={`py-4 rounded-2xl border flex flex-col items-center justify-center space-y-1 hover:border-indigo-500 transition-all cursor-pointer active:scale-95 ${choice.color}`}
            >
              <span className="text-xl">{choice.icon}</span>
              <span className="text-[10px] font-semibold">{choice.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={handleNextRound}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Next Round</span>
        </button>
      )}

      {/* Score utilities */}
      <div className="mt-6 flex space-x-3 w-full">
        <button
          onClick={resetRps}
          className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-mono text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          Reset Stats
        </button>
        {(score.p1Wins > 0 || score.p2Wins > 0) && onPostToChat && (
          <button
            onClick={handleShareResult}
            className="flex-1 py-2 bg-slate-950 hover:bg-indigo-950/40 border border-slate-850 hover:border-indigo-900 rounded-xl text-[10px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Post Scorecard
          </button>
        )}
      </div>

      {onPostToChat && (
        <button
          onClick={() => {
            const payload = {
              __isGamePrompt: true,
              gameType: "challenge",
              challengeGame: "rps"
            };
            onPostToChat(JSON.stringify(payload));
          }}
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 hover:from-indigo-600/20 hover:to-purple-600/20 border border-indigo-500/15 hover:border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <Gamepad2 className="w-3.5 h-3.5 animate-pulse" />
          <span>📢 Invite Room to RPS Match</span>
        </button>
      )}

      {/* Game spectator chat */}
      {onPostToChat && (
        <GameCenterChat
          messagesList={messagesList}
          decryptedMap={decryptedMap}
          userTokenHash={userTokenHash}
          localDisplayName={localDisplayName}
          onPostMessage={async (text) => {
            onPostToChat(text);
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// GAME 4: TRIVIA CHALLENGE (Multiplayer Only)
// ----------------------------------------------------
function TriviaGame({ localDisplayName, onPostToChat }: { localDisplayName: string; onPostToChat?: (text: string) => void }) {
  const [lastLaunchedCategory, setLastLaunchedCategory] = useState<string | null>(null);

  const handleLaunchTriviaInChat = (cat: "tech" | "science" | "culture") => {
    if (!onPostToChat) return;
    const qList = TRIVIA_QUESTIONS[cat] || [];
    if (qList.length === 0) return;
    const chosen = qList[Math.floor(Math.random() * qList.length)];

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

    const payload = {
      __isGamePrompt: true,
      gameType: "trivia",
      category: cat,
      question: chosen.question,
      options: shuffledOptions,
      answerIndex: newAnswerIndex !== -1 ? newAnswerIndex : chosen.answerIndex,
      explanation: chosen.explanation,
    };
    onPostToChat(JSON.stringify(payload));
    
    // Show success feedback
    const catName = cat === "tech" ? "Cryptography & Tech" : cat === "science" ? "Universal Science" : "Pop Culture & History";
    setLastLaunchedCategory(catName);
    setTimeout(() => {
      setLastLaunchedCategory(null);
    }, 4000);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
      <h3 className="text-sm font-bold font-display text-slate-100 flex items-center space-x-2 mb-2">
        <HelpIcon className="w-4 h-4 text-emerald-400" />
        <span>Multiplayer Trivia</span>
      </h3>
      
      <p className="text-xs text-slate-400 font-sans text-center leading-relaxed mb-6">
        Select a category below to post a fresh Trivia challenge directly to the chat room for everyone to compete!
      </p>

      {lastLaunchedCategory && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center"
        >
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400 animate-bounce" />
            <span>Successfully added {lastLaunchedCategory} Trivia to room!</span>
          </p>
        </motion.div>
      )}

      <div className="flex flex-col space-y-4 w-full">
        {/* Tech */}
        <button
          onClick={() => handleLaunchTriviaInChat("tech")}
          className="group text-left p-4 bg-gradient-to-br from-indigo-950/40 to-slate-950/50 hover:from-indigo-950/60 hover:to-slate-950/80 border border-indigo-500/15 hover:border-indigo-500/40 rounded-2xl transition-all cursor-pointer shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-indigo-300 group-hover:text-indigo-200 transition-colors">💻 Cryptography & Tech</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md">ADD TO ROOM</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal group-hover:text-slate-300 transition-colors">
            Post a trivia question about encryption, cybersecurity, computer science, and tech lore.
          </p>
        </button>

        {/* Science */}
        <button
          onClick={() => handleLaunchTriviaInChat("science")}
          className="group text-left p-4 bg-gradient-to-br from-rose-950/40 to-slate-950/50 hover:from-rose-950/60 hover:to-slate-950/80 border border-rose-500/15 hover:border-rose-500/40 rounded-2xl transition-all cursor-pointer shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-rose-300 group-hover:text-rose-200 transition-colors">⚛️ Universal Science</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-md">ADD TO ROOM</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal group-hover:text-slate-300 transition-colors">
            Probe the laws of physics, chemical properties, biology, and math with a room-wide science node.
          </p>
        </button>

        {/* Pop Culture */}
        <button
          onClick={() => handleLaunchTriviaInChat("culture")}
          className="group text-left p-4 bg-gradient-to-br from-purple-950/40 to-slate-950/50 hover:from-purple-950/60 hover:to-slate-950/80 border border-purple-500/15 hover:border-purple-500/40 rounded-2xl transition-all cursor-pointer shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-purple-300 group-hover:text-purple-200 transition-colors">🎬 Pop Culture & History</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md">ADD TO ROOM</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal group-hover:text-slate-300 transition-colors">
            Test the group on historical events, pop culture landmarks, cinema, music, and art.
          </p>
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// GAME 5: CHESS GAME
// ----------------------------------------------------
function ChessGame({ 
  localDisplayName, 
  onPostToChat,
  messagesList = [],
  decryptedMap = {},
  userTokenHash = ""
}: { 
  localDisplayName: string; 
  onPostToChat?: (text: string) => void;
  messagesList?: Message[];
  decryptedMap?: Record<string, string>;
  userTokenHash?: string;
}) {
  type ChessPiece = { type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k'; color: 'w' | 'b' } | null;
  
  const initialChessBoard = (): ChessPiece[][] => {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const backRow: ('r' | 'n' | 'b' | 'q' | 'k' | 'b' | 'n' | 'r')[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (let col = 0; col < 8; col++) {
      board[0][col] = { type: backRow[col], color: 'b' };
      board[1][col] = { type: 'p', color: 'b' };
      board[6][col] = { type: 'p', color: 'w' };
      board[7][col] = { type: backRow[col], color: 'w' };
    }
    return board;
  };

  const [board, setBoard] = useState<ChessPiece[][]>(initialChessBoard());
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const resetGame = () => {
    setBoard(initialChessBoard());
    setTurn('w');
    setSelected(null);
    setWinner(null);
  };

  const handleCellClick = (r: number, c: number) => {
    if (winner) return;

    const piece = board[r][c];

    if (!selected) {
      if (piece && piece.color === turn) {
        setSelected({ r, c });
      }
    } else {
      const originPiece = board[selected.r][selected.c];
      
      if (piece && piece.color === turn) {
        if (selected.r === r && selected.c === c) {
          setSelected(null);
        } else {
          setSelected({ r, c });
        }
        return;
      }

      const nextBoard = board.map(row => [...row]);
      nextBoard[r][c] = originPiece;
      nextBoard[selected.r][selected.c] = null;
      
      setBoard(nextBoard);
      setSelected(null);

      if (piece && piece.type === 'k') {
        setWinner(turn === 'w' ? 'White' : 'Black');
        return;
      }

      setTurn(turn === 'w' ? 'b' : 'w');
    }
  };

  const handleShareResult = () => {
    if (!winner || !onPostToChat) return;
    const msg = `👑 Chess match complete! ${winner === 'White' ? localDisplayName : "Opponent"} achieved victory by capturing the King!`;
    onPostToChat(msg);
  };

  const PIECE_GLYPHS: Record<'w' | 'b', Record<string, string>> = {
    w: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
    b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-center mb-6">
        <h3 className="text-sm font-bold font-display text-slate-100 flex items-center space-x-2">
          <span>Chess</span>
        </h3>
      </div>

      <div className="mb-6 font-mono text-[10px] text-slate-400 text-center">
        {winner ? (
          <span className="text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>VICTORY FOR {winner.toUpperCase()}!</span>
          </span>
        ) : (
          <span>Turn: <strong className={turn === 'w' ? "text-amber-400" : "text-indigo-400"}>{turn === 'w' ? "White" : "Black"}</strong> ({turn === 'w' ? localDisplayName : "Player 2"})</span>
        )}
      </div>

      <div className="grid grid-cols-8 gap-0.5 w-64 h-64 bg-slate-950 p-2 rounded-2xl border border-slate-850 overflow-hidden">
        {board.map((row, r) => 
          row.map((cell, c) => {
            const isDark = (r + c) % 2 === 1;
            const isSelected = selected && selected.r === r && selected.c === c;
            const glyph = cell ? PIECE_GLYPHS[cell.color][cell.type] : "";
            
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-7.5 h-7.5 flex items-center justify-center text-xl transition-all cursor-pointer relative ${
                  isSelected 
                    ? "bg-amber-500/30 border border-amber-400 z-10" 
                    : isDark 
                    ? "bg-slate-900 hover:bg-slate-850" 
                    : "bg-slate-800 hover:bg-slate-750"
                }`}
              >
                {cell && (
                  <span className={`select-none transition-transform active:scale-95 ${
                    cell.color === 'w' 
                      ? "text-amber-100 drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)]" 
                      : "text-indigo-950 drop-shadow-[0_1.5px_1.5px_rgba(255,255,255,0.25)]"
                  }`}>
                    {glyph}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="mt-6 flex space-x-3 w-full">
        <button
          onClick={resetGame}
          className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>

        {winner && onPostToChat && (
          <button
            onClick={handleShareResult}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-semibold text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post to Chat</span>
          </button>
        )}
      </div>

      {onPostToChat && !winner && (
        <button
          onClick={() => {
            const payload = {
              __isGamePrompt: true,
              gameType: "challenge",
              challengeGame: "chess"
            };
            onPostToChat(JSON.stringify(payload));
          }}
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 hover:from-indigo-600/20 hover:to-purple-600/20 border border-indigo-500/15 hover:border-indigo-500/30 rounded-xl text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>📢 Invite Room to Chess</span>
        </button>
      )}

      {onPostToChat && (
        <GameCenterChat
          messagesList={messagesList}
          decryptedMap={decryptedMap}
          userTokenHash={userTokenHash}
          localDisplayName={localDisplayName}
          onPostMessage={async (text) => {
            onPostToChat(text);
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// GAME 6: CHECKERS GAME
// ----------------------------------------------------
function CheckersGame({ 
  localDisplayName, 
  onPostToChat,
  messagesList = [],
  decryptedMap = {},
  userTokenHash = ""
}: { 
  localDisplayName: string; 
  onPostToChat?: (text: string) => void;
  messagesList?: Message[];
  decryptedMap?: Record<string, string>;
  userTokenHash?: string;
}) {
  type CheckerPiece = { color: 'w' | 'r'; isKing: boolean } | null;

  const initialCheckersBoard = (): CheckerPiece[][] => {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) {
            board[r][c] = { color: 'r', isKing: false };
          } else if (r > 4) {
            board[r][c] = { color: 'w', isKing: false };
          }
        }
      }
    }
    return board;
  };

  const [board, setBoard] = useState<CheckerPiece[][]>(initialCheckersBoard());
  const [turn, setTurn] = useState<'w' | 'r'>('w');
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const resetGame = () => {
    setBoard(initialCheckersBoard());
    setTurn('w');
    setSelected(null);
    setWinner(null);
  };

  const getPiecesCount = () => {
    let w = 0, r = 0;
    board.forEach(row => row.forEach(cell => {
      if (cell) {
        if (cell.color === 'w') w++;
        else r++;
      }
    }));
    return { w, r };
  };

  const handleCellClick = (r: number, c: number) => {
    if (winner) return;

    const piece = board[r][c];

    if (!selected) {
      if (piece && piece.color === turn) {
        setSelected({ r, c });
      }
    } else {
      const originPiece = board[selected.r][selected.c];

      if (piece && piece.color === turn) {
        if (selected.r === r && selected.c === c) {
          setSelected(null);
        } else {
          setSelected({ r, c });
        }
        return;
      }

      const dr = r - selected.r;
      const dc = c - selected.c;
      const absDr = Math.abs(dr);
      const absDc = Math.abs(dc);

      if (absDr === 1 && absDc === 1 && !piece) {
        const isValidDirection = originPiece?.isKing || (turn === 'w' ? dr === -1 : dr === 1);
        
        if (isValidDirection) {
          const nextBoard = board.map(row => [...row]);
          const promote = (turn === 'w' && r === 0) || (turn === 'r' && r === 7);
          nextBoard[r][c] = { color: turn, isKing: originPiece?.isKing || promote };
          nextBoard[selected.r][selected.c] = null;
          
          setBoard(nextBoard);
          setSelected(null);
          setTurn(turn === 'w' ? 'r' : 'w');
        }
      } else if (absDr === 2 && absDc === 2 && !piece) {
        const isValidDirection = originPiece?.isKing || (turn === 'w' ? dr === -2 : dr === 2);
        const midR = (selected.r + r) / 2;
        const midC = (selected.c + c) / 2;
        const midPiece = board[midR][midC];

        if (isValidDirection && midPiece && midPiece.color !== turn) {
          const nextBoard = board.map(row => [...row]);
          const promote = (turn === 'w' && r === 0) || (turn === 'r' && r === 7);
          
          nextBoard[r][c] = { color: turn, isKing: originPiece?.isKing || promote };
          nextBoard[selected.r][selected.c] = null;
          nextBoard[midR][midC] = null;

          setBoard(nextBoard);
          setSelected(null);

          let wRemaining = 0, rRemaining = 0;
          nextBoard.forEach(row => row.forEach(cell => {
            if (cell) {
              if (cell.color === 'w') wRemaining++;
              else rRemaining++;
            }
          }));

          if (wRemaining === 0) {
            setWinner('Red');
          } else if (rRemaining === 0) {
            setWinner('White');
          } else {
            setTurn(turn === 'w' ? 'r' : 'w');
          }
        }
      }
    }
  };

  const handleShareResult = () => {
    if (!winner || !onPostToChat) return;
    const msg = `⚪🔴 Checkers match complete! ${winner === 'White' ? localDisplayName : "Opponent"} dominated the board with a checkers victory!`;
    onPostToChat(msg);
  };

  const counts = getPiecesCount();

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-center mb-6">
        <h3 className="text-sm font-bold font-display text-slate-100">Checkers</h3>
      </div>

      <div className="mb-4 font-mono text-[9px] text-slate-400 text-center flex items-center justify-center space-x-4">
        <div>⚪ White: <strong className="text-white">{counts.w}</strong></div>
        <div>🔴 Red: <strong className="text-rose-500">{counts.r}</strong></div>
      </div>

      <div className="mb-6 font-mono text-[10px] text-slate-400 text-center">
        {winner ? (
          <span className="text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>VICTORY FOR {winner.toUpperCase()}!</span>
          </span>
        ) : (
          <span>Turn: <strong className={turn === 'w' ? "text-slate-200" : "text-rose-400"}>{turn === 'w' ? "White" : "Red"}</strong> ({turn === 'w' ? localDisplayName : "Player 2"})</span>
        )}
      </div>

      <div className="grid grid-cols-8 gap-0.5 w-64 h-64 bg-slate-950 p-2 rounded-2xl border border-slate-850 overflow-hidden">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isDark = (r + c) % 2 === 1;
            const isSelected = selected && selected.r === r && selected.c === c;
            
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => isDark && handleCellClick(r, c)}
                className={`w-7.5 h-7.5 flex items-center justify-center relative ${
                  isDark 
                    ? "bg-slate-900 hover:bg-slate-850 cursor-pointer" 
                    : "bg-slate-850"
                }`}
              >
                {cell && (
                  <button
                    className={`w-6.5 h-6.5 rounded-full flex items-center justify-center border transition-all relative ${
                      isSelected 
                        ? "ring-2 ring-amber-400 border-amber-300 scale-105" 
                        : "scale-95 shadow-md"
                    } ${
                      cell.color === 'w'
                        ? "bg-slate-100 border-slate-300 hover:bg-white"
                        : "bg-rose-600 border-rose-500 hover:bg-rose-500"
                    }`}
                  >
                    {cell.isKing && (
                      <Crown className={`w-3 h-3 ${cell.color === 'w' ? "text-amber-500" : "text-white"}`} />
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 flex space-x-3 w-full">
        <button
          onClick={resetGame}
          className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>

        {winner && onPostToChat && (
          <button
            onClick={handleShareResult}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-[10px] font-semibold text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post to Chat</span>
          </button>
        )}
      </div>

      {onPostToChat && !winner && (
        <button
          onClick={() => {
            const payload = {
              __isGamePrompt: true,
              gameType: "challenge",
              challengeGame: "checkers"
            };
            onPostToChat(JSON.stringify(payload));
          }}
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-rose-600/10 to-pink-600/10 hover:from-rose-600/20 hover:to-pink-600/20 border border-rose-500/15 hover:border-rose-500/30 rounded-xl text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>📢 Invite Room to Checkers</span>
        </button>
      )}

      {onPostToChat && (
        <GameCenterChat
          messagesList={messagesList}
          decryptedMap={decryptedMap}
          userTokenHash={userTokenHash}
          localDisplayName={localDisplayName}
          onPostMessage={async (text) => {
            onPostToChat(text);
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// GAME 8: CANVAS WHITEBOARD GAME
// ----------------------------------------------------
function CanvasGame({
  localDisplayName,
  onPostToChat,
  messagesList = [],
  decryptedMap = {},
  userTokenHash = "",
}: {
  localDisplayName: string;
  onPostToChat?: (text: string) => void;
  messagesList?: Message[];
  decryptedMap?: Record<string, string>;
  userTokenHash?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>("#6366f1");
  const [brushSize, setBrushSize] = useState<number>(4);
  const [lastX, setLastX] = useState<number>(0);
  const [lastY, setLastY] = useState<number>(0);

  const [pointerType, setPointerType] = useState<string>("finger/mouse");
  const [pressureValue, setPressureValue] = useState<number>(0);
  const [isPenActive, setIsPenActive] = useState<boolean>(false);

  // Store collected points for the current stroke
  const strokePointsRef = useRef<[number, number][]>([]);
  // Store already processed message IDs to prevent double drawing
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Helper to draw a complete stroke on a canvas context
  const drawStroke = (ctx: CanvasRenderingContext2D, points: [number, number][], color: string, size: number) => {
    if (points.length === 0) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    // Scale size by 3 for the high-definition canvas backing store (840x600 vs 280x200 CSS)
    const scaledSize = size * 3;
    ctx.lineWidth = scaledSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (points.length === 1) {
      ctx.arc(points[0][0], points[0][1], scaledSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    } else if (points.length === 2) {
      ctx.moveTo(points[0][0], points[0][1]);
      ctx.lineTo(points[1][0], points[1][1]);
      ctx.stroke();
    } else {
      ctx.moveTo(points[0][0], points[0][1]);
      // Connect first point to the first midpoint
      ctx.lineTo((points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2);

      let i;
      for (i = 1; i < points.length - 1; i++) {
        const xc = (points[i][0] + points[i + 1][0]) / 2;
        const yc = (points[i][1] + points[i + 1][1]) / 2;
        ctx.quadraticCurveTo(points[i][0], points[i][1], xc, yc);
      }
      // Connect to the final point
      ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
      ctx.stroke();
    }
  };

  // Synchronize remote drawings from other users
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Process all canvas messages chronologically
    const sortedMessages = [...messagesList].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    sortedMessages.forEach((msg) => {
      if (processedMessageIdsRef.current.has(msg.id)) return;

      const cacheKey = `${msg.id}_${msg.editedAt || "original"}`;
      const decryptedText = decryptedMap[cacheKey] || "";
      if (!decryptedText) return;

      try {
        if (decryptedText.startsWith("{") && decryptedText.endsWith("}")) {
          const parsed = JSON.parse(decryptedText);
          if (parsed && parsed.__isCanvasAction === true) {
            if (parsed.action === "draw") {
              drawStroke(ctx, parsed.points, parsed.color, parsed.size);
            } else if (parsed.action === "clear") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            processedMessageIdsRef.current.add(msg.id);
          }
        }
      } catch (e) {
        // Normal non-JSON message
      }
    });
  }, [messagesList, decryptedMap]);

  const detectPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pType = e.pointerType || "mouse";
    let typeLabel = "Finger / Mouse";
    let isPen = false;

    if (pType === "pen") {
      typeLabel = "Apple / Samsung Pen";
      isPen = true;
    } else if (pType === "touch") {
      typeLabel = "Touch Finger";
    }

    setPointerType(typeLabel);
    setIsPenActive(isPen);
    if (e.pressure !== undefined) {
      setPressureValue(Math.round(e.pressure * 100));
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setIsDrawing(true);
    setLastX(x);
    setLastY(y);
    strokePointsRef.current = [[x, y]];

    detectPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    detectPointer(e);
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    let calculatedWidth = brushSize;
    if (e.pointerType === "pen" && e.pressure > 0) {
      calculatedWidth = brushSize * e.pressure * 1.8;
    }

    // Since we are drawing directly onto the canvas backing store (which is 840x600, 3x scale),
    // we must scale the brush size by 3 to draw at the correct high-definition line thickness.
    const scaledWidth = calculatedWidth * 3;

    strokePointsRef.current.push([x, y]);
    const points = strokePointsRef.current;

    ctx.beginPath();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = scaledWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (points.length === 2) {
      ctx.moveTo(points[0][0], points[0][1]);
      ctx.lineTo(points[1][0], points[1][1]);
      ctx.stroke();
    } else if (points.length >= 3) {
      const p0 = points[points.length - 3];
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      const xc1 = (p0[0] + p1[0]) / 2;
      const yc1 = (p0[1] + p1[1]) / 2;
      const xc2 = (p1[0] + p2[0]) / 2;
      const yc2 = (p1[1] + p2[1]) / 2;

      ctx.moveTo(xc1, yc1);
      ctx.quadraticCurveTo(p1[0], p1[1], xc2, yc2);
      ctx.stroke();
    }

    setLastX(x);
    setLastY(y);
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (strokePointsRef.current.length > 0 && onPostToChat) {
        const payload = {
          __isCanvasAction: true,
          action: "draw",
          points: strokePointsRef.current,
          color: brushColor,
          size: brushSize
        };
        onPostToChat(JSON.stringify(payload));
      }
      strokePointsRef.current = [];
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (onPostToChat) {
      const payload = {
        __isCanvasAction: true,
        action: "clear"
      };
      onPostToChat(JSON.stringify(payload));
    }
  };

  const handlePostSketchToChat = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onPostToChat) return;

    const dataUrl = canvas.toDataURL("image/png");
    const base64Str = dataUrl.split(",")[1];
    const decodedBytes = atob(base64Str).length;

    const filePayload = {
      __isChattyFile: true,
      fileName: `whiteboard-sketch-${Date.now()}.png`,
      fileType: "image/png",
      fileSize: decodedBytes,
      fileData: dataUrl,
      caption: "🎨 Whiteboard sketch share!"
    };

    onPostToChat(JSON.stringify(filePayload));
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full text-center mb-4">
        <h3 className="text-sm font-bold font-display text-slate-100 flex items-center justify-center space-x-2">
          <PenTool className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Canvas</span>
        </h3>
        <p className="text-[9px] text-slate-400 font-sans mt-0.5">Doodle, sketch, or annotate together in real time.</p>
      </div>

      <div className="w-full flex justify-between bg-slate-950 px-4 py-2 rounded-xl border border-slate-850 mb-4 text-[9px] font-mono text-slate-400">
        <div>Device: <strong className={isPenActive ? "text-emerald-400" : "text-indigo-400"}>{pointerType.toUpperCase()}</strong></div>
        {isPenActive && (
          <div>Pressure: <strong className="text-emerald-400">{pressureValue}%</strong></div>
        )}
        {!isPenActive && (
          <div>Stylus: <span className="opacity-50">NOT ACTIVE</span></div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-800 shadow-inner overflow-hidden mb-4 relative touch-none select-none">
        <canvas
          ref={canvasRef}
          width={840}
          height={600}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="cursor-crosshair block w-[280px] h-[200px] touch-none bg-white"
        />
      </div>

      <div className="w-full space-y-4 mb-5">
        <div className="flex flex-col space-y-1">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block text-center">Stroke Color</span>
          <div className="flex justify-center gap-1.5">
            {[
              { label: "Indigo", value: "#6366f1" },
              { label: "Rose", value: "#f43f5e" },
              { label: "Emerald", value: "#10b981" },
              { label: "Amber", value: "#f59e0b" },
              { label: "Purple", value: "#8b5cf6" },
              { label: "Slate", value: "#334155" },
              { label: "Red", value: "#ef4444" },
              { label: "Eraser", value: "#ffffff", icon: "🧼" }
            ].map((color, idx) => {
              const isSelected = brushColor === color.value;
              return (
                <button
                  key={idx}
                  onClick={() => setBrushColor(color.value)}
                  style={{ backgroundColor: color.value !== "#ffffff" ? color.value : "#f1f5f9" }}
                  title={color.label}
                  className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-transform cursor-pointer ${
                    isSelected ? "ring-2 ring-indigo-400 scale-110" : "border-slate-800 scale-95 hover:scale-100"
                  }`}
                >
                  {color.icon && <span className="text-[10px]">{color.icon}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block text-center font-bold">Size: {brushSize}px</span>
          <div className="flex justify-center space-x-1.5">
            {[2, 4, 8, 12, 18].map((size, idx) => (
              <button
                key={idx}
                onClick={() => setBrushSize(size)}
                className={`py-0.5 px-2 text-[8px] font-mono font-bold rounded border transition-all cursor-pointer ${
                  brushSize === size 
                    ? "bg-slate-950 text-emerald-400 border-emerald-500/50 font-black" 
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {size === 2 ? "Thin" : size === 4 ? "Medium" : size === 8 ? "Bold" : size === 12 ? "Thick" : "Huge"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-3 w-full">
        <button
          onClick={handleClear}
          className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Board</span>
        </button>

        {onPostToChat && (
          <button
            onClick={handlePostSketchToChat}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-semibold text-white transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Post Sketch</span>
          </button>
        )}
      </div>

      {onPostToChat && (
        <button
          onClick={() => {
            const payload = {
              __isGamePrompt: true,
              gameType: "challenge",
              challengeGame: "canvas"
            };
            onPostToChat(JSON.stringify(payload));
          }}
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-rose-600/10 to-indigo-600/10 hover:from-rose-600/20 hover:to-indigo-600/20 border border-rose-500/15 hover:border-rose-500/30 rounded-xl text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <PenTool className="w-3.5 h-3.5 animate-bounce" />
          <span>📢 Invite Room to Whiteboard</span>
        </button>
      )}

      {onPostToChat && (
        <GameCenterChat
          messagesList={messagesList}
          decryptedMap={decryptedMap}
          userTokenHash={userTokenHash}
          localDisplayName={localDisplayName}
          onPostMessage={async (text) => {
            onPostToChat(text);
          }}
        />
      )}
    </div>
  );
}
