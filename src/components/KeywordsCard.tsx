import type { TeamIndex } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';

// As big as each word can be on one line: the row's width (the screen, up to max-w-md, less 7rem of padding and the
// number) shared between its letters, which are about 0.78em wide in heavy capitals. Short words stop at 3.75rem.
const wordSize = (word: string) => `min(3.75rem, calc((min(100vw, 28rem) - 7rem) / ${(word.length * 0.78).toFixed(2)}))`;

// A team's keywords, numbered 1-4, one per row so they're big enough to read on a phone propped up on the table
export function KeywordsCard({ team, keywords }: { team: TeamIndex; keywords: string[] }) {
  const styles = TEAM_STYLES[team];
  return (
    <ol className="space-y-2">
      {keywords.map((word, i) => (
        <li key={i} className={`flex items-center gap-4 rounded-2xl px-5 py-4 min-h-24 ${styles.card}`}>
          <span className={`text-2xl font-black ${styles.muted}`}>{i + 1}</span>
          <span className="font-black uppercase leading-tight break-words min-w-0" style={{ fontSize: wordSize(word) }}>
            {word}
          </span>
        </li>
      ))}
    </ol>
  );
}
