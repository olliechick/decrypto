// The clues being guessed, numbered in order
export function CluesList({ clues }: { clues: string[] }) {
  return (
    <ol className="space-y-2">
      {clues.map((clue, i) => (
        <li key={i} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
          <span className="text-sm font-bold text-white/50">{i + 1}</span>
          <span className="text-2xl font-bold break-words min-w-0">{clue}</span>
        </li>
      ))}
    </ol>
  );
}
