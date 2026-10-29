import type { Code } from '../game/state';

// A code shown as three big digits, e.g. 3·1·4
export function CodeDisplay({ code, className = '' }: { code: Code; className?: string }) {
  return (
    <div className={`flex justify-center gap-3 font-mono font-black ${className}`} aria-label={`Code ${code.join(' ')}`}>
      {code.map((d, i) => (
        <span key={i} className="w-14 h-16 rounded-xl bg-emerald-400 text-black text-4xl flex items-center justify-center">
          {d}
        </span>
      ))}
    </div>
  );
}
