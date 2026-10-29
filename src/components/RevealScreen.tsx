import { getCode, isLastTurn, otherTeam, type GameState } from '../game/state';
import { Button } from './Button';
import { CodeDisplay } from './CodeDisplay';
import { GameMenu } from './GameMenu';
import { Screen } from './Screen';

// The code, for everyone to check their guesses against and hand out tokens on the notepad
export function RevealScreen({ game, onNext, onEndGame }: { game: GameState; onNext: () => void; onEndGame: () => void }) {
  const team = game.activeTeam;
  const name = game.teams[team].name;
  const otherName = game.teams[otherTeam(team)].name;

  return (
    <Screen>
      <GameMenu game={game} onEndGame={onEndGame} />
      <div className="text-center space-y-3 pt-4">
        <div className="text-sm font-bold text-white/50">Round {game.round}</div>
        <h1 className="text-2xl font-bold">Team {name}'s code was</h1>
        <CodeDisplay code={getCode(game)!} />
      </div>
      <ul className="space-y-2 text-white/70">
        {game.round > 1 && (
          <li>
            Team {otherName} intercepted it? They get an <b className="text-emerald-400">interception</b> token.
          </li>
        )}
        <li>
          Team {name} got it wrong? They get a <b className="text-red-400">miscommunication</b> token.
        </li>
        <li>Write the clues in the right columns on your sheets.</li>
      </ul>
      <p className="text-white/50 text-sm">
        At the end of a round, 2 interceptions wins and 2 miscommunications loses. If someone has won, end the game from
        the menu.
      </p>
      <Button className="w-full" onClick={onNext}>
        {isLastTurn(game) ? 'End of the last round' : team === 0 ? `Next: team ${otherName}'s turn` : `On to round ${game.round + 1}`}
      </Button>
    </Screen>
  );
}
