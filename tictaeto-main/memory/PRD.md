# Tic Tac Toe Game — PRD

## Original Problem Statement
Create a Tic Tac Toe game where two players (or a player and the computer) take turns marking a 3×3 grid. The program should check for winning conditions and declare the result. This task introduces grid logic and game state management.

## Architecture
- **Frontend**: React 19 + Tailwind + custom Bauhaus / neo-brutalist styling
  - `src/App.js` — routes
  - `src/components/TicTacToe.jsx` — game container (state, mode, AI)
  - `src/components/Board.jsx`, `Cell` is inline; `Mark.jsx` renders SVG X / O
  - `src/components/ScorePanel.jsx`, `MatchHistory.jsx`, `ModeSelector.jsx`
  - `src/lib/gameLogic.js` — `checkWinner`, `pickEasyMove`, `pickHardMove` (minimax)
- **Backend**: FastAPI + Motor (MongoDB)
  - `POST /api/matches` — save a match result
  - `GET /api/matches?limit=N` — list recent matches
  - `DELETE /api/matches` — clear log
- **DB**: MongoDB `matches` collection.

## Core Requirements (static)
1. 3×3 grid with X/O marks
2. Two-player mode (local) and Player vs Computer (Easy random + Hard minimax)
3. Winner / draw detection
4. Score tracking across rounds + match log persisted in MongoDB
5. Player name customization
6. Reset round / reset all controls

## Implemented (Feb 2026)
- Bauhaus aesthetic per `design_guidelines.json` (Cabinet Grotesk + Azeret Mono, ivory/red/blue/black palette)
- Animated SVG marks, win-line draw animation, draw shake + flash, prefers-reduced-motion respected
- Mode selector PvP / CPU Easy / CPU Hard
- Minimax AI (unbeatable) for hard mode, random for easy
- Persisted match history list with clear button
- data-testid coverage for board cells, status, panels, inputs, buttons

## Backlog / Next
- P1: Sound effects for moves / wins
- P1: Move history with per-move undo
- P2: Online multiplayer (rooms)
- P2: Leaderboard aggregation by player name
- P2: Theme toggle (dark variant)
