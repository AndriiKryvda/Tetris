import { ScoreData, GameState } from '../types/tetris';

interface ScorePanelProps {
  scoreData: ScoreData;
  gameState: GameState;
  onPause: () => void;
  playerLabel?: string;
  isActive?: boolean;
}

export function ScorePanel({ scoreData, gameState, onPause, playerLabel = 'Score', isActive = true }: ScorePanelProps) {
  return (
    <div className={`score-panel ${!isActive ? 'score-panel--inactive' : ''}`}>
      {playerLabel && (
        <div className="score-panel__player-label">{playerLabel}</div>
      )}
      <div className="score-panel__title">Score</div>
      <div className="score-panel__value">{scoreData.score.toLocaleString()}</div>

      <div className="score-panel__data">
        <div className="score-panel__label">Level</div>
        <div className="score-panel__value" style={{ fontSize: '20px' }}>{scoreData.level}</div>
      </div>

      <div className="score-panel__data">
        <div className="score-panel__label">Lines</div>
        <div className="score-panel__value" style={{ fontSize: '20px' }}>{scoreData.lines}</div>
      </div>

      {gameState === 'playing' || gameState === 'paused' ? (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button className="pause-button" onClick={onPause} aria-label="Pause game">
            {gameState === 'paused' ? '\u25B6' : '\u23F8'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ScorePanel;