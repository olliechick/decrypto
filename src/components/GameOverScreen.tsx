import { MAX_ROUNDS, type GameState } from '../game/state';
import { TEAM_NAMES } from '../utils/teamStyles';
import { Button } from './Button';
import { KeywordsCard } from './KeywordsCard';
import { Screen } from './Screen';

// The notepad says who won. The keywords stay on show for the tiebreaker and for the other team to see.
export function GameOverScreen({ game, onNewGame }: { game: GameState; onNewGame: () => void }) {
  return (
    <Screen>
      <div className="text-center space-y-2 pt-4">
        <div className="text-6xl" aria-hidden>
          🏁
        </div>
        <h1 className="text-4xl font-black">Game over</h1>
        <p className="text-white/60">
          {game.round === MAX_ROUNDS
            ? "That was the last round. If nobody won outright, the higher score wins: interceptions minus miscommunications. Still level? Each team guesses the other team's keywords, and the most right wins."
            : 'Check the tokens on your sheets to see who won.'}
        </p>
      </div>
      <h2 className="font-bold">Team {TEAM_NAMES[game.team]}'s keywords</h2>
      <KeywordsCard team={game.team} keywords={game.keywords} />
      <Button className="w-full" onClick={onNewGame}>
        New game
      </Button>
    </Screen>
  );
}
