import { codesEqual, getRoundEndResult, otherTeam, wasIntercepted, wasMiscommunicated, type Code, type GameState } from '../game/state';
import { Button } from './Button';
import { CodeDisplay } from './CodeDisplay';
import { GameMenu } from './GameMenu';
import { Screen } from './Screen';
import { TokenBar } from './TokenBar';

function GuessRow({ label, guess, code, token }: { label: string; guess: Code; code: Code; token: string | null }) {
  const right = codesEqual(guess, code);
  return (
    <div className={`rounded-xl px-4 py-3 ${right ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold">{label}</span>
        <span className="font-mono text-2xl font-black">
          {guess.join(' ')} {right ? '✓' : '✗'}
        </span>
      </div>
      {token && <div className="text-sm font-bold mt-1">{token}</div>}
    </div>
  );
}

// The code and both guesses, and any tokens they earned
export function RevealScreen({ game, onNext, onNewGame }: { game: GameState; onNext: () => void; onNewGame: () => void }) {
  const t = game.transmissions.at(-1)!;
  const name = game.teams[t.team].name;
  const otherName = game.teams[otherTeam(t.team)].name;
  const endOfRound = t.team === 1;
  const gameEnds = endOfRound && getRoundEndResult(game) !== null;

  return (
    <Screen>
      <GameMenu game={game} onNewGame={onNewGame} />
      <TokenBar game={game} />
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold">Team {name}'s code was</h1>
        <CodeDisplay code={t.code} />
      </div>
      <ol className="space-y-1">
        {t.clues.map((clue, i) => (
          <li key={i} className="flex gap-3 items-baseline rounded-lg bg-white/5 px-3 py-2">
            <span className="font-mono font-black text-emerald-400">{t.code[i]}</span>
            <span className="font-bold break-words min-w-0">{clue}</span>
          </li>
        ))}
      </ol>
      <div className="space-y-2">
        {t.interceptGuess && (
          <GuessRow
            label={`Team ${otherName}'s intercept`}
            guess={t.interceptGuess}
            code={t.code}
            token={wasIntercepted(t) ? `Intercepted! Team ${otherName} gets an interception token.` : null}
          />
        )}
        <GuessRow
          label={`Team ${name}'s guess`}
          guess={t.decodeGuess}
          code={t.code}
          token={wasMiscommunicated(t) ? `Miscommunication! Team ${name} gets a miscommunication token.` : null}
        />
      </div>
      <Button className="w-full" onClick={onNext}>
        {gameEnds ? 'See who won' : endOfRound ? `On to round ${game.round + 1}` : `Next: team ${otherName}'s turn`}
      </Button>
    </Screen>
  );
}
