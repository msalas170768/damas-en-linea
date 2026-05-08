import Board from './Board';

function countPieces(board, color) {
  if (!board) return 0;
  return board.flat().filter(cell => cell?.player === color).length;
}

export default function Game({ game }) {
  const {
    board, myColor, myName, opponentName, currentTurn,
    selectedPiece, validCaptures, validMoves, mandatoryPiece, lastMove,
    gameOver, winner, winnerName,
    opponentDisconnected, errorMsg,
    handleCellClick, resetToHome,
  } = game;

  const opponentColor = myColor === 'red' ? 'black' : 'red';
  const isMyTurn = currentTurn === myColor;
  const myPieces = countPieces(board, myColor);
  const opponentPieces = countPieces(board, opponentColor);

  const colorLabel = { red: 'Rojas', black: 'Negras' };
  const iWon = winner === myColor;

  return (
    <div className="game-screen">
      {/* Header: opponent on top, me on bottom */}
      <div className="game-header">
        <div className={`player-info ${currentTurn === opponentColor ? 'active' : ''}`}>
          <div className={`player-chip ${opponentColor}`} />
          <div>
            <div className="player-name">{opponentName || 'Oponente'}</div>
            <div className="player-label">{colorLabel[opponentColor]} · {opponentPieces}</div>
          </div>
        </div>

        <div className={`turn-badge ${isMyTurn ? 'my-turn' : ''}`}>
          {isMyTurn ? 'Tu turno' : 'Esperando…'}
        </div>

        <div className={`player-info ${isMyTurn ? 'active' : ''}`}>
          <div className={`player-chip ${myColor}`} />
          <div>
            <div className="player-name">{myName}</div>
            <div className="player-label">{colorLabel[myColor]} · {myPieces}</div>
          </div>
        </div>
      </div>

      {/* Status messages */}
      <div className="status-bar">
        {opponentDisconnected && (
          <p className="status-msg">El oponente se desconectó</p>
        )}
        {!opponentDisconnected && errorMsg && (
          <p className="status-msg">{errorMsg}</p>
        )}
        {!opponentDisconnected && !errorMsg && mandatoryPiece && isMyTurn && (
          <p className="status-multijump">Captura múltiple — debes continuar con la misma pieza</p>
        )}
      </div>

      <Board
        board={board}
        myColor={myColor}
        selectedPiece={selectedPiece}
        validCaptures={validCaptures}
        validMoves={validMoves}
        mandatoryPiece={mandatoryPiece}
        lastMove={lastMove}
        onCellClick={handleCellClick}
      />

      {/* Game over overlay */}
      {gameOver && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="overlay-emoji">{iWon ? '🏆' : '😔'}</div>
            <div className="overlay-title" style={{ color: iWon ? '#2ecc71' : 'var(--accent)' }}>
              {iWon ? '¡Ganaste!' : 'Perdiste'}
            </div>
            <div className="overlay-subtitle">
              {iWon
                ? `Felicitaciones, ${winnerName}!`
                : `${winnerName} ganó esta partida.`}
            </div>
            <button className="btn btn-primary" onClick={resetToHome}>
              Volver al inicio
            </button>
          </div>
        </div>
      )}

      {/* Opponent disconnected overlay */}
      {opponentDisconnected && !gameOver && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="overlay-emoji">🔌</div>
            <div className="overlay-title">Oponente desconectado</div>
            <div className="overlay-subtitle">
              {opponentName} perdió la conexión. La partida no puede continuar.
            </div>
            <button className="btn btn-primary" onClick={resetToHome}>
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
