import { Board, ActivePiece, GhostPiece, TetrominoType } from '../types/tetris';
import { getTetrominoShape } from '../game/pieces';
import { Cell } from './Cell';

interface GameBoardProps {
  board: Board;
  activePiece: ActivePiece | null;
  ghostPiece: GhostPiece | null;
  // Dual player props
  dualActivePieces?: { player1: ActivePiece | null; player2: ActivePiece | null } | null;
  dualGhostPieces?: { player1: GhostPiece | null; player2: GhostPiece | null } | null;
  gameMode?: 'single' | 'dual';
  player1Active?: boolean;
  player2Active?: boolean;
  boardWidth?: number;
}

export function GameBoard({ 
  board, 
  activePiece, 
  ghostPiece, 
  dualActivePieces, 
  dualGhostPieces, 
  gameMode = 'single',
  player1Active = true,
  player2Active = true,
  boardWidth = 20,
}: GameBoardProps) {
  // Build a rendering map of the board
  // Priority: filled cell > active piece > ghost piece
  const renderMap: Map<string, { filled: boolean; pieceType: TetrominoType | null; ghost: boolean; clearing: boolean; player: 'player1' | 'player2' | null }> = new Map();

  // Use the board width from the hook (20 columns)
  const cols = board[0]?.length ?? boardWidth;

  // Determine which pieces to use based on game mode
  const currentActivePiece = gameMode === 'dual' && dualActivePieces?.player1 ? dualActivePieces.player1 : activePiece;
  const currentGhostPiece = gameMode === 'dual' && dualGhostPieces?.player1 ? dualGhostPieces.player1 : ghostPiece;

  // Add Player 2 pieces for dual mode
  const p2ActivePiece = gameMode === 'dual' ? dualActivePieces?.player2 || null : null;
  const p2GhostPiece = gameMode === 'dual' ? dualGhostPieces?.player2 || null : null;

  // Add ghost piece to render map (Player 1)
  if (currentGhostPiece && currentActivePiece && player1Active) {
    const ghostShape = getTetrominoShape(currentActivePiece.type, currentActivePiece.rotation);
    const ghostX = currentGhostPiece.position.x;
    const ghostY = currentGhostPiece.position.y;

    for (let r = 0; r < ghostShape.length; r++) {
      for (let c = 0; c < ghostShape[0].length; c++) {
        if (ghostShape[r][c]) {
          const key = `${ghostY + r}-${ghostX + c}`;
          renderMap.set(key, { filled: true, pieceType: currentActivePiece.type, ghost: true, clearing: false, player: 'player1' });
        }
      }
    }
  }

  // Add ghost piece (Player 2)
  if (p2GhostPiece && p2ActivePiece && player2Active) {
    const ghostShape = getTetrominoShape(p2ActivePiece.type, p2ActivePiece.rotation);
    const ghostX = p2GhostPiece.position.x;
    const ghostY = p2GhostPiece.position.y;

    for (let r = 0; r < ghostShape.length; r++) {
      for (let c = 0; c < ghostShape[0].length; c++) {
        if (ghostShape[r][c]) {
          const key = `${ghostY + r}-${ghostX + c}`;
          renderMap.set(key, { filled: true, pieceType: p2ActivePiece.type, ghost: true, clearing: false, player: 'player2' });
        }
      }
    }
  }

  // Add active piece to render map (Player 1) - overrides ghost
  if (currentActivePiece && player1Active) {
    const shape = getTetrominoShape(currentActivePiece.type, currentActivePiece.rotation);
    const { x, y } = currentActivePiece.position;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const key = `${y + r}-${x + c}`;
          renderMap.set(key, { filled: true, pieceType: currentActivePiece.type, ghost: false, clearing: false, player: 'player1' });
        }
      }
    }
  }

  // Add active piece (Player 2) - overrides ghost
  if (p2ActivePiece && player2Active) {
    const shape = getTetrominoShape(p2ActivePiece.type, p2ActivePiece.rotation);
    const { x, y } = p2ActivePiece.position;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const key = `${y + r}-${x + c}`;
          renderMap.set(key, { filled: true, pieceType: p2ActivePiece.type, ghost: false, clearing: false, player: 'player2' });
        }
      }
    }
  }

  // Render the board grid
  const gridCells = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const cell = board[r][c];
      const key = `${r}-${c}`;
      const renderInfo = renderMap.get(key);

      const isFilled = cell.filled || (renderInfo?.filled ?? false);
      const pieceType = renderInfo?.pieceType ?? cell.type;
      const isGhost = renderInfo?.ghost ?? false;
      const isClearing = renderInfo?.clearing ?? false;
       const cellPlayer = renderInfo?.player ?? (cell.filled ? (c >= Math.floor(cols / 2) ? 'player2' as const : 'player1' as const) : null);

      // No more zone dividers - shared field
      const isCenterDivider = false;

      gridCells.push(
        <Cell
          key={key}
          isFilled={isFilled}
          pieceType={pieceType}
          isGhost={isGhost}
          isClearing={isClearing}
          player={cellPlayer}
          isCenterDivider={isCenterDivider}
        />
      );
    }
  }

  return (
    <div className="game-board">
      {/* No zone labels - shared field for both players */}
      <div className="game-board__grid">
        {gridCells}
      </div>
    </div>
  );
}

export default GameBoard;