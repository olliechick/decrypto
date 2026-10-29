import { getCode, getEncryptor, type GameState } from '../game/state';
import { Button } from './Button';
import { CodeDisplay } from './CodeDisplay';
import { GameMenu } from './GameMenu';
import { Gate } from './Gate';
import { KeywordsCard } from './KeywordsCard';
import { Screen } from './Screen';

interface EncryptScreenProps {
  game: GameState;
  onDone: () => void;
  onEndGame: () => void;
}

// The encryptor privately sees the code, writes their clues on the notepad and reads them out
export function EncryptScreen({ game, onDone, onEndGame }: EncryptScreenProps) {
  const team = game.activeTeam;
  const { name, keywords } = game.teams[team];
  const encryptor = getEncryptor(game, team);
  const code = getCode(game)!;

  return (
    <Screen>
      <GameMenu game={game} onEndGame={onEndGame} />
      <Gate
        key={`${game.round}-${team}`}
        team={team}
        title={encryptor ? `Pass the phone to ${encryptor}` : `Pass the phone to team ${name}'s encryptor`}
        hint={`Round ${game.round}: ${encryptor ? `${encryptor} is` : 'pick who is'} the encryptor for team ${name}. Only the encryptor should look.`}
      >
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black">Your code</h1>
            <CodeDisplay code={code} />
          </div>
          <KeywordsCard team={team} keywords={keywords} highlight={code} />
          <p className="text-white/60 text-center">
            Write a clue for each keyword in the code, in order, on your sheet. Then hide the code and read your clues
            out loud.
          </p>
          <Button className="w-full" onClick={onDone}>
            Done, hide the code
          </Button>
        </div>
      </Gate>
    </Screen>
  );
}
