import React from "react";
import { Trash2 } from "lucide-react";

const MODE_LABELS = {
  pvp: "PVP",
  easy: "CPU·EASY",
  hard: "CPU·HARD",
};

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "—";
  }
};

export const MatchHistory = ({ matches, onClear, loading }) => {
  return (
    <div
      className="border-4 border-[#111111] bg-white shadow-brut"
      data-testid="match-history-panel"
    >
      <div className="flex items-center justify-between p-4 border-b-4 border-[#111111] bg-[#F4F4EC]">
        <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#111111]">
          Match Log
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-1 hover:text-[#FF3333] transition-colors"
          data-testid="clear-history-button"
          aria-label="Clear match history"
        >
          <Trash2 size={14} strokeWidth={3} />
          Clear
        </button>
      </div>

      <div
        className="max-h-[260px] overflow-y-auto thin-scroll"
        data-testid="match-history-list"
      >
        {loading && (
          <div className="p-4 text-sm text-[#555555]">Loading history…</div>
        )}
        {!loading && matches.length === 0 && (
          <div className="p-6 text-sm text-[#555555] text-center">
            No matches yet. Play one →
          </div>
        )}
        {!loading &&
          matches.map((m, i) => {
            const winnerText =
              m.winner === "DRAW"
                ? "DRAW"
                : m.winner === "X"
                  ? m.player_x
                  : m.player_o;
            const winnerColor =
              m.winner === "X"
                ? "text-[#FF3333]"
                : m.winner === "O"
                  ? "text-[#0033CC]"
                  : "text-[#111111]";
            return (
              <div
                key={m.id || i}
                className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-[#111111]/15 text-xs font-mono-ui"
                data-testid={`history-row-${i}`}
              >
                <div className="col-span-2 font-bold">
                  {MODE_LABELS[m.mode] || m.mode}
                </div>
                <div className="col-span-5 truncate">
                  <span className="text-[#FF3333] font-bold">{m.player_x}</span>
                  <span className="mx-1 text-[#555555]">vs</span>
                  <span className="text-[#0033CC] font-bold">{m.player_o}</span>
                </div>
                <div
                  className={`col-span-3 font-bold uppercase ${winnerColor} truncate`}
                >
                  {m.winner === "DRAW" ? "DRAW" : `${winnerText} WON`}
                </div>
                <div className="col-span-2 text-right text-[#555555]">
                  {formatTime(m.timestamp)}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
