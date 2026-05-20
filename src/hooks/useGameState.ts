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
  GameMode,
  PlayerId,
} from '../types/tetris';
import { createEmptyBoard } from '../game/board';
import { getCompletedLines, clearLines } from '../game/lines';
import { updateScore } from '../game/scoring';
import { getDropSpeed } from '../game/levels';
import { useKeyboard, KeyboardAction } from './useKeyboard';
import { useGameLoop } from './useGameLoop';
import { getTetrominoShape } from '../game/pieces';

// Board dimensions - 2x wider for shared field, increased height by 5 rows
const BOARD_ROWS = 25;
const BOARD_COLS = 20;

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
  gameMode: GameMode;
  player1Active: boolean;
  player2Active: boolean;
  player1GameOver: boolean;
  player2GameOver: boolean;
  // Dual player state
  dualActivePieces: { player1: ActivePiece | null; player2: ActivePiece | null };
  dualGhostPieces: { player1: GhostPiece | null; player2: GhostPiece | null };
  dualNextPieces: { player1: NextPieceInfo[]; player2: NextPieceInfo[] };
  dualScoreData: { player1: ScoreData; player2: ScoreData };
  handleAction: (action: KeyboardAction) => void;
  startGame: () => void;
  togglePause: () => void;
  setGameMode: (mode: GameMode) => void;
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

  // Game mode state
  const [gameMode, setGameMode] = useState<GameMode>('dual');

  // Dual player state
  const [dualActivePieces, setDualActivePieces] = useState<{ player1: ActivePiece | null; player2: ActivePiece | null }>({
    player1: null,
    player2: null,
  });
  const [dualGhostPieces, setDualGhostPieces] = useState<{ player1: GhostPiece | null; player2: GhostPiece | null }>({
    player1: null,
    player2: null,
  });
  const [dualNextPieces, setDualNextPieces] = useState<{ player1: NextPieceInfo[]; player2: NextPieceInfo[] }>({
    player1: [],
    player2: [],
  });
  const [dualScoreData, setDualScoreData] = useState<{ player1: ScoreData; player2: ScoreData }>({
    player1: INITIAL_SCORE_DATA,
    player2: INITIAL_SCORE_DATA,
  });
  const [player1GameOver, setPlayer1GameOver] = useState(false);
  const [player2GameOver, setPlayer2GameOver] = useState(false);

  // Refs for accessing latest state in callbacks
  const boardRef = useRef(board);
  const activePieceRef = useRef(activePiece);
  const ghostPieceRef = useRef(ghostPiece);
  const nextPiecesRef = useRef(nextPieces);
  const gameStateRef = useRef(gameState);
  const scoreDataRef = useRef(scoreData);
  const clearingLinesRef = useRef(clearingLines);
  const gameModeRef = useRef(gameMode);
  const dualActivePiecesRef = useRef(dualActivePieces);
  const dualGhostPiecesRef = useRef(dualGhostPieces);
  const dualNextPiecesRef = useRef(dualNextPieces);
  const dualScoreDataRef = useRef(dualScoreData);
  const player1GameOverRef = useRef(player1GameOver);
  const player2GameOverRef = useRef(player2GameOver);

  // Keep refs in sync
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { activePieceRef.current = activePiece; }, [activePiece]);
  useEffect(() => { ghostPieceRef.current = ghostPiece; }, [ghostPiece]);
  useEffect(() => { nextPiecesRef.current = nextPieces; }, [nextPieces]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreDataRef.current = scoreData; }, [scoreData]);
  useEffect(() => { clearingLinesRef.current = clearingLines; }, [clearingLines]);
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { dualActivePiecesRef.current = dualActivePieces; }, [dualActivePieces]);
  useEffect(() => { dualGhostPiecesRef.current = dualGhostPieces; }, [dualGhostPieces]);
  useEffect(() => { dualNextPiecesRef.current = dualNextPieces; }, [dualNextPieces]);
  useEffect(() => { dualScoreDataRef.current = dualScoreData; }, [dualScoreData]);
  useEffect(() => { player1GameOverRef.current = player1GameOver; }, [player1GameOver]);
  useEffect(() => { player2GameOverRef.current = player2GameOver; }, [player2GameOver]);

  // Generate next pieces using bag system
  const generateNextPieces = useCallback((): NextPieceInfo[] => {
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
      currentBoard: Board,
      _playerId?: PlayerId
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

  // Lock dual player piece onto the board
  const lockDualPiece = useCallback((playerId: PlayerId): Board => {
    const piece = playerId === 'player1' ? dualActivePiecesRef.current.player1 : dualActivePiecesRef.current.player2;
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

  // Spawn a new single piece
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

  // Spawn a new piece for a specific player
  const spawnNewPieceForPlayer = useCallback((playerId: PlayerId): { piece: ActivePiece; nextPieces: NextPieceInfo[]; canPlace: boolean } | null => {
    let currentNextPieces = playerId === 'player1' ? dualNextPiecesRef.current.player1 : dualNextPiecesRef.current.player2;

    // Generate more pieces if needed
    if (currentNextPieces.length < 3) {
      const morePieces = generateNextPieces();
      currentNextPieces = [...currentNextPieces, ...morePieces];
      if (playerId === 'player1') {
        setDualNextPieces(prev => ({ ...prev, player1: currentNextPieces }));
      } else {
        setDualNextPieces(prev => ({ ...prev, player2: currentNextPieces }));
      }
    }

    const nextPieceType = currentNextPieces[0].type;
    const size = getTetrominoSize(nextPieceType, 0);

    // Spawn at the correct position based on player (left for player1, right for player2)
    let x: number;
    if (playerId === 'player1') {
      // Player 1 spawns on the left side of the board
      x = Math.floor((BOARD_COLS / 2 - size.width) / 2) - 3;
    } else {
      // Player 2 spawns on the right side of the board
      x = Math.floor(BOARD_COLS / 2 + (BOARD_COLS - BOARD_COLS / 2 - size.width) / 2) + 3;
    }
    const y = 0;

    const newPiece: ActivePiece = {
      type: nextPieceType,
      position: { x, y },
      rotation: 0,
    };

    // Check if the new piece can be placed in player's zone
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

    if (playerId === 'player1') {
      setDualNextPieces(prev => ({ ...prev, player1: newNextPieces }));
    } else {
      setDualNextPieces(prev => ({ ...prev, player2: newNextPieces }));
    }

    return {
      piece: newPiece,
      nextPieces: newNextPieces,
      canPlace,
    };
  }, [generateNextPieces]);

  // Process a single player game tick (gravity)
  const processSingleTick = useCallback(() => {
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
        setClearingLines(completedLines);

        setTimeout(() => {
          const clearedBoard = clearLines(boardRef.current, clearingLinesRef.current);
          setBoard(clearedBoard);
          setClearingLines([]);

          const newScoreData = updateScore(
            scoreDataRef.current,
            completedLines.length
          );
          setScoreData(newScoreData);

          const spawnResult = spawnNewPiece();
          if (spawnResult && spawnResult.canPlace) {
            setActivePiece(spawnResult.piece);
            setNextPieces(spawnResult.nextPieces);
            const newGhost = calculateGhost(spawnResult.piece, clearedBoard);
            setGhostPiece(newGhost);
          } else if (spawnResult && !spawnResult.canPlace) {
            setGameState('gameOver');
            setActivePiece(null);
            setGhostPiece(null);
          }
        }, 300);
      } else {
        setBoard(newBoard);

        const spawnResult = spawnNewPiece();
        if (spawnResult && spawnResult.canPlace) {
          setActivePiece(spawnResult.piece);
          setNextPieces(spawnResult.nextPieces);
          const newGhost = calculateGhost(spawnResult.piece, newBoard);
          setGhostPiece(newGhost);
        } else if (spawnResult && !spawnResult.canPlace) {
          setGameState('gameOver');
          setActivePiece(null);
          setGhostPiece(null);
        }
      }
    }
  }, [checkShapeCollision, calculateGhost, lockPiece, spawnNewPiece]);

  // Process a dual player game tick for a specific player
  const processDualTick = useCallback((playerId: PlayerId) => {
    if (gameStateRef.current !== 'playing') return;

    const piece = playerId === 'player1' ? dualActivePiecesRef.current.player1 : dualActivePiecesRef.current.player2;
    if (!piece) return;

    const currentBoard = boardRef.current;

    // Try to move piece down
    const newPosition = { x: piece.position.x, y: piece.position.y + 1 };

    if (!checkShapeCollision(piece, newPosition, currentBoard, playerId)) {
      // No collision - move down
      const newPiece = { ...piece, position: newPosition };

      if (playerId === 'player1') {
        setDualActivePieces(prev => ({ ...prev, player1: newPiece }));
        setDualGhostPieces(prev => ({ ...prev, player1: calculateGhost(newPiece, currentBoard) }));
      } else {
        setDualActivePieces(prev => ({ ...prev, player2: newPiece }));
        setDualGhostPieces(prev => ({ ...prev, player2: calculateGhost(newPiece, currentBoard) }));
      }
    } else {
      // Collision at bottom - lock the piece
      const newBoard = lockDualPiece(playerId);

      // Check for completed lines
      const completedLines = getCompletedLines(newBoard);

      if (completedLines.length > 0) {
        setClearingLines(completedLines);

        setTimeout(() => {
          const clearedBoard = clearLines(boardRef.current, clearingLinesRef.current);
          setBoard(clearedBoard);
          setClearingLines([]);

          // Update the score for the player who cleared lines
          if (playerId === 'player1') {
            const newScoreData = updateScore(
              dualScoreDataRef.current.player1,
              completedLines.length
            );
            setDualScoreData(prev => ({ ...prev, player1: newScoreData }));
          } else {
            const newScoreData = updateScore(
              dualScoreDataRef.current.player2,
              completedLines.length
            );
            setDualScoreData(prev => ({ ...prev, player2: newScoreData }));
          }

          // Spawn new piece for this player
          const spawnResult = spawnNewPieceForPlayer(playerId);
          if (spawnResult && spawnResult.canPlace) {
            if (playerId === 'player1') {
              setDualActivePieces(prev => ({ ...prev, player1: spawnResult.piece }));
              setDualGhostPieces(prev => ({ ...prev, player1: calculateGhost(spawnResult.piece, clearedBoard) }));
            } else {
              setDualActivePieces(prev => ({ ...prev, player2: spawnResult.piece }));
              setDualGhostPieces(prev => ({ ...prev, player2: calculateGhost(spawnResult.piece, clearedBoard) }));
            }
          } else if (spawnResult && !spawnResult.canPlace) {
            // This player is out, but game continues if the other player is still playing
            if (playerId === 'player1') {
              setPlayer1GameOver(true);
              setDualActivePieces(prev => ({ ...prev, player1: null }));
              setDualGhostPieces(prev => ({ ...prev, player1: null }));
            } else {
              setPlayer2GameOver(true);
              setDualActivePieces(prev => ({ ...prev, player2: null }));
              setDualGhostPieces(prev => ({ ...prev, player2: null }));
            }

            // Check if both players are out
            if (playerId === 'player1' && player2GameOverRef.current) {
              setGameState('gameOver');
            } else if (playerId === 'player2' && player1GameOverRef.current) {
              setGameState('gameOver');
            }
          }
        }, 300);
      } else {
        setBoard(newBoard);

        const spawnResult = spawnNewPieceForPlayer(playerId);
        if (spawnResult && spawnResult.canPlace) {
          if (playerId === 'player1') {
            setDualActivePieces(prev => ({ ...prev, player1: spawnResult.piece }));
            setDualGhostPieces(prev => ({ ...prev, player1: calculateGhost(spawnResult.piece, newBoard) }));
          } else {
            setDualActivePieces(prev => ({ ...prev, player2: spawnResult.piece }));
            setDualGhostPieces(prev => ({ ...prev, player2: calculateGhost(spawnResult.piece, newBoard) }));
          }
        } else if (spawnResult && !spawnResult.canPlace) {
          if (playerId === 'player1') {
            setPlayer1GameOver(true);
            setDualActivePieces(prev => ({ ...prev, player1: null }));
            setDualGhostPieces(prev => ({ ...prev, player1: null }));
          } else {
            setPlayer2GameOver(true);
            setDualActivePieces(prev => ({ ...prev, player2: null }));
            setDualGhostPieces(prev => ({ ...prev, player2: null }));
          }

          if (playerId === 'player1' && player2GameOverRef.current) {
            setGameState('gameOver');
          } else if (playerId === 'player2' && player1GameOverRef.current) {
            setGameState('gameOver');
          }
        }
      }
    }
  }, [checkShapeCollision, calculateGhost, lockDualPiece, spawnNewPieceForPlayer]);

  // Start the game loop
  const dropSpeed = gameState === 'playing' ? getDropSpeed(scoreDataRef.current.level) : Infinity;

  // Dual player drop speed (use higher level for slower speed)
  const dualDropSpeed = gameState === 'playing' ?
    Math.max(getDropSpeed(dualScoreDataRef.current.player1.level), getDropSpeed(dualScoreDataRef.current.player2.level)) :
    Infinity;

  // Use game loop for single player mode
  useGameLoop({
    isPlaying: gameState === 'playing' && gameModeRef.current === 'single',
    isPaused: gameState === 'paused',
    dropSpeed,
    onTick: processSingleTick,
  });

  // Use game loop for dual player mode
  useGameLoop({
    isPlaying: gameState === 'playing' && gameModeRef.current === 'dual',
    isPaused: gameState === 'paused',
    dropSpeed: dualDropSpeed,
    onTick: () => {
      // Process both players' ticks
      processDualTick('player1');
      processDualTick('player2');
    },
  });

  // Handle keyboard actions
  const handleAction = useCallback(
    (action: KeyboardAction) => {
      // Handle pause action regardless of game state
      if (action === 'pause') {
        togglePause();
        return;
      }

      if (gameStateRef.current !== 'playing') return;

      const currentBoard = boardRef.current;

      if (gameModeRef.current === 'single') {
        // Single player mode
        const piece = activePieceRef.current;
        if (!piece) return;

        let newPiece = piece;

        switch (action) {
          case 'player1-moveLeft': {
            const newPosition = { x: piece.position.x - 1, y: piece.position.y };
            if (!checkShapeCollision(piece, newPosition, currentBoard)) {
              newPiece = { ...piece, position: newPosition };
            }
            break;
          }

          case 'player1-moveRight': {
            const newPosition = { x: piece.position.x + 1, y: piece.position.y };
            if (!checkShapeCollision(piece, newPosition, currentBoard)) {
              newPiece = { ...piece, position: newPosition };
            }
            break;
          }

          case 'player1-rotate': {
            const newRotation = (piece.rotation + 1) % 4;
            const testPiece = { ...piece, rotation: newRotation };

            if (!checkShapeCollision(testPiece, testPiece.position, currentBoard)) {
              newPiece = testPiece;
            } else {
              const kickedLeft = { ...testPiece, position: { x: testPiece.position.x - 1, y: testPiece.position.y } };
              if (!checkShapeCollision(kickedLeft, kickedLeft.position, currentBoard)) {
                newPiece = kickedLeft;
              } else {
                const kickedRight = { ...testPiece, position: { x: testPiece.position.x + 1, y: testPiece.position.y } };
                if (!checkShapeCollision(kickedRight, kickedRight.position, currentBoard)) {
                  newPiece = kickedRight;
                }
              }
            }
            break;
          }

          case 'player1-softDrop': {
            const newPosition = { x: piece.position.x, y: piece.position.y + 1 };
            if (!checkShapeCollision(piece, newPosition, currentBoard)) {
              newPiece = { ...piece, position: newPosition };
              const newScoreData = updateScore(
                scoreDataRef.current,
                0,
                1
              );
              setScoreData(newScoreData);
            }
            break;
          }

          case 'player1-hardDrop': {
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

            const newScoreData = updateScore(
              scoreDataRef.current,
              0,
              0,
              dropDistance
            );
            setScoreData(newScoreData);
            break;
          }
        }

        if (newPiece !== piece) {
          setActivePiece(newPiece);
          setGhostPiece(calculateGhost(newPiece, currentBoard));
        }
      } else {
        // Dual player mode
        // Parse the player ID from the action
        if (action.startsWith('player1-')) {
          const player1Piece = dualActivePiecesRef.current.player1;
          if (!player1Piece) return;

          let newPiece = player1Piece;
          const subAction = action.replace('player1-', '') as 'moveLeft' | 'moveRight' | 'rotate' | 'softDrop' | 'hardDrop';

          switch (subAction) {
            case 'moveLeft': {
              const newPosition = { x: player1Piece.position.x - 1, y: player1Piece.position.y };
              if (!checkShapeCollision(player1Piece, newPosition, currentBoard, 'player1')) {
                newPiece = { ...player1Piece, position: newPosition };
              }
              break;
            }

            case 'moveRight': {
              const newPosition = { x: player1Piece.position.x + 1, y: player1Piece.position.y };
              if (!checkShapeCollision(player1Piece, newPosition, currentBoard, 'player1')) {
                newPiece = { ...player1Piece, position: newPosition };
              }
              break;
            }

            case 'rotate': {
              const newRotation = (player1Piece.rotation + 1) % 4;
              const testPiece = { ...player1Piece, rotation: newRotation };

              if (!checkShapeCollision(testPiece, testPiece.position, currentBoard, 'player1')) {
                newPiece = testPiece;
              } else {
                const kickedLeft = { ...testPiece, position: { x: testPiece.position.x - 1, y: testPiece.position.y } };
                if (!checkShapeCollision(kickedLeft, kickedLeft.position, currentBoard, 'player1')) {
                  newPiece = kickedLeft;
                } else {
                  const kickedRight = { ...testPiece, position: { x: testPiece.position.x + 1, y: testPiece.position.y } };
                  if (!checkShapeCollision(kickedRight, kickedRight.position, currentBoard, 'player1')) {
                    newPiece = kickedRight;
                  }
                }
              }
              break;
            }

            case 'softDrop': {
              const newPosition = { x: player1Piece.position.x, y: player1Piece.position.y + 1 };
              if (!checkShapeCollision(player1Piece, newPosition, currentBoard, 'player1')) {
                newPiece = { ...player1Piece, position: newPosition };
                const newScoreData = updateScore(
                  dualScoreDataRef.current.player1,
                  0,
                  1
                );
                setDualScoreData(prev => ({ ...prev, player1: newScoreData }));
              }
              break;
            }

            case 'hardDrop': {
              let dropY = player1Piece.position.y;
              while (dropY + 1 < BOARD_ROWS) {
                const testPosition = { x: player1Piece.position.x, y: dropY + 1 };
                if (checkShapeCollision(player1Piece, testPosition, currentBoard, 'player1')) {
                  break;
                }
                dropY++;
              }

              const dropDistance = dropY - player1Piece.position.y;
              newPiece = { ...player1Piece, position: { ...player1Piece.position, y: dropY } };

              const newScoreData = updateScore(
                dualScoreDataRef.current.player1,
                0,
                0,
                dropDistance
              );
              setDualScoreData(prev => ({ ...prev, player1: newScoreData }));
              break;
            }
          }

          if (newPiece !== player1Piece) {
            setDualActivePieces(prev => ({ ...prev, player1: newPiece }));
            setDualGhostPieces(prev => ({ ...prev, player1: calculateGhost(newPiece, currentBoard) }));
          }
        } else if (action.startsWith('player2-')) {
          const player2Piece = dualActivePiecesRef.current.player2;
          if (!player2Piece) return;

          let newPiece = player2Piece;
          const subAction = action.replace('player2-', '') as 'moveLeft' | 'moveRight' | 'rotate' | 'softDrop' | 'hardDrop';

          switch (subAction) {
            case 'moveLeft': {
              const newPosition = { x: player2Piece.position.x - 1, y: player2Piece.position.y };
              if (!checkShapeCollision(player2Piece, newPosition, currentBoard, 'player2')) {
                newPiece = { ...player2Piece, position: newPosition };
              }
              break;
            }

            case 'moveRight': {
              const newPosition = { x: player2Piece.position.x + 1, y: player2Piece.position.y };
              if (!checkShapeCollision(player2Piece, newPosition, currentBoard, 'player2')) {
                newPiece = { ...player2Piece, position: newPosition };
              }
              break;
            }

            case 'rotate': {
              const newRotation = (player2Piece.rotation + 1) % 4;
              const testPiece = { ...player2Piece, rotation: newRotation };

              if (!checkShapeCollision(testPiece, testPiece.position, currentBoard, 'player2')) {
                newPiece = testPiece;
              } else {
                const kickedLeft = { ...testPiece, position: { x: testPiece.position.x - 1, y: testPiece.position.y } };
                if (!checkShapeCollision(kickedLeft, kickedLeft.position, currentBoard, 'player2')) {
                  newPiece = kickedLeft;
                } else {
                  const kickedRight = { ...testPiece, position: { x: testPiece.position.x + 1, y: testPiece.position.y } };
                  if (!checkShapeCollision(kickedRight, kickedRight.position, currentBoard, 'player2')) {
                    newPiece = kickedRight;
                  }
                }
              }
              break;
            }

            case 'softDrop': {
              const newPosition = { x: player2Piece.position.x, y: player2Piece.position.y + 1 };
              if (!checkShapeCollision(player2Piece, newPosition, currentBoard, 'player2')) {
                newPiece = { ...player2Piece, position: newPosition };
                const newScoreData = updateScore(
                  dualScoreDataRef.current.player2,
                  0,
                  1
                );
                setDualScoreData(prev => ({ ...prev, player2: newScoreData }));
              }
              break;
            }

            case 'hardDrop': {
              let dropY = player2Piece.position.y;
              while (dropY + 1 < BOARD_ROWS) {
                const testPosition = { x: player2Piece.position.x, y: dropY + 1 };
                if (checkShapeCollision(player2Piece, testPosition, currentBoard, 'player2')) {
                  break;
                }
                dropY++;
              }

              const dropDistance = dropY - player2Piece.position.y;
              newPiece = { ...player2Piece, position: { ...player2Piece.position, y: dropY } };

              const newScoreData = updateScore(
                dualScoreDataRef.current.player2,
                0,
                0,
                dropDistance
              );
              setDualScoreData(prev => ({ ...prev, player2: newScoreData }));
              break;
            }
          }

          if (newPiece !== player2Piece) {
            setDualActivePieces(prev => ({ ...prev, player2: newPiece }));
            setDualGhostPieces(prev => ({ ...prev, player2: calculateGhost(newPiece, currentBoard) }));
          }
        }
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
    setPlayer1GameOver(false);
    setPlayer2GameOver(false);
    resetPieceBag();

    if (gameMode === 'single') {
      // Single player mode
      const initialNextPieces = generateNextPieces();
      fillPieceBag();
      const firstPieceType = pieceBag.pop()!;
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
      setGameState('playing');
    } else {
      // Dual player mode - spawn both pieces at center of the shared 20-column board
      // Offset them slightly so they don't completely overlap
      const p1NextPieces = generateNextPieces();
      const p2NextPieces = generateNextPieces();

      fillPieceBag();
      const p1PieceType = pieceBag.pop()!;
      const p1Size = getTetrominoSize(p1PieceType, 0);
      // Player 1 spawns on the left side of the board
      const p1X = Math.floor((BOARD_COLS / 2 - p1Size.width) / 2) - 3;

      const p1Piece: ActivePiece = {
        type: p1PieceType,
        position: { x: p1X, y: 0 },
        rotation: 0,
      };

      fillPieceBag();
      const p2PieceType = pieceBag.pop()!;
      const p2Size = getTetrominoSize(p2PieceType, 0);
      // Player 2 spawns on the right side of the board
      const p2X = Math.floor(BOARD_COLS / 2 + (BOARD_COLS - BOARD_COLS / 2 - p2Size.width) / 2) + 3;

      const p2Piece: ActivePiece = {
        type: p2PieceType,
        position: { x: p2X, y: 0 },
        rotation: 0,
      };

      setDualActivePieces({ player1: p1Piece, player2: p2Piece });
      setDualNextPieces({ player1: p1NextPieces, player2: p2NextPieces });
      setDualScoreData({ player1: INITIAL_SCORE_DATA, player2: INITIAL_SCORE_DATA });
      setDualGhostPieces({
        player1: calculateGhost(p1Piece, createEmptyBoard()),
        player2: calculateGhost(p2Piece, createEmptyBoard()),
      });
      setGameState('playing');
    }
  }, [gameMode, generateNextPieces, calculateGhost]);

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
    gameMode,
    player1Active: !player1GameOver,
    player2Active: !player2GameOver,
    player1GameOver,
    player2GameOver,
    dualActivePieces,
    dualGhostPieces,
    dualNextPieces,
    dualScoreData,
    handleAction,
    startGame,
    togglePause,
    setGameMode,
  };
}