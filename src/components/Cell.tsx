import { TetrominoType } from '../types/tetris';

interface CellProps {
  isFilled: boolean;
  pieceType?: TetrominoType | null;
  isGhost: boolean;
  isClearing: boolean;
  player?: 'player1' | 'player2' | null;
  isCenterDivider?: boolean;
}

export function Cell({ isFilled, pieceType, isGhost, isClearing, player, isCenterDivider }: CellProps) {
  let className = 'game-board__cell';

  if (isCenterDivider) {
    className += ' game-board__cell--divider';
  }

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

  // Add player indicator class
  if (player && isFilled && !isGhost) {
    className += ` game-board__cell--${player}`;
  }

  return <div className={className} />;
}