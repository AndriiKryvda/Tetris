import { Board, ActivePiece, GhostPiece, TetrominoType } from '../types/tetris';
import { getTetrominoShape } from '../game/pieces';
import { Cell } from './Cell';

interface GameBoardProps {
  board: Board;
  activePiece: ActivePiece | null;
  ghostPiece: GhostPiece | null;
}

export function GameBoard({ board, activePiece, ghostPiece }: GameBoardProps) {
  // Build a rendering map of the board
  // Priority: clearing > filled cell > ghost > active piece
  const renderMap: Map<string, { filled: boolean; pieceType: TetrominoType | null; ghost: boolean; clearing: boolean }> = new Map();

  // Add ghost piece to render map
  if (ghostPiece && activePiece) {
    const ghostShape = getTetrominoShape(activePiece.type, activePiece.rotation);
    const ghostX = ghostPiece.position.x;
    const ghostY = ghostPiece.position.y;

    for (let r = 0; r < ghostShape.length; r++) {
      for (let c = 0; c < ghostShape[0].length; c++) {
        if (ghostShape[r][c]) {
          const key = `${ghostY + r}-${ghostX + c}`;
          renderMap.set(key, { filled: true, pieceType: activePiece.type, ghost: true, clearing: false });
        }
      }
    }
  }

  // Add active piece to render map (overrides ghost)
  if (activePiece) {
    const shape = getTetrominoShape(activePiece.type, activePiece.rotation);
    const { x, y } = activePiece.position;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          const key = `${y + r}-${x + c}`;
          renderMap.set(key, { filled: true, pieceType: activePiece.type, ghost: false, clearing: false });
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

      gridCells.push(
        <Cell
          key={key}
          isFilled={isFilled}
          pieceType={pieceType}
          isGhost={isGhost}
          isClearing={isClearing}
        />
      );
    }
  }

  return (
    <div className="game-board">
      <div className="game-board__grid">
        {gridCells}
      </div>
    </div>
  );
}

export default GameBoard;
