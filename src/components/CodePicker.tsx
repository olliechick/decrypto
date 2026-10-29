import { useState } from 'react';
import { CODE_LENGTH, KEYWORD_COUNT, type Code } from '../game/state';
import { Button } from './Button';

const DIGITS = Array.from({ length: KEYWORD_COUNT }, (_, i) => i + 1);

// Three slots, each picked from 1-4. Picking a digit that's already in another slot moves it here.
export function CodePicker({ submitLabel, onSubmit }: { submitLabel: string; onSubmit: (code: Code) => void }) {
  const [slots, setSlots] = useState<(number | null)[]>(Array(CODE_LENGTH).fill(null));
  const complete = slots.every((d) => d !== null);

  const pick = (slot: number, digit: number) =>
    setSlots((prev) => prev.map((d, i) => (i === slot ? digit : d === digit ? null : d)));

  return (
    <div className="space-y-4">
      {slots.map((value, slot) => (
        <div key={slot} className="flex items-center gap-3">
          <span className="w-16 text-sm font-bold text-white/60">Clue {slot + 1}</span>
          <div className="grid grid-cols-4 gap-2 flex-1" role="radiogroup" aria-label={`Clue ${slot + 1}`}>
            {DIGITS.map((digit) => (
              <button
                key={digit}
                type="button"
                role="radio"
                aria-checked={value === digit}
                onClick={() => pick(slot, digit)}
                className={`h-12 rounded-xl text-xl font-black transition ${
                  value === digit ? 'bg-emerald-400 text-black' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {digit}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Button className="w-full" disabled={!complete} onClick={() => complete && onSubmit(slots as Code)}>
        {submitLabel}
      </Button>
    </div>
  );
}
