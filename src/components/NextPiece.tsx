import { NextPieceInfo, TetrominoType } from '../types/tetris';
import { getTetrominoShape, TETROMINO_COLORS } from '../game/pieces';

interface NextPieceProps {
  nextPieces: NextPieceInfo[];
}

export function NextPiece({ nextPieces }: NextPieceProps) {
  const piecesToDisplay = nextPieces && nextPieces.length > 0 ? nextPieces.slice(0, 1) : [];

  const renderPieceGrid = (type: TetrominoType) => {
    const shape = getTetrominoShape(type, 0);
    const color = TETROMINO_COLORS[type] || '#ffffff';

    const cells = [];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        const filled = shape[r][c] === 1;
        cells.push(
          <div
            key={`${type}-${r}-${c}`}
            className="next-piece-panel__cell"
            style={{
              backgroundColor: filled ? color : 'transparent',
              opacity: filled ? 1 : 0,
            }}
          />
        );
      }
    }

    return (
      <div
        className="next-piece-panel__piece"
        style={{
          gridTemplateColumns: `repeat(${shape[0].length}, 20px)`,
          gridTemplateRows: `repeat(${shape.length}, 20px)`,
        }}
      >
        {cells}
      </div>
    );
  };

  return (
    <div className="next-piece-panel">
      <div className="next-piece-panel__title">Next</div>
      <div className="next-piece-panel__grid">
        {piecesToDisplay.length > 0 ? (
          piecesToDisplay.map((pieceInfo, index) => (
            <div key={index} className="next-piece-panel__item">
              {renderPieceGrid(pieceInfo.type)}
            </div>
          ))
        ) : (
          <div className="next-piece-panel__placeholder">Press Start</div>
        )}
      </div>
    </div>
  );
}

export default NextPiece;
