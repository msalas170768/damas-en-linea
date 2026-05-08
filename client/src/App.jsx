import { useGame } from './hooks/useGame';
import Register from './components/Register';
import Home from './components/Home';
import WaitingRoom from './components/WaitingRoom';
import Game from './components/Game';

export default function App() {
  const game = useGame();

  return (
    <div className="app">
      {game.screen === 'register' && <Register game={game} />}
      {game.screen === 'home' && <Home game={game} />}
      {game.screen === 'waiting' && <WaitingRoom game={game} />}
      {game.screen === 'game' && <Game game={game} />}
    </div>
  );
}
