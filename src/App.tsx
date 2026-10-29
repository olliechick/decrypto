import { EncryptScreen } from './components/EncryptScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { GuessScreen } from './components/GuessScreen';
import { KeywordsScreen } from './components/KeywordsScreen';
import { RevealScreen } from './components/RevealScreen';
import { SetupScreen } from './components/SetupScreen';
import { useGame } from './hooks/useGame';

// One screen per phase of the game (see src/game/state.ts)
export default function App() {
  const { game, actions } = useGame();

  switch (game.phase) {
    case 'SETUP':
      return <SetupScreen onStart={actions.startGame} />;
    case 'KEYWORDS':
      return <KeywordsScreen game={game} onDone={actions.doneKeywords} />;
    case 'ENCRYPT':
      return <EncryptScreen key={`${game.round}-${game.activeTeam}`} game={game} onSubmit={actions.submitClues} />;
    case 'INTERCEPT':
    case 'DECODE':
      return (
        <GuessScreen
          game={game}
          onIntercept={actions.submitIntercept}
          onDecode={actions.submitDecode}
          onBackToIntercept={actions.backToIntercept}
        />
      );
    case 'REVEAL':
      return <RevealScreen game={game} onNext={actions.next} />;
    case 'GAME_OVER':
      return <GameOverScreen game={game} onNewGame={actions.newGame} />;
  }
}
