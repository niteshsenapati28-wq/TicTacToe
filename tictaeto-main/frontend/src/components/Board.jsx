import React from "react";
import { Mark } from "./Mark";

// Coordinates (center of each cell on a 3x3 grid in % units, 0..100)
const CELL_CENTERS = [
  [16.7, 16.7],
  [50, 16.7],
  [83.3, 16.7],
  [16.7, 50],
  [50, 50],
  [83.3, 50],
  [16.7, 83.3],
  [50, 83.3],
  [83.3, 83.3],
];

const WIN_LINE_COORDS = (line) => {
  const [a, , c] = line;
  return {
    x1: CELL_CENTERS[a][0],
    y1: CELL_CENTERS[a][1],
    x2: CELL_CENTERS[c][0],
    y2: CELL_CENTERS[c][1],
  };
};

export const Board = ({
  board,
  onCellClick,
  disabled,
  winningLine,
  shake,
  flash,
}) => {
  const lineCoords = winningLine ? WIN_LINE_COORDS(winningLine) : null;

  return (
    <div
      className={`relative ${shake ? "board-shake" : ""}`}
      data-testid="game-board"
    >
      <div className="bg-[#111111] p-2 shadow-brut-lg border-4 border-[#111111]">
        <div className="grid grid-cols-3 gap-2 relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px]">
          {board.map((value, idx) => {
            const isWinningCell = winningLine && winningLine.includes(idx);
            const cellDisabled = disabled || value !== null;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => !cellDisabled && onCellClick(idx)}
                disabled={cellDisabled}
                aria-label={`Cell ${idx + 1}`}
                className={[
                  "relative flex items-center justify-center select-none",
                  "bg-[#F4F4EC]",
                  cellDisabled ? "cursor-default" : "cell-enabled",
                  isWinningCell ? "win-pulse" : "",
                  flash && !value ? "flash-yellow" : "",
                  "transition-colors duration-100",
                ].join(" ")}
                data-testid={`board-cell-${idx}`}
                data-value={value || ""}
              >
                <Mark value={value} />
              </button>
            );
          })}

          {lineCoords && (
            <svg
              className="absolute inset-0 pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              data-testid="winning-line"
            >
              <line
                x1={lineCoords.x1}
                y1={lineCoords.y1}
                x2={lineCoords.x2}
                y2={lineCoords.y2}
                stroke="#111111"
                strokeWidth="3.2"
                strokeLinecap="square"
                vectorEffect="non-scaling-stroke"
                className="win-line"
                style={{ strokeWidth: 8 }}
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
