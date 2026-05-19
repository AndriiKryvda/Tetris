import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Board,
  ActivePiece,
  GhostPiece,
  GameState,
  ScoreData,
  NextPieceInfo,
  TetrominoType,
  CellState,
} from '../types/tetris';
import { createEmptyBoard } from '../game/board';
import { getCompletedLines, clearLines } from '../game/lines';
import { updateScore } from '../game/scoring';
import { getDropSpeed } from '../game/levels';
import { useKeyboard, KeyboardAction } from './useKeyboard';
import { useGameLoop } from './useGameLoop';
import { getTetrominoShape } from '../game/pieces';

// Board dimensions
const BOARD_ROWS = 20;
const BOARD_COLS = 10;

// Initial score data
const INITIAL_SCORE_DATA: ScoreData = {
  score: 0,
  level: 1,
  lines: 0,
};

// Initial game state
const INITIAL_GAME_STATE: GameState = 'menu';

// Tetris bag system state
let pieceBag: TetrominoType[] = [];

interface UseGameStateReturn {
  board: Board;
  activePiece: ActivePiece | null;
  ghostPiece: GhostPiece | null;
  nextPieces: NextPieceInfo[];
  gameState: GameState;
  scoreData: ScoreData;
  handleAction: (action: KeyboardAction) => void;
  startGame: () => void;
  togglePause: () => void;
}

// Fill the bag if empty
function fillPieceBag() {
  if (pieceBag.length === 0) {
    pieceBag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    // Fisher-Yates shuffle
    for (let i = pieceBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieceBag[i], pieceBag[j]] = [pieceBag[j], pieceBag[i]];
    }
  }
}

// Reset the bag
function resetPieceBag() {
  pieceBag = [];
}

