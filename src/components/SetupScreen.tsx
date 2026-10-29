import { useState, type FormEvent } from 'react';
import type { TeamSetup } from '../game/state';
import { DEFAULT_TEAM_NAMES, TEAM_STYLES } from '../utils/teamStyles';
import { Button } from './Button';
import { Screen } from './Screen';

const splitPlayers = (text: string) =>
  text
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

// Team names and (optionally) players. With players, the app says whose turn it is to be the encryptor.
export function SetupScreen({ onStart }: { onStart: (teams: TeamSetup[]) => void }) {
  const [names, setNames] = useState(DEFAULT_TEAM_NAMES);
  const [players, setPlayers] = useState(['', '']);

  const trimmed = names.map((n) => n.trim());
  const error = trimmed.some((n) => !n)
    ? 'Each team needs a name.'
    : trimmed[0].toLowerCase() === trimmed[1].toLowerCase()
      ? 'The teams need different names.'
      : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (error) return;
    onStart(trimmed.map((name, i) => ({ name, players: splitPlayers(players[i]) })));
  };

  const update = (list: string[], i: number, value: string) => list.map((v, j) => (j === i ? value : v));

  return (
    <Screen>
      <div className="text-center space-y-1 pt-4">
        <h1 className="text-5xl font-black tracking-tight">Decrypto</h1>
        <p className="text-white/60">Two teams, one phone. Pass it round when it tells you to.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {[0, 1].map((i) => {
          const styles = TEAM_STYLES[i as 0 | 1];
          return (
            <fieldset key={i} className={`rounded-2xl p-4 space-y-3 ${styles.card}`}>
              <label className="block space-y-1">
                <span className={`text-sm font-bold ${styles.muted}`}>Team name</span>
                <input
                  value={names[i]}
                  onChange={(e) => setNames(update(names, i, e.target.value))}
                  maxLength={20}
                  className="w-full rounded-lg bg-transparent ring-1 ring-current/30 px-3 py-2 text-xl font-bold"
                />
              </label>
              <label className="block space-y-1">
                <span className={`text-sm font-bold ${styles.muted}`}>Players (optional, separated by commas)</span>
                <input
                  value={players[i]}
                  onChange={(e) => setPlayers(update(players, i, e.target.value))}
                  placeholder="e.g. Sam, Alex, Jo"
                  className="w-full rounded-lg bg-transparent ring-1 ring-current/30 px-3 py-2"
                />
              </label>
            </fieldset>
          );
        })}
        {error && <p className="text-center text-red-300">{error}</p>}
        <Button type="submit" className="w-full" disabled={Boolean(error)}>
          Start game
        </Button>
      </form>
    </Screen>
  );
}
