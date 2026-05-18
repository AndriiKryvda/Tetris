import { GameState } from '../types/tetris';

interface GameOverlayProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
}

export function GameOverlay({ gameState, onStart, onPause }: GameOverlayProps) {
  if (gameState === 'playing') {
    return null;
  }

  const isMenu = gameState === 'menu';
  const isPaused = gameState === 'paused';
  const isGameOver = gameState === 'gameOver';

  return (
    <div className={`game-overlay ${isMenu || isPaused || isGameOver ? 'game-overlay--visible' : ''}`}>
      <div className="game-overlay__content">
        {isMenu && (
          <>
            <div className="game-overlay__title">Tetris</div>
            <div className="game-overlay__subtitle">Classic Block Puzzle</div>
            <button className="game-overlay__button" onClick={onStart}>
              Play Game
            </button>
          </>
        )}

        {isPaused && (
          <>
            <div className="game-overlay__pause-icon">\u23F8</div>
            <div className="game-overlay__title">Paused</div>
            <div className="game-overlay__subtitle">Press P or Esc to resume</div>
            <button className="game-overlay__button" onClick={onPause}>
              Resume
            </button>
          </>
        )}

        {isGameOver && (
          <>
            <div className="game-overlay__gameover-icon">\u2620</div>
            <div className="game-overlay__title">Game Over</div>
            <div className="game-overlay__score">Score: 0</div>
            <div className="game-overlay__level">Press button to restart</div>
            <button className="game-overlay__button" onClick={onStart}>
              Play Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default GameOverlay;
