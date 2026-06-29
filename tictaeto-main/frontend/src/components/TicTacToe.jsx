import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Board } from "./Board";
import { ScorePanel } from "./ScorePanel";
import { MatchHistory } from "./MatchHistory";
import { ModeSelector } from "./ModeSelector";
import { Mark } from "./Mark";
import { checkWinner, pickEasyMove, pickHardMove } from "../lib/gameLogic";
import { RotateCw, Play } from "lucide-react";
import { toast, Toaster } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EMPTY_BOARD = () => Array(9).fill(null);

const defaultNamesForMode = (mode) => {
  if (mode === "pvp") return { X: "Player 1", O: "Player 2" };
  if (mode === "easy") return { X: "You", O: "CPU Easy" };
  return { X: "You", O: "CPU Hard" };
};

export const TicTacToe = () => {
  const [mode, setMode] = useState("pvp");
  const [names, setNames] = useState(defaultNamesForMode("pvp"));
  const [board, setBoard] = useState(EMPTY_BOARD());
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null); // 'X' | 'O' | 'DRAW' | null
  const [winningLine, setWinningLine] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, DRAW: 0 });
  const [moves, setMoves] = useState(0);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const savedRef = useRef(false);

  // Fetch match history
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API}/matches?limit=20`);
      setHistory(res.data || []);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // When mode changes, update default names if still defaults, and reset board.
  useEffect(() => {
    setNames((prev) => {
      const xDefaults = ["Player 1", "You"];
      const oDefaults = ["Player 2", "CPU Easy", "CPU Hard"];
      const defaults = defaultNamesForMode(mode);
      return {
        X: xDefaults.includes(prev.X) ? defaults.X : prev.X,
        O: oDefaults.includes(prev.O) ? defaults.O : prev.O,
      };
    });
    resetBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const resetBoard = useCallback(() => {
    setBoard(EMPTY_BOARD());
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
    setMoves(0);
    setShake(false);
    setFlash(false);
    savedRef.current = false;
  }, []);

  const resetAll = useCallback(() => {
    resetBoard();
    setScores({ X: 0, O: 0, DRAW: 0 });
    toast("Scores reset", { duration: 1500 });
  }, [resetBoard]);

  const playMove = useCallback(
    (idx, mark) => {
      setBoard((prev) => {
        if (prev[idx] !== null) return prev;
        const next = [...prev];
        next[idx] = mark;
        return next;
      });
      setMoves((m) => m + 1);
      setCurrentPlayer((p) => (p === "X" ? "O" : "X"));
    },
    []
  );

  const handleCellClick = (idx) => {
    if (winner) return;
    if (board[idx] !== null) return;
    if (mode !== "pvp" && currentPlayer === "O") return; // CPU plays O
    playMove(idx, currentPlayer);
  };

  // Check winner whenever board changes
  useEffect(() => {
    const { winner: w, line } = checkWinner(board);
    if (w) {
      setWinner(w);
      setWinningLine(line);
      if (w === "DRAW") {
        setShake(true);
        setFlash(true);
        setTimeout(() => setShake(false), 400);
        setTimeout(() => setFlash(false), 800);
      }
    }
  }, [board]);

  // Update scores + persist match exactly once per finished game
  useEffect(() => {
    if (!winner || savedRef.current) return;
    savedRef.current = true;

    setScores((prev) => ({ ...prev, [winner]: prev[winner] + 1 }));

    const persist = async () => {
      try {
        await axios.post(`${API}/matches`, {
          mode,
          player_x: names.X || "Player 1",
          player_o: names.O || "Player 2",
          winner,
          moves,
        });
        loadHistory();
      } catch (e) {
        console.error("Failed to save match", e);
      }
    };
    persist();

    if (winner === "DRAW") {
      toast("It's a draw.", { duration: 1800 });
    } else {
      const winnerName = winner === "X" ? names.X : names.O;
      toast(`${winnerName} wins.`, { duration: 1800 });
    }
  }, [winner, mode, names, moves, loadHistory]);

  // CPU move
  useEffect(() => {
    if (winner) return;
    if (mode === "pvp") return;
    if (currentPlayer !== "O") return;
    // Snapshot the board the AI will play on, so a mode-switch / reset cancels.
    const boardSnapshot = board;

    setAiThinking(true);
    const delay = 380 + Math.random() * 220;
    const timer = setTimeout(() => {
      // Verify board hasn't been reset / mutated by another effect.
      setBoard((current) => {
        if (current !== boardSnapshot) return current; // stale, skip
        const move =
          mode === "easy"
            ? pickEasyMove(current)
            : pickHardMove(current, "O");
        if (move === null || move === -1 || move === undefined) return current;
        if (current[move] !== null) return current;
        const next = [...current];
        next[move] = "O";
        setMoves((m) => m + 1);
        setCurrentPlayer("X");
        return next;
      });
      setAiThinking(false);
    }, delay);

    return () => {
      clearTimeout(timer);
      setAiThinking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, mode, winner, board]);

  const onClearHistory = async () => {
    try {
      await axios.delete(`${API}/matches`);
      setHistory([]);
      toast("Match log cleared.", { duration: 1400 });
    } catch (e) {
      console.error(e);
    }
  };

  const statusMessage = useMemo(() => {
    if (winner === "DRAW")
      return { primary: "DRAW", secondary: "No one took the grid." };
    if (winner === "X")
      return {
        primary: `${(names.X || "PLAYER 1").toUpperCase()} WINS`,
        secondary: "Three in a row.",
      };
    if (winner === "O")
      return {
        primary: `${(names.O || "PLAYER 2").toUpperCase()} WINS`,
        secondary: "Three in a row.",
      };
    const whose = currentPlayer === "X" ? names.X : names.O;
    return {
      primary: `${(whose || (currentPlayer === "X" ? "PLAYER 1" : "PLAYER 2")).toUpperCase()} · TURN`,
      secondary:
        aiThinking && currentPlayer === "O" ? "CPU is thinking…" : `Mark: ${currentPlayer}`,
    };
  }, [winner, currentPlayer, names, aiThinking]);

  const oInputDisabled = mode !== "pvp";

  return (
    <div className="relative min-h-screen text-[#111111]" data-testid="ttt-app">
      <div className="paper-texture" aria-hidden="true" />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#111111",
            color: "#ffffff",
            border: "3px solid #111111",
            borderRadius: 0,
            fontFamily: "Azeret Mono, monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontSize: 12,
          },
        }}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#555555] mb-3">
              ── A Bauhaus Grid Duel · v1
            </div>
            <h1
              className="font-display text-5xl md:text-7xl font-black uppercase leading-[0.85]"
              data-testid="app-title"
            >
              Tic
              <span className="text-[#FF3333]">·</span>
              Tac
              <span className="text-[#0033CC]">·</span>
              Toe
            </h1>
            <p className="mt-4 text-sm md:text-base text-[#555555] max-w-md">
              Pick a mode, name the rivals, mark three in a row. The geometry
              decides who wins.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <ModeSelector value={mode} onChange={setMode} />
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#555555]">
              {mode === "pvp" && "Two humans, one grid."}
              {mode === "easy" && "CPU plays at random."}
              {mode === "hard" && "CPU is unbeatable (minimax)."}
            </div>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left: Players + Controls */}
          <section className="lg:col-span-3 space-y-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#555555] mb-3">
                Players
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#FF3333] font-bold">
                    ▲ Mark X
                  </label>
                  <input
                    type="text"
                    value={names.X}
                    onChange={(e) =>
                      setNames((n) => ({ ...n, X: e.target.value.slice(0, 18) }))
                    }
                    placeholder="Enter name"
                    className="input-brut"
                    data-testid="player-x-input"
                    maxLength={18}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#0033CC] font-bold">
                    ● Mark O {oInputDisabled && "(CPU)"}
                  </label>
                  <input
                    type="text"
                    value={names.O}
                    onChange={(e) =>
                      setNames((n) => ({ ...n, O: e.target.value.slice(0, 18) }))
                    }
                    placeholder="Enter name"
                    className="input-brut"
                    data-testid="player-o-input"
                    maxLength={18}
                    disabled={oInputDisabled}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={resetBoard}
                className="btn-brut is-primary"
                data-testid="new-round-button"
              >
                <Play size={16} strokeWidth={3} />
                New Round
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="btn-brut"
                data-testid="reset-all-button"
              >
                <RotateCw size={16} strokeWidth={3} />
                Reset Scores
              </button>
            </div>
          </section>

          {/* Center: Board */}
          <section className="lg:col-span-6 flex flex-col items-center">
            <div
              className="w-full mb-6 border-l-4 border-[#111111] pl-4"
              data-testid="game-status-message"
            >
              <div
                className={[
                  "font-display text-3xl md:text-4xl font-black uppercase leading-none",
                  winner === "X"
                    ? "text-[#FF3333]"
                    : winner === "O"
                      ? "text-[#0033CC]"
                      : winner === "DRAW"
                        ? "text-[#111111]"
                        : currentPlayer === "X"
                          ? "text-[#FF3333]"
                          : "text-[#0033CC]",
                ].join(" ")}
              >
                {statusMessage.primary}
              </div>
              <div className="text-xs uppercase tracking-[0.25em] text-[#555555] mt-1">
                {statusMessage.secondary}
              </div>
            </div>

            <Board
              board={board}
              onCellClick={handleCellClick}
              disabled={
                !!winner || (mode !== "pvp" && currentPlayer === "O") || aiThinking
              }
              winningLine={winningLine}
              shake={shake}
              flash={flash}
            />

            {/* Turn indicator under board */}
            <div className="mt-6 flex items-center gap-3" data-testid="turn-indicator">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#555555]">
                Next Mark
              </span>
              <div className="w-9 h-9 border-4 border-[#111111] flex items-center justify-center bg-white">
                {!winner && <Mark value={currentPlayer} animated={false} />}
                {winner && <span className="font-mono-ui text-xs font-bold">—</span>}
              </div>
            </div>
          </section>

          {/* Right: Score + History */}
          <section className="lg:col-span-3 space-y-8">
            <ScorePanel scores={scores} playerX={names.X} playerO={names.O} />
            <MatchHistory
              matches={history}
              onClear={onClearHistory}
              loading={historyLoading}
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t-4 border-[#111111] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#555555]">
            ── Built on a 3 × 3 grid · pure geometry
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#555555]">
            Hard CPU uses minimax — you cannot beat it. Try a draw.
          </div>
        </footer>
      </main>
    </div>
  );
};
