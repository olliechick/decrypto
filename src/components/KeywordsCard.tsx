import type { TeamIndex } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';

// A team's secret keywords, numbered 1-4. `highlight` picks out the ones in the encryptor's code.
export function KeywordsCard({ team, keywords, highlight = [] }: { team: TeamIndex; keywords: string[]; highlight?: number[] }) {
  const styles = TEAM_STYLES[team];
  return (
    <ol className="grid grid-cols-2 gap-3">
      {keywords.map((word, i) => (
        <li
          key={i}
          className={`rounded-2xl p-4 text-center ${styles.card} ${
            highlight.length && !highlight.includes(i + 1) ? 'opacity-40' : ''
          }`}
        >
          <div className={`text-sm font-bold ${styles.muted}`}>{i + 1}</div>
          <div className="text-2xl font-black uppercase break-words">{word}</div>
        </li>
      ))}
    </ol>
  );
}
