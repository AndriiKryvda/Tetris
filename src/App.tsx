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
    gameMode,
    player1Active,
    player2Active,
    player1GameOver,
    player2GameOver,
    dualActivePieces,
    dualGhostPieces,
    dualNextPieces,
    dualScoreData,
    startGame,
    togglePause,
    setGameMode,
  } = useGameState()

  // Determine the winner for game over screen
  const winner = (player1GameOver && player2GameOver) ? 
    (dualScoreData.player1.lines > dualScoreData.player2.lines ? 'player1' : 'player2') : 
    null;

  return (
    <div className="app">
      <div className="game-container">
        {/* Left Panel - Next Piece and Score for Player 1 */}
        <div className="left-panel">
          {gameMode === 'dual' && (
            <>
              <NextPiece nextPieces={dualNextPieces.player1} />
              <ScorePanel 
                scoreData={dualScoreData.player1} 
                gameState={gameState} 
                onPause={togglePause}
                playerLabel="Player 1"
                isActive={player1Active}
              />
            </>
          )}
          {gameMode === 'single' && (
            <ScorePanel scoreData={scoreData} gameState={gameState} onPause={togglePause} />
          )}
        </div>

        {/* Center - Game Board */}
        <div className="center-panel">
          <GameBoard
            board={board}
            activePiece={gameMode === 'single' ? activePiece : null}
            ghostPiece={gameMode === 'single' ? ghostPiece : null}
            dualActivePieces={gameMode === 'dual' ? dualActivePieces : null}
            dualGhostPieces={gameMode === 'dual' ? dualGhostPieces : null}
            gameMode={gameMode}
            player1Active={player1Active}
            player2Active={player2Active}
          />
          <GameOverlay
            gameState={gameState}
            gameMode={gameMode}
            onStart={startGame}
            onPause={togglePause}
            onModeChange={setGameMode}
            winner={gameMode === 'dual' ? winner : null}
          />
        </div>

        {/* Right Panel - Next Piece and Score for Player 2 */}
        <div className="right-panel">
          {gameMode === 'dual' && (
            <>
              <NextPiece nextPieces={dualNextPieces.player2} />
              <ScorePanel 
                scoreData={dualScoreData.player2} 
                gameState={gameState} 
                onPause={togglePause}
                playerLabel="Player 2"
                isActive={player2Active}
              />
            </>
          )}
          {gameMode === 'single' && (
            <NextPiece nextPieces={nextPieces} />
          )}
        </div>
      </div>

      {/* Controls Help */}
      <div className="controls-help">
        <div className="controls-help__item">
          <span className="controls-help__key">A D</span>
          <span className="controls-help__label">P1 Move</span>
        </div>
        <div className="controls-help__item">
          <span className="controls-help__key">W</span>
          <span className="controls-help__label">P1 Rotate</span>
        </div>
        <div className="controls-help__item">
          <span className="controls-help__key">S</span>
          <span className="controls-help__label">P1 Drop</span>
        </div>
        <div className="controls-help__item">
          <span className="controls-help__key">E</span>
          <span className="controls-help__label">P1 Hard Drop</span>
        </div>
        {gameMode === 'dual' && (
          <>
            <div className="controls-help__item">
              <span className="controls-help__key">← →</span>
              <span className="controls-help__label">P2 Move</span>
            </div>
            <div className="controls-help__item">
              <span className="controls-help__key">↑</span>
              <span className="controls-help__label">P2 Rotate</span>
            </div>
            <div className="controls-help__item">
              <span className="controls-help__key">↓</span>
              <span className="controls-help__label">P2 Drop</span>
            </div>
            <div className="controls-help__item">
              <span className="controls-help__key">Space</span>
              <span className="controls-help__label">P2 Hard Drop</span>
            </div>
          </>
        )}
        <div className="controls-help__item">
          <span className="controls-help__key">P / Esc</span>
          <span className="controls-help__label">Pause</span>
        </div>
      </div>
    </div>
  )
}

export default App