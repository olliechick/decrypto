import { useEffect, useState } from 'react';

const SECONDS = 30;

// The game's sand timer: once one encryptor has written their clues, the other has 30 seconds to finish. Tap to start,
// tap again to stop. It buzzes (where the phone can) when time's up.
export function Timer({ className = '' }: { className?: string }) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endsAt]);

  const left = endsAt === null ? null : Math.max(0, Math.ceil((endsAt - now) / 1000));
  const timeUp = left === 0;

  // Buzz, then show "Time's up" for a few seconds before going back to the start
  useEffect(() => {
    if (!timeUp) return;
    navigator.vibrate?.([300, 100, 300]);
    const id = setTimeout(() => setEndsAt(null), 3000);
    return () => clearTimeout(id);
  }, [timeUp]);

  const toggle = () => {
    setNow(Date.now());
    setEndsAt(endsAt === null ? Date.now() + SECONDS * 1000 : null);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={left === null ? `Start the ${SECONDS}-second timer` : timeUp ? "Time's up" : `${left} seconds left, tap to stop`}
      className={`rounded-xl px-3 py-3 text-lg font-bold tabular-nums whitespace-nowrap ${timeUp ? 'bg-red-500 text-white' : left !== null ? 'bg-amber-400 text-black' : 'bg-white/10'} ${className}`}
    >
      {left === null ? `⏳ ${SECONDS}-second timer` : timeUp ? "⏳ Time's up" : `⏳ ${left}`}
    </button>
  );
}
