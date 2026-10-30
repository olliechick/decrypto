import { useState } from 'react';
import type { GameState } from '../game/state';
import { TEAM_NAMES, TEAM_STYLES } from '../utils/teamStyles';
import { Button } from './Button';
import { KeywordsCard } from './KeywordsCard';
import { Screen } from './Screen';

interface GameOverScreenProps {
  game: GameState;
  onResume: () => void; // back to the game, if it was ended by mistake
  onNewGame: () => void;
}

// The notepad says who won. The keywords are hidden until tapped, so they don't give the tiebreak away (each team
// guessing the other team's keywords); after that, the other team can see them.
export function GameOverScreen({ game, onResume, onNewGame }: GameOverScreenProps) {
  const [showKeywords, setShowKeywords] = useState(false);
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
          {!game.endedEarly
            ? "That was the last round. If nobody won outright, the higher score wins: interceptions minus miscommunications. Still level? Each team guesses the other team's keywords, and the most right wins. Still level after that? Both teams share the win."
            : 'Check the tokens on your sheets to see who won. Not clear cut? The higher score wins: interceptions minus miscommunications, then the tiebreak.'}
        </p>
      </div>
      <h2 className="font-bold">
        Team {TEAM_NAMES[game.team]}'s keywords{' '}
        <span className="font-normal text-white/60">
          · game <span className="font-mono tracking-widest">{game.gameCode}</span>
        </span>
      </h2>
      {showKeywords ? (
        <KeywordsCard team={game.team} keywords={game.keywords} />
      ) : (
        <div className={`rounded-2xl p-5 text-center space-y-3 landscape:flex-1 landscape:flex landscape:flex-col landscape:justify-center ${TEAM_STYLES[game.team].card}`}>
          <p className={TEAM_STYLES[game.team].muted}>Hidden, in case of a tiebreak: each team guesses the other team's keywords.</p>
          <Button variant="custom" className={`w-full ${TEAM_STYLES[game.team].button}`} onClick={() => setShowKeywords(true)}>
            Show our keywords
          </Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onResume}>
          Back to the game
        </Button>
        <Button onClick={onNewGame}>New game</Button>
      </div>
    </Screen>
  );
}
