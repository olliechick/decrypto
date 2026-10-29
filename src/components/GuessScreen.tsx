import { getEncryptor, otherTeam, type Code, type GameState } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';
import { CluesList } from './CluesList';
import { CodePicker } from './CodePicker';
import { GameMenu } from './GameMenu';
import { Screen } from './Screen';
import { TokenBar } from './TokenBar';

interface GuessScreenProps {
  game: GameState;
  onIntercept: (guess: Code) => void;
  onDecode: (guess: Code) => void;
  onBackToIntercept: () => void;
  onNewGame: () => void;
}

// The clues are public now. INTERCEPT: the other team guesses the code. DECODE: the encrypting team does.
export function GuessScreen({ game, onIntercept, onDecode, onBackToIntercept, onNewGame }: GuessScreenProps) {
  const team = game.activeTeam;
  const intercepting = game.phase === 'INTERCEPT';
  const guessing = intercepting ? otherTeam(team) : team;
  const encryptor = getEncryptor(game, team);
  const { name } = game.teams[team];

  return (
    <Screen>
      <GameMenu game={game} onNewGame={onNewGame} />
      <TokenBar game={game} />
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-center">
          {encryptor ? `${encryptor}'s` : `Team ${name}'s`} clues
          {encryptor && <span className="text-white/50"> (team {name})</span>}
        </h1>
        <CluesList clues={game.clues ?? []} />
        <p className="text-center text-white/60">Read them out loud. Earlier clues are on the clue sheets.</p>
      </div>
      <div className={`rounded-2xl p-4 space-y-3 ${TEAM_STYLES[guessing].card}`}>
        <h2 className="text-2xl font-black">
          {intercepting ? `Team ${game.teams[guessing].name}: intercept!` : `Team ${name}: what's the code?`}
        </h2>
        <p className={TEAM_STYLES[guessing].muted}>
          {intercepting
            ? `Talk it over quietly, then enter your guess at team ${name}'s code. It stays hidden until the reveal.`
            : game.round === 1
              ? `There's no interception in round 1. Talk it over, then enter your guess.${encryptor ? ` ${encryptor} stays quiet!` : ''}`
              : `Talk it over, then enter your guess.${encryptor ? ` ${encryptor} stays quiet!` : ''}`}
        </p>
      </div>
      <CodePicker
        key={`${game.round}-${team}-${game.phase}`}
        submitLabel={intercepting ? 'Lock in our intercept' : 'Lock in and reveal'}
        onSubmit={intercepting ? onIntercept : onDecode}
      />
      {!intercepting && game.round > 1 && (
        <div className="text-center">
          <button type="button" onClick={onBackToIntercept} className="text-sm text-white/50 underline">
            Team {game.teams[otherTeam(team)].name}'s intercept is locked in. Change it?
          </button>
        </div>
      )}
    </Screen>
  );
}
