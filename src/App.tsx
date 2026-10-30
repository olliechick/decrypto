import { useEffect, useState } from 'react';
import { Button } from './components/Button';
import { GameOverScreen } from './components/GameOverScreen';
import { Overlay } from './components/Overlay';
import { SetupScreen } from './components/SetupScreen';
import { TeamScreen } from './components/TeamScreen';
import { readJoinCode, withoutJoinCode } from './game/joinLink';
import { isValidGameCode } from './game/random';
import { useGame } from './hooks/useGame';
import { useWakeLock } from './hooks/useWakeLock';

// One team's phone: one screen per phase of the game (see src/game/state.ts)
export default function App() {
  const { game, actions } = useGame();
  useWakeLock(game.phase === 'PLAYING');

  // A scanned QR code opens the app with ?join=CODE. Read it once, then take it out of the address so a refresh
  // doesn't offer to join again. A link to this phone's own game (its own QR code, say) is ignored, and so is a link
  // from a different version of the app while a game is going (only the setup screen explains those), so it can't
  // turn up later on the next new game.
  const [joinCode, setJoinCode] = useState(() => {
    const code = readJoinCode(window.location.search);
    if (code === game.gameCode || (code && game.phase !== 'SETUP' && !isValidGameCode(code))) return null;
    return code;
  });
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', withoutJoinCode(window.location.href));
  }, []);

  // Scanned on a phone with a game already going (or just over): check before throwing that game away
  if (joinCode && game.phase !== 'SETUP') {
    return (
      <Overlay title={`Join game ${joinCode}?`} onClose={() => setJoinCode(null)}>
        <p className="text-white/80">
          {game.phase === 'PLAYING'
            ? 'This phone already has a game going. Joining the new one ends it.'
            : "This phone's last game is over. Joining the new one clears it."}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setJoinCode(null)}>
            {game.phase === 'PLAYING' ? 'Keep this game' : 'Not now'}
          </Button>
          <Button onClick={actions.newGame}>Join {joinCode}</Button>
        </div>
      </Overlay>
    );
  }

  switch (game.phase) {
    case 'SETUP':
      return (
        <SetupScreen
          joinCode={joinCode}
          onStart={(...args) => {
            setJoinCode(null);
            actions.startGame(...args);
          }}
        />
      );
    case 'PLAYING':
      return <TeamScreen game={game} actions={actions} />;
    case 'GAME_OVER':
      return <GameOverScreen game={game} onResume={actions.resumeGame} onNewGame={actions.newGame} />;
  }
}
