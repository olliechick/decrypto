import { GameOverScreen } from './components/GameOverScreen';
import { SetupScreen } from './components/SetupScreen';
import { TeamScreen } from './components/TeamScreen';
import { useGame } from './hooks/useGame';
import { useWakeLock } from './hooks/useWakeLock';

// One team's phone: one screen per phase of the game (see src/game/state.ts)
export default function App() {
  const { game, actions } = useGame();
  useWakeLock(game.phase === 'PLAYING');

  switch (game.phase) {
    case 'SETUP':
      return <SetupScreen onStart={actions.startGame} />;
    case 'PLAYING':
      return <TeamScreen game={game} actions={actions} />;
    case 'GAME_OVER':
      return <GameOverScreen game={game} onNewGame={actions.newGame} />;
  }
}
