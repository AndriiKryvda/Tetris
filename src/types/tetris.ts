// Tetromino types
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// Cell state
export type CellState = {
  type: TetrominoType | null;
  filled: boolean;
};

// Board representation (20 rows x 20 columns - 2x wider for shared field)
export type Board = CellState[][];

// Active piece
export type ActivePiece = {
  type: TetrominoType;
  position: { x: number; y: number };
  rotation: number; // 0, 1, 2, 3 (x90 degrees)
};

// Ghost piece position
export type GhostPiece = {
  position: { x: number; y: number };
};

// Game state
export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver';

// Score tracking
export type ScoreData = {
  score: number;
  level: number;
  lines: number;
};

// Next piece preview
export type NextPieceInfo = {
  type: TetrominoType;
};

// Player ID
export type PlayerId = 'player1' | 'player2';

// Game mode
export type GameMode = 'single' | 'dual';

// Game data context
export type GameData = {
  board: Board;
  activePiece: ActivePiece | null;
  ghostPiece: GhostPiece | null;
  nextPieces: NextPieceInfo[];
  gameState: GameState;
  scoreData: ScoreData;
};

// Dual player active pieces
export type DualActivePiece = {
  player1: ActivePiece | null;
  player2: ActivePiece | null;
};

// Dual player ghost pieces
export type DualGhostPiece = {
  player1: GhostPiece | null;
  player2: GhostPiece | null;
};

// Dual player score data
export type DualScoreData = {
  player1: ScoreData;
  player2: ScoreData;
};

// Dual player next pieces
export type DualNextPieces = {
  player1: NextPieceInfo[];
  player2: NextPieceInfo[];
};
