import React from "react";

export const ScorePanel = ({ scores, playerX, playerO }) => {
  return (
    <div
      className="border-4 border-[#111111] bg-white p-6 shadow-brut"
      data-testid="score-panel"
    >
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#555555] mb-4">
        // Scoreboard
      </div>
      <div className="grid grid-cols-3 gap-4 items-end">
        <div data-testid="score-x" className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#555555]">
            Player X
          </div>
          <div
            className="font-mono-ui text-[#FF3333] text-sm font-bold truncate"
            title={playerX}
          >
            {playerX || "—"}
          </div>
          <div className="font-mono-ui text-3xl sm:text-4xl font-black text-[#FF3333] mt-1">
            {String(scores.X).padStart(2, "0")}
          </div>
        </div>

        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#555555]">
            Draws
          </div>
          <div className="font-mono-ui text-2xl sm:text-3xl font-black text-[#111111] mt-1">
            {String(scores.DRAW).padStart(2, "0")}
          </div>
        </div>

        <div className="text-right min-w-0" data-testid="score-o">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#555555]">
            Player O
          </div>
          <div
            className="font-mono-ui text-[#0033CC] text-sm font-bold truncate"
            title={playerO}
          >
            {playerO || "—"}
          </div>
          <div className="font-mono-ui text-3xl sm:text-4xl font-black text-[#0033CC] mt-1">
            {String(scores.O).padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
};
