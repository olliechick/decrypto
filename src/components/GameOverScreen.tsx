import { MAX_ROUNDS, type GameState } from '../game/state';
import { TEAM_NAMES } from '../utils/teamStyles';
import { Button } from './Button';
import { KeywordsCard } from './KeywordsCard';
import { Screen } from './Screen';

interface GameOverScreenProps {
  game: GameState;
  onResume: () => void; // back to the game, if it was ended by mistake
  onNewGame: () => void;
}

// The notepad says who won. The keywords stay on show for the tiebreaker and for the other team to see.
export function GameOverScreen({ game, onResume, onNewGame }: GameOverScreenProps) {
  return (
    <Screen wide>
      <div className="text-center space-y-2 pt-4 landscape:pt-0 landscape:space-y-1">
        <div className="text-6xl landscape:hidden" aria-hidden>
          🏁
        </div>
        <h1 className="text-4xl font-black landscape:text-2xl">
          <span className="hidden landscape:inline" aria-hidden>
            🏁{' '}
          </span>
          Game over
        </h1>
        <p className="text-white/60 landscape:text-sm">
          {game.round === MAX_ROUNDS
            ? "That was the last round. If nobody won outright, the higher score wins: interceptions minus miscommunications. Still level? Each team guesses the other team's keywords, and the most right wins."
            : 'Check the tokens on your sheets to see who won.'}
        </p>
      </div>
      <h2 className="font-bold">
        Team {TEAM_NAMES[game.team]}'s keywords{' '}
        <span className="font-normal text-white/60">
          · game <span className="font-mono tracking-widest">{game.gameCode}</span>
        </span>
      </h2>
      <KeywordsCard team={game.team} keywords={game.keywords} />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onResume}>
          Back to the game
        </Button>
        <Button onClick={onNewGame}>New game</Button>
      </div>
    </Screen>
  );
}
