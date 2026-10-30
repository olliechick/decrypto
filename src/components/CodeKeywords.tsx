import type { Code, TeamIndex } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';

// The code for the encryptor: each digit next to its keyword, in the code's order, one clue to write for each. On its
// side, the three are side by side.
export function CodeKeywords({ team, code, words }: { team: TeamIndex; code: Code; words: string[] }) {
  const styles = TEAM_STYLES[team];
  return (
    <ol className="space-y-2 landscape:space-y-0 landscape:grid landscape:grid-cols-3 landscape:gap-2" aria-label={`Code ${code.join(' ')}`}>
      {code.map((d, i) => (
        <li key={i} className={`flex items-center gap-4 rounded-2xl p-2 pr-4 landscape:flex-col landscape:gap-2 landscape:p-3 ${styles.card}`}>
          <span className="w-14 h-14 shrink-0 rounded-xl bg-emerald-400 text-black text-4xl font-mono font-black flex items-center justify-center">
            {d}
          </span>
          <span className="text-2xl font-black uppercase break-words min-w-0">{words[i]}</span>
        </li>
      ))}
    </ol>
  );
}
