import type { CSSProperties } from 'react';
import type { TeamIndex } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';

// As big as each word can be on one line: the space it has shared between its letters, which are about 0.78em wide in
// heavy capitals.
// - Upright, one word per row: the screen (up to max-w-md), less 7rem of padding and the number. Short words stop at
//   3.75rem.
// - On its side, the words side by side: a quarter of the screen (up to max-w-5xl), less the gaps and padding. Short
//   words stop at 4rem, or less on a short screen.
// The screen's width leaves out an iPhone's notch and home bar (the safe area).
const SCREEN = '(100vw - env(safe-area-inset-left) - env(safe-area-inset-right))';
function wordSizes(word: string): CSSProperties {
  const letters = (word.length * 0.78).toFixed(2);
  return {
    '--upright': `min(3.75rem, calc((min(${SCREEN}, 28rem) - 7rem) / ${letters}))`,
    '--sideways': `min(4rem, 14dvh, calc(((min(${SCREEN}, 64rem) - 3.5rem) / 4 - 1rem) / ${letters}))`,
  } as CSSProperties;
}

// A team's keywords, numbered 1-4, big enough to read on a phone propped up on the table: one per row upright, side by
// side on its side
export function KeywordsCard({ team, keywords }: { team: TeamIndex; keywords: string[] }) {
  const styles = TEAM_STYLES[team];
  return (
    <ol className="space-y-2 landscape:space-y-0 landscape:flex-1 landscape:grid landscape:grid-cols-4 landscape:gap-2">
      {keywords.map((word, i) => (
        <li
          key={i}
          className={`flex items-center gap-4 rounded-2xl px-5 py-4 min-h-24 landscape:flex-col landscape:justify-center landscape:gap-2 landscape:px-2 landscape:min-h-[38dvh] ${styles.card}`}
        >
          <span className={`text-2xl font-black ${styles.muted}`}>{i + 1}</span>
          <span
            className="font-black uppercase leading-tight break-words min-w-0 [font-size:var(--upright)] landscape:[font-size:var(--sideways)]"
            style={wordSizes(word)}
          >
            {word}
          </span>
        </li>
      ))}
    </ol>
  );
}
