// Tetromino types
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// Cell state
export type CellState = {
  type: TetrominoType | null;
  filled: boolean;
};

// Board representation (20 rows x 10 columns)
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

// Game data context
export type GameData = {
  board: Board;
  activePiece: ActivePiece | null;
  ghostPiece: GhostPiece | null;
  nextPieces: NextPieceInfo[];
  gameState: GameState;
  scoreData: ScoreData;
};
