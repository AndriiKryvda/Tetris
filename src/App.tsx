import GameBoard from './components/GameBoard'
import NextPiece from './components/NextPiece'
import ScorePanel from './components/ScorePanel'
import GameOverlay from './components/GameOverlay'
import { useGameState } from './hooks/useGameState'
import './styles/GameBoard.css'
import './styles/GameOverlay.css'

function App() {
  const {
    board,
    activePiece,
    ghostPiece,
    nextPieces,
    gameState,
    scoreData,
    startGame,
    togglePause,
  } = useGameState()

  return (
    <div className="app">
      <div className="game-container">
        {/* Left Panel - Score */}
        <div className="left-panel">
          <ScorePanel scoreData={scoreData} gameState={gameState} onPause={togglePause} />
        </div>

        {/* Center - Game Board */}
        <div className="center-panel">
          <GameBoard
            board={board}
            activePiece={activePiece}
            ghostPiece={ghostPiece}
          />
          <GameOverlay
            gameState={gameState}
            onStart={startGame}
            onPause={togglePause}
          />
        </div>

        {/* Right Panel - Next Piece */}
        <div className="right-panel">
          <NextPiece nextPieces={nextPieces} />
        </div>
      </div>

      {/* Controls Help */}
      <div className="controls-help">
        <div className="controls-help__item">
          <span className="controls-help__key">← →</span>
          <span className="controls-help__label">Move</span>
        </div>
        <div className="controls-help__item">
          <span className="controls-help__key">↑ / W</span>
          <span className="controls-help__label">Rotate</span>
        </div>
        <div className="controls-help__item">
          <span className="controls-help__key">↓ / S</span>
          <span className="controls-help__label">Soft Drop</span>
        </div>
        <div className="controls-help__item">
          <span className="controls-help__key">Space</span>
          <span className="controls-help__label">Hard Drop</span>
        </div>
        <div className="controls-help__item">
          <span className="controls-help__key">P / Esc</span>
          <span className="controls-help__label">Pause</span>
        </div>
      </div>
    </div>
  )
}

export default App
