// Winning lines on a 3x3 board, indexed 0..8
export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function checkWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((c) => c !== null)) {
    return { winner: "DRAW", line: null };
  }
  return { winner: null, line: null };
}

export function availableMoves(board) {
  const moves = [];
  for (let i = 0; i < 9; i++) if (board[i] === null) moves.push(i);
  return moves;
}

// Easy AI: random move
export function pickEasyMove(board) {
  const moves = availableMoves(board);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// Hard AI: minimax (unbeatable). AI plays as `aiMark`.
export function pickHardMove(board, aiMark) {
  const humanMark = aiMark === "X" ? "O" : "X";

  const score = (b, depth) => {
    const { winner } = checkWinner(b);
    if (winner === aiMark) return 10 - depth;
    if (winner === humanMark) return depth - 10;
    if (winner === "DRAW") return 0;
    return null;
  };

  const minimax = (b, isMax, depth) => {
    const s = score(b, depth);
    if (s !== null) return { score: s, idx: -1 };

    const moves = availableMoves(b);
    let best = { score: isMax ? -Infinity : Infinity, idx: moves[0] };

    for (const idx of moves) {
      b[idx] = isMax ? aiMark : humanMark;
      const { score: childScore } = minimax(b, !isMax, depth + 1);
      b[idx] = null;
      if (isMax) {
        if (childScore > best.score) best = { score: childScore, idx };
      } else {
        if (childScore < best.score) best = { score: childScore, idx };
      }
    }
    return best;
  };

  return minimax([...board], true, 0).idx;
}
