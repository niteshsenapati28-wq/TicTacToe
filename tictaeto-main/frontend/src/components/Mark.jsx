import React from "react";

// SVG X and O marks rendered with thick square caps to match the Bauhaus aesthetic.
export const Mark = ({ value, animated = true }) => {
  if (value === "X") {
    return (
      <svg
        viewBox="0 0 100 100"
        width="68%"
        height="68%"
        aria-hidden="true"
        data-testid="mark-x"
      >
        <line
          x1="14"
          y1="14"
          x2="86"
          y2="86"
          stroke="#FF3333"
          strokeWidth="12"
          strokeLinecap="square"
          className={animated ? "mark-draw" : ""}
          style={{ "--dash": 110 }}
        />
        <line
          x1="86"
          y1="14"
          x2="14"
          y2="86"
          stroke="#FF3333"
          strokeWidth="12"
          strokeLinecap="square"
          className={animated ? "mark-draw" : ""}
          style={{ "--dash": 110, animationDelay: animated ? "120ms" : "0ms" }}
        />
      </svg>
    );
  }
  if (value === "O") {
    return (
      <svg
        viewBox="0 0 100 100"
        width="68%"
        height="68%"
        aria-hidden="true"
        data-testid="mark-o"
      >
        <circle
          cx="50"
          cy="50"
          r="32"
          stroke="#0033CC"
          strokeWidth="12"
          fill="transparent"
          className={animated ? "mark-draw" : ""}
          style={{ "--dash": 220 }}
        />
      </svg>
    );
  }
  return null;
};
