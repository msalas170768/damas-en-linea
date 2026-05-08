import { useState } from 'react';

export default function WaitingRoom({ game }) {
  const { roomCode, shareLink, playerName } = game;
  const [copied, setCopied] = useState(false);

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="screen">
      <h1 className="logo">Damas<span>.</span>io</h1>

      <div className="card">
        <h2>Sala creada — esperando oponente</h2>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Código de sala
          </p>
          <div className="room-code">{roomCode}</div>
        </div>

        <button className="btn btn-secondary" onClick={() => copy(roomCode)}>
          {copied ? 'Código copiado!' : 'Copiar código'}
        </button>

        <hr className="divider" />

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          O comparte el enlace de invitación
        </p>
        <div className="share-link">
          <input type="text" readOnly value={shareLink} onClick={e => e.target.select()} />
          <button className="btn btn-secondary" onClick={() => copy(shareLink)}>
            Copiar
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span className="pulse" />
          Esperando a que <strong style={{ color: 'var(--text)' }}>{playerName}</strong> sea acompañado…
        </p>
      </div>
    </div>
  );
}
