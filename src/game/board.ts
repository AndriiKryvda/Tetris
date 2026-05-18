import { Board, CellState, TetrominoType } from '../types/tetris';
import { getTetrominoShape } from './pieces';

const BOARD_ROWS = 20;
const BOARD_COLS = 10;
const EMPTY_CELL: CellState = { type: null, filled: false };

// Create an empty board
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array.from({ length: BOARD_COLS }, () => ({ ...EMPTY_CELL }))
  );
}

// Check if a piece can move to a given position
export function isValidPosition(
  board: Board,
  type: TetrominoType,
  position: { x: number; y: number },
  rotation: number
): boolean {
  const shape = getTetrominoShape(type, rotation);
  const { height, width } = { height: shape.length, width: shape[0].length };

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (shape[r][c]) {
        const boardR = position.y + r;
        const boardC = position.x + c;

        // Check boundaries
        if (boardR < 0 || boardR >= BOARD_ROWS || boardC < 0 || boardC >= BOARD_COLS) {
          return false;
        }

        // Check collision with placed pieces
        if (board[boardR][boardC].filled) {
          return false;
        }
      }
    }
  }

  return true;
}

// Place a piece on the board
export function placePiece(board: Board, piece: { type: TetrominoType; position: { x: number; y: number }; rotation: number }): Board {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const shape = getTetrominoShape(piece.type, piece.rotation);
  const { x, y } = piece.position;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[0].length; c++) {
      if (shape[r][c]) {
        const boardR = y + r;
        const boardC = x + c;
        if (boardR >= 0 && boardR < BOARD_ROWS && boardC >= 0 && boardC < BOARD_COLS) {
          newBoard[boardR][boardC] = { type: piece.type, filled: true };
        }
      }
    }
  }

  return newBoard;
}

// Get the bottom-most position for a piece (for ghost piece)
export function getGhostPosition(
  board: Board,
  type: TetrominoType,
  position: { x: number; y: number },
  rotation: number
): { x: number; y: number } {
  let ghostY = position.y;

  // Move the piece down until it collides
  while (isValidPosition(board, type, { x: position.x, y: ghostY + 1 }, rotation)) {
    ghostY++;
  }

  return { x: position.x, y: ghostY };
}
