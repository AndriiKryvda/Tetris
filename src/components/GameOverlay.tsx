import { GameState, GameMode } from '../types/tetris';

interface GameOverlayProps {
  gameState: GameState;
  gameMode: GameMode;
  onStart: () => void;
  onPause: () => void;
  onModeChange?: (mode: GameMode) => void;
  winner?: 'player1' | 'player2' | null;
}

export function GameOverlay({ gameState, gameMode, onStart, onPause, onModeChange, winner }: GameOverlayProps) {
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
            
            {/* Game Mode Selection */}
            {onModeChange && (
              <div className="game-overlay__mode-select">
                <div className="game-overlay__mode-label">Game Mode:</div>
                <div className="game-overlay__mode-buttons">
                  <button
                    className={`game-overlay__mode-button ${gameMode === 'single' ? 'game-overlay__mode-button--active' : ''}`}
                    onClick={() => onModeChange('single')}
                  >
                    Single Player
                  </button>
                  <button
                    className={`game-overlay__mode-button ${gameMode === 'dual' ? 'game-overlay__mode-button--active' : ''}`}
                    onClick={() => onModeChange('dual')}
                  >
                    Dual Player
                  </button>
                </div>
              </div>
            )}
            
            <button className="game-overlay__button" onClick={onStart}>
              {gameMode === 'dual' ? 'Start Game' : 'Play Game'}
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
            <div className="game-overlay__title">
              {gameMode === 'dual' && winner ? `${winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!` : 'Game Over'}
            </div>
            <div className="game-overlay__score">
              {gameMode === 'dual' ? (
                <>
                  <span>P1: {winner === 'player1' ? 'Winner' : 'Loser'} | P2: {winner === 'player2' ? 'Winner' : 'Loser'}</span>
                </>
              ) : (
                'Score: 0'
              )}
            </div>
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