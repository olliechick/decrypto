import { useState } from 'react';
import { getCode, getEncryptor, otherTeam, type GameState } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';
import { Button } from './Button';
import { CodeDisplay } from './CodeDisplay';
import { GameMenu } from './GameMenu';
import { Gate } from './Gate';
import { Overlay } from './Overlay';
import { Screen } from './Screen';

interface GuessScreenProps {
  game: GameState;
  onReveal: () => void;
  onEndGame: () => void;
}

// The clues have been read out; both teams write their guesses on the notepad, then the code is revealed
export function GuessScreen({ game, onReveal, onEndGame }: GuessScreenProps) {
  const [peeking, setPeeking] = useState(false);
  const team = game.activeTeam;
  const { name } = game.teams[team];
  const otherName = game.teams[otherTeam(team)].name;
  const encryptor = getEncryptor(game, team);
  const styles = TEAM_STYLES[team];

  return (
    <Screen>
      <GameMenu game={game} onEndGame={onEndGame} />
      <div className={`rounded-3xl p-6 space-y-4 ${styles.card}`}>
        <div className={`text-sm font-bold ${styles.muted}`}>Round {game.round}</div>
        <h1 className="text-3xl font-black">Time to guess team {name}'s code</h1>
        <ol className={`list-decimal pl-5 space-y-2 ${styles.muted}`}>
          {game.round === 1 ? (
            <li>There's no interception in round 1.</li>
          ) : (
            <li>Team {otherName} writes down their intercept.</li>
          )}
          <li>Team {name} writes down their guess{encryptor ? ` (${encryptor} stays quiet)` : ''}.</li>
          <li>Then reveal the code.</li>
        </ol>
      </div>
      <Button className="w-full" onClick={onReveal}>
        Reveal the code
      </Button>
      <div className="text-center">
        <button type="button" onClick={() => setPeeking(true)} className="text-sm text-white/50 underline">
          {encryptor ?? 'Encryptor'}: see the code again
        </button>
      </div>

      {peeking && (
        <Overlay title="See the code again" onClose={() => setPeeking(false)}>
          <Gate team={team} title={`Only ${encryptor ?? `team ${name}'s encryptor`} should look`}>
            <div className="space-y-5">
              <CodeDisplay code={getCode(game)!} />
              <Button className="w-full" onClick={() => setPeeking(false)}>
                Done, hide it
              </Button>
            </div>
          </Gate>
        </Overlay>
      )}
    </Screen>
  );
}
