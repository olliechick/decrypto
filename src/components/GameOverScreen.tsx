import { useState } from 'react';
import { MAX_ROUNDS, type GameState, type TeamIndex } from '../game/state';
import { Button } from './Button';
import { KeywordsCard } from './KeywordsCard';
import { Screen } from './Screen';

// The notepad says who won. Everyone's keywords are shown on request, after any tiebreak guesses.
export function GameOverScreen({ game, onNewGame }: { game: GameState; onNewGame: () => void }) {
  const [showKeywords, setShowKeywords] = useState(false);
  const lastRoundPlayed = game.round === MAX_ROUNDS;
  return (
    <Screen>
      <div className="text-center space-y-2 pt-4">
        <div className="text-6xl" aria-hidden>
          🏁
        </div>
        <h1 className="text-4xl font-black">Game over</h1>
        <p className="text-white/60">
          {lastRoundPlayed
            ? `That was the last round. If nobody won outright, the higher score wins: interceptions minus miscommunications. Still level? Each team guesses the other team's keywords before you show them, and the most right wins.`
            : 'Check the tokens on your sheets to see who won.'}
        </p>
      </div>
      {showKeywords ? (
        ([0, 1] as TeamIndex[]).map((team) => (
          <div key={team} className="space-y-2">
            <h2 className="font-bold">Team {game.teams[team].name}'s keywords</h2>
            <KeywordsCard team={team} keywords={game.teams[team].keywords} />
          </div>
        ))
      ) : (
        <Button variant="secondary" className="w-full" onClick={() => setShowKeywords(true)}>
          Show everyone's keywords
        </Button>
      )}
      <Button className="w-full" onClick={onNewGame}>
        New game
      </Button>
    </Screen>
  );
}
