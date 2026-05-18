import { TetrominoType } from '../types/tetris';

interface CellProps {
  isFilled: boolean;
  pieceType?: TetrominoType | null;
  isGhost: boolean;
  isClearing: boolean;
}

export function Cell({ isFilled, pieceType, isGhost, isClearing }: CellProps) {
  let className = 'game-board__cell';

  if (isFilled && pieceType) {
    className += ` game-board__cell--${pieceType}`;
    if (isGhost) {
      className += ' game-board__cell--ghost';
    } else {
      className += ' game-board__cell--filled';
    }
  }

  if (isClearing) {
    className += ' game-board__cell--clearing';
  }

  if (isFilled && !isGhost) {
    className += ' game-board__cell--active';
  }

  return <div className={className} />;
}
