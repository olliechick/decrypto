import { getResult, getScore, type GameState, type TeamIndex } from '../game/state';
import { Button } from './Button';
import { KeywordsCard } from './KeywordsCard';
import { Screen } from './Screen';
import { TokenBar } from './TokenBar';

const REASONS = {
  interceptions: 'They intercepted 2 codes.',
  miscommunications: 'The other team got their own code wrong twice.',
  score: 'They won on score (interceptions minus miscommunications):',
};

// Who won and why, and everyone's keywords at last
export function GameOverScreen({ game, onNewGame }: { game: GameState; onNewGame: () => void }) {
  const result = getResult(game);
  const scores = `${game.teams[0].name} ${getScore(game, 0)}, ${game.teams[1].name} ${getScore(game, 1)}`;
  return (
    <Screen>
      <div className="text-center space-y-2 pt-4">
        <div className="text-6xl" aria-hidden>
          {result?.winner === null ? '🤝' : '🏆'}
        </div>
        <h1 className="text-4xl font-black">
          {!result || result.winner === null ? "It's a draw" : `Team ${game.teams[result.winner].name} wins!`}
        </h1>
        <p className="text-white/60">
          {result?.winner === null || !result ? `Level on score: ${scores}.` : REASONS[result.reason]}
          {result?.reason === 'score' && <> ({scores})</>}
        </p>
      </div>
      <TokenBar game={game} />
      {([0, 1] as TeamIndex[]).map((team) => (
        <div key={team} className="space-y-2">
          <h2 className="font-bold">Team {game.teams[team].name}'s keywords</h2>
          <KeywordsCard team={team} keywords={game.teams[team].keywords} />
        </div>
      ))}
      <Button className="w-full" onClick={onNewGame}>
        New game
      </Button>
    </Screen>
  );
}
