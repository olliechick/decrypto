import { getTokens, MAX_ROUNDS, TOKENS_TO_END, type GameState, type TeamIndex } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';

function Tokens({ count, filled, empty, label }: { count: number; filled: string; empty: string; label: string }) {
  return (
    <span className="flex gap-1" aria-label={`${count} ${label}`} title={label}>
      {Array.from({ length: TOKENS_TO_END }, (_, i) => (
        <span key={i} className={`w-4 h-4 rounded-full ${i < count ? filled : empty}`} />
      ))}
    </span>
  );
}

// Each team's interceptions (green, 2 wins) and miscommunications (red, 2 loses), and the round
export function TokenBar({ game }: { game: GameState }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {([0, 1] as TeamIndex[]).map((team) => {
          const { interceptions, miscommunications } = getTokens(game, team);
          return (
            <div key={team} className={`rounded-xl px-3 py-2 ${TEAM_STYLES[team].card}`}>
              <div className="font-bold truncate">{game.teams[team].name}</div>
              <div className="flex items-center gap-3 text-xs">
                <Tokens count={interceptions} filled="bg-emerald-400" empty="bg-emerald-400/20" label="interceptions" />
                <Tokens count={miscommunications} filled="bg-red-500" empty="bg-red-500/20" label="miscommunications" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center text-sm text-white/50">
        Round {game.round} of {MAX_ROUNDS} · <span className="text-emerald-400">●</span> interceptions{' '}
        <span className="text-red-400">●</span> miscommunications
      </div>
    </div>
  );
}
