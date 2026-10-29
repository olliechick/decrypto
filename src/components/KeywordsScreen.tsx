import type { GameState } from '../game/state';
import { Button } from './Button';
import { Gate } from './Gate';
import { KeywordsCard } from './KeywordsCard';
import { Screen } from './Screen';

// Each team privately looks at its keywords before the first round
export function KeywordsScreen({ game, onDone }: { game: GameState; onDone: () => void }) {
  const team = game.activeTeam;
  const { name, keywords } = game.teams[team];
  return (
    <Screen>
      <Gate
        key={team}
        team={team}
        title={`Pass the phone to team ${name}`}
        hint="Only your team should look. You'll see your 4 keywords."
      >
        <div className="space-y-5">
          <h1 className="text-2xl font-black text-center">Team {name}'s keywords</h1>
          <KeywordsCard team={team} keywords={keywords} />
          <p className="text-center text-white/60">Remember them, and their numbers. You can look again later.</p>
          <Button className="w-full" onClick={onDone}>
            Done, hide them
          </Button>
        </div>
      </Gate>
    </Screen>
  );
}
