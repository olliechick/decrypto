import { useEffect, useState, type ReactNode } from 'react';
import type { TeamIndex } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';
import { Button } from './Button';

interface GateProps {
  team: TeamIndex;
  title: string; // who should look, e.g. "Only Ann should look"
  hint?: string;
  emoji?: string;
  buttonLabel?: string;
  onShow?: () => void; // called on the button, e.g. to reveal the code to everyone instead of showing children
  children?: ReactNode; // the secret, only shown after "Show me"
}

// Stands in front of anything secret, so the phone can be handed over without anyone else seeing it, or a step that
// can't be taken back, so it isn't taken by a stray tap.
// Give it a `key` that changes for each new secret, so it starts hidden again.
export function Gate({ team, title, hint, emoji = '🤫', buttonLabel = 'Show me', onShow, children }: GateProps) {
  const [shown, setShown] = useState(false);
  const styles = TEAM_STYLES[team];

  // Hide the secret if the phone is locked or put down on another app, in case it's then picked up by someone else
  useEffect(() => {
    const hide = () => document.visibilityState === 'hidden' && setShown(false);
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, []);

  if (shown) return <>{children}</>;
  return (
    <div className={`rounded-3xl p-8 text-center space-y-6 landscape:p-5 landscape:space-y-3 ${styles.card}`}>
      <div className="text-5xl" aria-hidden>
        {emoji}
      </div>
      <h1 className="text-3xl font-black">{title}</h1>
      {hint && <p className={styles.muted}>{hint}</p>}
      <Button
        variant="custom"
        className={`w-full ${styles.button}`}
        onClick={() => (onShow ? onShow() : setShown(true))}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
