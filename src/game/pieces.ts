import { TetrominoType, ActivePiece, PlayerId } from '../types/tetris';

// Tetromino shapes in their default rotation (rotation 0)
// Each shape is a 2D array where 1 represents a filled cell
const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

// Colors for each tetromino
export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  I: '#00f0f0', // Cyan
  O: '#f0f000', // Yellow
  T: '#a000f0', // Purple
  S: '#00f000', // Green
  Z: '#f00000', // Red
  J: '#0000f0', // Blue
  L: '#f0a000', // Orange
};

// Player-specific color tints for dual player mode
export const PLAYER_COLORS: Record<PlayerId, { prefix: string; suffix: string }> = {
  player1: { prefix: '', suffix: '' },       // No tint for player 1
  player2: { prefix: '', suffix: '' },       // No tint for player 2 (use patterns instead)
};

// Pattern indicators for distinguishing players visually
export const PLAYER_PATTERNS: Record<PlayerId, string> = {
  player1: '',                               // Solid fill for player 1
  player2: 'url(#diagonalLines)',            // Hatching pattern for player 2
};

// Get the shape of a tetromino at a given rotation
export function getTetrominoShape(type: TetrominoType, rotation: number): number[][] {
  let shape = TETROMINO_SHAPES[type].map((row) => [...row]);

  // Rotate the shape rotation * 90 degrees clockwise
  for (let i = 0; i < rotation; i++) {
    shape = rotateShape(shape);
  }

  return shape;
}

// Rotate a shape 90 degrees clockwise
function rotateShape(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array(cols)
    .fill(null)
    .map(() => Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }

  return rotated;
}

// Get the size of a tetromino at a given rotation
export function getTetrominoSize(type: TetrominoType, rotation: number): { width: number; height: number } {
  const shape = getTetrominoShape(type, rotation);
  return { width: shape[0].length, height: shape.length };
}

// Create a new active piece with random type
export function createRandomPiece(): ActivePiece {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const size = getTetrominoSize(type, 0);
  const x = Math.floor((10 - size.width) / 2);
  const y = 0;

  return { type, position: { x, y }, rotation: 0 };
}

// Create a new active piece for a specific player with random type
export function createRandomPieceForPlayer(playerId: PlayerId): ActivePiece {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const size = getTetrominoSize(type, 0);
  
  // Spawn in the player's zone
  let x: number;
  if (playerId === 'player1') {
    // Player 1: left half (columns 0-4)
    x = Math.floor((5 - size.width) / 2);
  } else {
    // Player 2: right half (columns 5-9)
    x = 5 + Math.floor((5 - size.width) / 2);
  }
  const y = 0;

  return { type, position: { x, y }, rotation: 0 };
}

// Tetris bag system for fair piece distribution
let pieceBag: TetrominoType[] = [];

export function getNextPiece(): TetrominoType {
  if (pieceBag.length === 0) {
    pieceBag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    // Fisher-Yates shuffle
    for (let i = pieceBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
    }
  }

  return pieceBag.pop()!;
}

// Reset the bag system
export function resetPieceBag(): void {
  pieceBag = [];
}
