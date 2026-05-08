export default function Register({ game }) {
  const { inputName, setInputName, submitName, errorMsg } = game;

  return (
    <div className="screen">
      <h1 className="logo">Damas<span>.</span>io</h1>
      <div className="card">
        <h2>Ingresa tu nombre para jugar</h2>
        <input
          type="text"
          placeholder="Tu nombre"
          value={inputName}
          maxLength={20}
          autoFocus
          onChange={e => setInputName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitName()}
        />
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        <button className="btn btn-primary" onClick={submitName}>
          Continuar
        </button>
      </div>
    </div>
  );
}