export function useGameState(): UseGameStateReturn {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [ghostPiece, setGhostPiece] = useState<GhostPiece | null>(null);
  const [nextPieces, setNextPieces] = useState<NextPieceInfo[]>([]);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [scoreData, setScoreData] = useState<ScoreData>(INITIAL_SCORE_DATA);
  const [clearingLines, setClearingLines] = useState<number[]>([]);

  // Refs for accessing latest state in callbacks
  const boardRef = useRef(board);
  const activePieceRef = useRef(activePiece);
  const ghostPieceRef = useRef(ghostPiece);
  const nextPiecesRef = useRef(nextPieces);
  const gameStateRef = useRef(gameState);
  const scoreDataRef = useRef(scoreData);
  const clearingLinesRef = useRef(clearingLines);

  // Keep refs in sync
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { activePieceRef.current = activePiece; }, [activePiece]);
  useEffect(() => { ghostPieceRef.current = ghostPiece; }, [ghostPiece]);
  useEffect(() => { nextPiecesRef.current = nextPieces; }, [nextPieces]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreDataRef.current = scoreData; }, [scoreData]);
  useEffect(() => { clearingLinesRef.current = clearingLines; }, [clearingLines]);

  // Generate next pieces using bag system
  const generateNextPieces = useCallback((): NextPieceInfo[] => {
    // Always start with a fresh bag to ensure fair distribution
    fillPieceBag();
    const pieces: NextPieceInfo[] = [];
    for (let i = 0; i < 3; i++) {
      if (pieceBag.length === 0) {
        fillPieceBag();
      }
      pieces.push({ type: pieceBag.pop()! });
    }
    return pieces;
  }, []);

  // Calculate ghost piece position
  const calculateGhost = useCallback(
    (piece: ActivePiece, currentBoard: Board): GhostPiece => {
      let ghostY = piece.position.y;

      while (ghostY + 1 < BOARD_ROWS) {
        const testPosition = { x: piece.position.x, y: ghostY + 1 };
        const shape = getTetrominoShape(piece.type, piece.rotation);

        let hasCollision = false;
        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[0].length; c++) {
            if (shape[r][c]) {
              const boardR = testPosition.y + r;
              const boardC = testPosition.x + c;

              if (
                boardR >= BOARD_ROWS ||
                boardC < 0 ||
                boardC >= BOARD_COLS ||
                (boardR >= 0 && currentBoard[boardR]?.[boardC]?.filled)
              ) {
                hasCollision = true;
                break;
              }
            }
          }
          if (hasCollision) break;
        }

        if (hasCollision) break;
        ghostY++;
      }

      return { position: { x: piece.position.x, y: ghostY } };
    },
    []
  );

  // Check if piece shape collides with board at given position
  const checkShapeCollision = useCallback(
    (
      piece: ActivePiece,
      position: { x: number; y: number },
      currentBoard: Board
    ): boolean => {
      const shape = getTetrominoShape(piece.type, piece.rotation);
      const { x, y } = position;

      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
          if (shape[r][c]) {
            const boardR = y + r;
            const boardC = x + c;

            // Check boundaries
            if (boardC < 0 || boardC >= BOARD_COLS || boardR >= BOARD_ROWS) {
              return true;
            }

            // Check collision with placed pieces (only if within top boundary)
            if (boardR >= 0 && currentBoard[boardR]?.[boardC]?.filled) {
              return true;
            }
          }
        }
      }

      return false;
    },
    []
  );

  // Lock the current piece onto the board
  const lockPiece = useCallback((): Board => {
    const piece = activePieceRef.current;
    const currentBoard = boardRef.current;

    if (!piece) return currentBoard;

    const newBoard = currentBoard.map((row: CellState[]) => row.map((cell: CellState) => ({ ...cell })));
    const shape = getTetrominoShape(piece.type, piece.rotation);
    const { x, y } = piece.position;

    // Place piece on board
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
  }, []);

  // Get tetromino size helper
  const getTetrominoSize = (type: TetrominoType, rotation: number): { width: number; height: number } => {
    const shape = getTetrominoShape(type, rotation);
    return { width: shape[0].length, height: shape.length };
  };

  // Spawn a new piece
  const spawnNewPiece = useCallback((): { piece: ActivePiece; nextPieces: NextPieceInfo[]; canPlace: boolean } | null => {
    let currentNextPieces = nextPiecesRef.current;

    // Generate more pieces if needed
    if (currentNextPieces.length < 3) {
      currentNextPieces = [...currentNextPieces, ...generateNextPieces()];
    }

    const nextPieceType = currentNextPieces[0].type;
    const size = getTetrominoSize(nextPieceType, 0);
    const x = Math.floor((BOARD_COLS - size.width) / 2);
    const y = 0;

    const newPiece: ActivePiece = {
      type: nextPieceType,
      position: { x, y },
      rotation: 0,
    };

    // Check if the new piece can be placed (game over check)
    const shape = getTetrominoShape(newPiece.type, newPiece.rotation);
    let canPlace = true;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const boardR = y + r;
          const boardC = x + c;
          if (boardR >= 0 && boardC >= 0 && boardC < BOARD_COLS) {
            if (boardR < BOARD_ROWS && boardRef.current[boardR]?.[boardC]?.filled) {
              canPlace = false;
            }
          }
        }
      }
    }

    const newNextPieces = currentNextPieces.slice(1);

    return {
      piece: newPiece,
      nextPieces: newNextPieces,
      canPlace,
    };
  }, [generateNextPieces]);

  // Process a game tick (gravity)
  const processTick = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const piece = activePieceRef.current;
    if (!piece) return;

    const currentBoard = boardRef.current;

    // Try to move piece down
    const newPosition = { x: piece.position.x, y: piece.position.y + 1 };

    if (!checkShapeCollision(piece, newPosition, currentBoard)) {
      // No collision - move down
      const newPiece = { ...piece, position: newPosition };
      setActivePiece(newPiece);
      setGhostPiece(calculateGhost(newPiece, currentBoard));
    } else {
      // Collision at bottom - lock the piece
      const newBoard = lockPiece();

      // Check for completed lines
      const completedLines = getCompletedLines(newBoard);

      if (completedLines.length > 0) {
        // Mark lines for clearing
        setClearingLines(completedLines);

        // After animation, clear lines and update state
        setTimeout(() => {
          const clearedBoard = clearLines(boardRef.current, clearingLinesRef.current);
          setBoard(clearedBoard);
          setClearingLines([]);

          // Update score
          const newScoreData = updateScore(
            scoreDataRef.current,
            completedLines.length
          );
          setScoreData(newScoreData);

          // Spawn new piece
          const spawnResult = spawnNewPiece();
          if (spawnResult && spawnResult.canPlace) {
            setActivePiece(spawnResult.piece);
            setNextPieces(spawnResult.nextPieces);
            const newGhost = calculateGhost(spawnResult.piece, clearedBoard);
            setGhostPiece(newGhost);
          } else if (spawnResult && !spawnResult.canPlace) {
            // Game over
            setGameState('gameOver');
            setActivePiece(null);
            setGhostPiece(null);
          }
        }, 300);
      } else {
        // No lines cleared - lock board and spawn new piece
        setBoard(newBoard);

        const spawnResult = spawnNewPiece();
        if (spawnResult && spawnResult.canPlace) {
          setActivePiece(spawnResult.piece);
          setNextPieces(spawnResult.nextPieces);
          const newGhost = calculateGhost(spawnResult.piece, newBoard);
          setGhostPiece(newGhost);
        } else if (spawnResult && !spawnResult.canPlace) {
          // Game over
          setGameState('gameOver');
          setActivePiece(null);
          setGhostPiece(null);
        }
      }
    }
  }, [checkShapeCollision, calculateGhost, lockPiece, spawnNewPiece]);

  // Start the game loop
  const dropSpeed = gameState === 'playing' ? getDropSpeed(scoreDataRef.current.level) : Infinity;

  useGameLoop({
    isPlaying: gameState === 'playing',
    isPaused: gameState === 'paused',
    dropSpeed,
    onTick: processTick,
  });

  // Handle keyboard actions
  const handleAction = useCallback(
    (action: KeyboardAction) => {
      if (gameStateRef.current !== 'playing') return;

      const piece = activePieceRef.current;
      const currentBoard = boardRef.current;

      if (!piece) return;

      let newPiece = piece;

      switch (action) {
        case 'moveLeft': {
          const newPosition = { x: piece.position.x - 1, y: piece.position.y };
          if (!checkShapeCollision(piece, newPosition, currentBoard)) {
            newPiece = { ...piece, position: newPosition };
          }
          break;
        }

        case 'moveRight': {
          const newPosition = { x: piece.position.x + 1, y: piece.position.y };
          if (!checkShapeCollision(piece, newPosition, currentBoard)) {
            newPiece = { ...piece, position: newPosition };
          }
          break;
        }

        case 'rotate': {
          const newRotation = (piece.rotation + 1) % 4;
          const testPiece = { ...piece, rotation: newRotation };

          // Basic wall kick: try original position, then shift left/right
          if (!checkShapeCollision(testPiece, testPiece.position, currentBoard)) {
            newPiece = testPiece;
          } else {
            // Try shifting left
            const kickedLeft = { ...testPiece, position: { x: testPiece.position.x - 1, y: testPiece.position.y } };
            if (!checkShapeCollision(kickedLeft, kickedLeft.position, currentBoard)) {
              newPiece = kickedLeft;
            } else {
              // Try shifting right
              const kickedRight = { ...testPiece, position: { x: testPiece.position.x + 1, y: testPiece.position.y } };
              if (!checkShapeCollision(kickedRight, kickedRight.position, currentBoard)) {
                newPiece = kickedRight;
              }
            }
          }
          break;
        }

        case 'softDrop': {
          const newPosition = { x: piece.position.x, y: piece.position.y + 1 };
          if (!checkShapeCollision(piece, newPosition, currentBoard)) {
            newPiece = { ...piece, position: newPosition };
            // Award soft drop points
            const newScoreData = updateScore(
              scoreDataRef.current,
              0,
              1 // 1 cell soft dropped
            );
            setScoreData(newScoreData);
          }
          break;
        }

        case 'hardDrop': {
          let dropY = piece.position.y;
          while (dropY + 1 < BOARD_ROWS) {
            const testPosition = { x: piece.position.x, y: dropY + 1 };
            if (checkShapeCollision(piece, testPosition, currentBoard)) {
              break;
            }
            dropY++;
          }

          const dropDistance = dropY - piece.position.y;
          newPiece = { ...piece, position: { ...piece.position, y: dropY } };

          // Award hard drop points
          const newScoreData = updateScore(
            scoreDataRef.current,
            0,
            0,
            dropDistance // hard drop cells
          );
          setScoreData(newScoreData);
          break;
        }
      }

      // Update piece and recalculate ghost
      if (newPiece !== piece) {
        setActivePiece(newPiece);
        setGhostPiece(calculateGhost(newPiece, currentBoard));
      }
    },
    [checkShapeCollision, calculateGhost]
  );

  // Use keyboard hook
  useKeyboard({ onAction: handleAction });

  // Start game
  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setActivePiece(null);
    setGhostPiece(null);
    setNextPieces([]);
    setScoreData(INITIAL_SCORE_DATA);
    setClearingLines([]);
    resetPieceBag();

    // Generate initial next pieces
    const initialNextPieces = generateNextPieces();

    // Spawn first piece
    const firstPieceType = initialNextPieces[0].type;
    const size = getTetrominoSize(firstPieceType, 0);
    const x = Math.floor((BOARD_COLS - size.width) / 2);

    const firstPiece: ActivePiece = {
      type: firstPieceType,
      position: { x, y: 0 },
      rotation: 0,
    };

    setActivePiece(firstPiece);
    setNextPieces(initialNextPieces);
    setGhostPiece(calculateGhost(firstPiece, createEmptyBoard()));

    // Start playing
    setGameState('playing');
  }, [generateNextPieces, calculateGhost]);

  // Toggle pause
  const togglePause = useCallback(() => {
    setGameState((prev: GameState) => {
      if (prev === 'playing') return 'paused';
      if (prev === 'paused') return 'playing';
      return prev;
    });
  }, []);

  return {
    board,
    activePiece,
    ghostPiece,
    nextPieces,
    gameState,
    scoreData,
    handleAction,
    startGame,
    togglePause,
  };
}