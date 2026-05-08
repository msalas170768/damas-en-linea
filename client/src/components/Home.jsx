export default function Home({ game }) {
  const { playerName, joinCode, setJoinCode, createRoom, joinRoom, errorMsg } = game;

  return (
    <div className="screen">
      <h1 className="logo">Damas<span>.</span>io</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        Hola, <strong style={{ color: 'var(--text)' }}>{playerName}</strong>
      </p>

      <div className="card">
        <h2>Crear una partida nueva</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          Serás las piezas rojas y moverás primero.
        </p>
        <button className="btn btn-primary" onClick={createRoom}>
          Crear sala
        </button>
      </div>

      <div className="card">
        <h2>Unirse a una sala</h2>
        <input
          type="text"
          placeholder="Código de sala (ej. ABC123)"
          value={joinCode}
          maxLength={6}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && joinRoom()}
          style={{ textTransform: 'uppercase', letterSpacing: '0.2em', textAlign: 'center' }}
        />
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        <button className="btn btn-secondary" onClick={joinRoom}>
          Unirse
        </button>
      </div>
    </div>
  );
}
