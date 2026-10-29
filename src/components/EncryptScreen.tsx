import { useState, type FormEvent } from 'react';
import { getCode, getEncryptor, type GameState } from '../game/state';
import { Button } from './Button';
import { CodeDisplay } from './CodeDisplay';
import { GameMenu } from './GameMenu';
import { Gate } from './Gate';
import { KeywordsCard } from './KeywordsCard';
import { Screen } from './Screen';

// The encryptor privately sees the code and types a clue for each digit
interface EncryptScreenProps {
  game: GameState;
  onSubmit: (clues: string[]) => void;
  onNewGame: () => void;
}

export function EncryptScreen({ game, onSubmit, onNewGame }: EncryptScreenProps) {
  const team = game.activeTeam;
  const { name, keywords } = game.teams[team];
  const encryptor = getEncryptor(game, team);
  const code = getCode(game)!;
  const [clues, setClues] = useState(['', '', '']);
  const complete = clues.every((c) => c.trim());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (complete) onSubmit(clues);
  };

  return (
    <Screen>
      <GameMenu game={game} onNewGame={onNewGame} />
      <Gate
        key={`${game.round}-${team}`}
        team={team}
        title={encryptor ? `Pass the phone to ${encryptor}` : `Pass the phone to team ${name}'s encryptor`}
        hint={`Round ${game.round}: ${encryptor ? `${encryptor} is` : 'pick who is'} the encryptor for team ${name}. Only the encryptor should look.`}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black">Your code</h1>
            <CodeDisplay code={code} />
          </div>
          <KeywordsCard team={team} keywords={keywords} highlight={code} />
          <p className="text-white/60 text-center">
            Give a clue for each keyword in the code, in order. Your team must work out the code, but the other team
            mustn't.
          </p>
          {code.map((digit, i) => (
            <label key={i} className="block space-y-1">
              <span className="text-sm font-bold text-white/60">
                Clue {i + 1}: for {digit} ({keywords[digit - 1]})
              </span>
              <input
                value={clues[i]}
                onChange={(e) => setClues(clues.map((c, j) => (j === i ? e.target.value : c)))}
                maxLength={40}
                autoComplete="off"
                autoCapitalize="none"
                className="w-full rounded-lg bg-white/10 px-3 py-3 text-xl"
              />
            </label>
          ))}
          <Button type="submit" className="w-full" disabled={!complete}>
            Done, hide the code
          </Button>
        </form>
      </Gate>
    </Screen>
  );
}
