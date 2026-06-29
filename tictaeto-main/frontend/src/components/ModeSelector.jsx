import React from "react";

const MODES = [
  { id: "pvp", label: "2 Players" },
  { id: "easy", label: "CPU · Easy" },
  { id: "hard", label: "CPU · Hard" },
];

export const ModeSelector = ({ value, onChange, disabled }) => {
  return (
    <div
      role="tablist"
      aria-label="Game mode"
      className="inline-flex border-4 border-[#111111] bg-white shadow-brut-sm"
      data-testid="mode-selector"
    >
      {MODES.map((m, i) => {
        const isActive = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(m.id)}
            className={[
              "px-4 sm:px-5 py-3 font-mono-ui text-xs sm:text-sm font-bold uppercase tracking-[0.15em] transition-colors duration-100",
              i !== MODES.length - 1 ? "border-r-4 border-[#111111]" : "",
              isActive
                ? "bg-[#111111] text-white"
                : "bg-white text-[#111111] hover:bg-[#FFCC00]",
              disabled ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
            data-testid={`mode-${m.id}`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
};
