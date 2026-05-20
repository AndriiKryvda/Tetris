import { Board } from '../types/tetris';

// Find completed lines
export function getCompletedLines(board: Board): number[] {
  const completed: number[] = [];

  for (let r = 0; r < board.length; r++) {
    if (board[r].every((cell) => cell.filled)) {
      completed.push(r);
    }
  }

  return completed;
}

// Clear completed lines and return new board
export function clearLines(board: Board, lines: number[]): Board {
  if (lines.length === 0) return board;

  // Remove the completed lines and add empty lines at the top
  const newBoard = board.filter((_, index) => !lines.includes(index));

  // Get the column count from the first remaining row (or default to 20)
  const cols = newBoard.length > 0 && newBoard[0].length > 0 ? newBoard[0].length : 20;

  // Add empty lines at the top with the correct column count
  const emptyRows = Array.from({ length: lines.length }, () =>
    Array.from({ length: cols }, () => ({ type: null, filled: false }))
  );

  return [...emptyRows, ...newBoard];
}

// Get number of lines to clear
export function getLinesToClear(completedLines: number[]): number {
  return completedLines.length;
}
