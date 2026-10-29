import { useState } from 'react';
import { getClueSheet, otherTeam, type GameState, type TeamIndex } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';

// Every clue each team has given, under the keyword number it pointed to. Public: it's what interceptions go on.
export function ClueSheet({ game, initialTeam }: { game: GameState; initialTeam: TeamIndex }) {
  const [team, setTeam] = useState(initialTeam);
  const columns = getClueSheet(game, team);
  const styles = TEAM_STYLES[team];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2" role="tablist">
        {([0, 1] as TeamIndex[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={team === t}
            onClick={() => setTeam(t)}
            className={`rounded-xl px-3 py-2 font-bold truncate transition ${
              team === t ? TEAM_STYLES[t].card : 'bg-white/5 text-white/50'
            }`}
          >
            Team {game.teams[t].name}
          </button>
        ))}
      </div>
      <p className="text-sm text-white/60">
        Team {game.teams[team].name}'s clues so far, under the number of the keyword each one was for. Team{' '}
        {game.teams[otherTeam(team)].name} can use these to intercept.
      </p>
      <div className="grid grid-cols-4 gap-2">
        {columns.map((clues, i) => (
          <div key={i} className={`rounded-xl p-2 min-h-32 ${styles.card}`}>
            <div className={`text-center font-black ${styles.muted}`}>{i + 1}</div>
            <ul className="mt-1 space-y-1">
              {clues.map(({ round, clue }, j) => (
                <li key={j} className="text-sm font-semibold break-words leading-tight">
                  {clue}
                  <span className={`ml-1 text-[10px] ${styles.muted}`}>R{round}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {columns.every((c) => c.length === 0) && <p className="text-center text-white/50">No clues yet.</p>}
    </div>
  );
}
