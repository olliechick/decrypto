import { useState, type FormEvent } from 'react';
import { cleanGameCode, GAME_CODE_LENGTH, isValidGameCode, isWellFormedGameCode, makeGameCode } from '../game/random';
import { MAX_ROUNDS, type TeamIndex } from '../game/state';
import { useNewerVersion } from '../hooks/useNewerVersion';
import { TEAM_NAMES, TEAM_STYLES } from '../utils/teamStyles';
import { AppVersion } from './AppVersion';
import { Button } from './Button';
import { Overlay } from './Overlay';
import { Rules } from './Rules';
import { Screen } from './Screen';

const splitPlayers = (text: string) =>
  text
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

// One phone starts a game and gets a game code; the other team's phone joins with that code. Both then deal the same
// keywords from it, so the phones never need to talk to each other.
interface SetupScreenProps {
  joinCode: string | null; // from a scanned QR code's link, which goes straight to joining
  onStart: (gameCode: string, team: TeamIndex, players: string[], round: number) => void;
}

export function SetupScreen({ joinCode, onStart }: SetupScreenProps) {
  const [mode, setMode] = useState<'start' | 'join' | null>(joinCode ? 'join' : null);
  const [code, setCode] = useState(joinCode ?? '');
  const [players, setPlayers] = useState('');
  const [showRules, setShowRules] = useState(false);
  const newerVersion = useNewerVersion();
  // Rejoining a game this phone lost: as either team, at the round the game is up to
  const [rejoin, setRejoin] = useState(false);
  const [rejoinTeam, setRejoinTeam] = useState<TeamIndex>(1);
  const [rejoinRound, setRejoinRound] = useState(1);

  const team: TeamIndex = mode === 'join' ? (rejoin ? rejoinTeam : 1) : 0;
  const styles = TEAM_STYLES[team];
  const cleanCode = cleanGameCode(code);
  const codeError = mode === 'join' && !isValidGameCode(cleanCode);
  // A whole code that doesn't check out was mistyped, or made by a different version of the app (so it would deal
  // different keywords). From a QR code it can't be a typo.
  const codeMismatch = codeError && isWellFormedGameCode(cleanCode);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'start') onStart(makeGameCode(), 0, splitPlayers(players), 1);
    else if (!codeError) onStart(cleanCode, team, splitPlayers(players), rejoin ? rejoinRound : 1);
  };

  return (
    <Screen>
      <div className="text-center space-y-1 pt-4">
        <h1 className="text-5xl font-black tracking-tight">Decrypto</h1>
        <p className="text-white/60">
          Each team props up a phone showing its keywords, and keeps notes on a printed notepad sheet.
        </p>
      </div>

      {newerVersion && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl bg-amber-400/15 px-4 py-3">
          <span className="text-sm">A newer version of the app is out. Both phones need to be on the same one.</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="shrink-0 rounded-lg bg-amber-400 px-3 py-2 font-bold text-black"
          >
            Reload
          </button>
        </div>
      )}

      {mode === null ? (
        <div className="space-y-3">
          <Button className="w-full" onClick={() => setMode('start')}>
            Start a new game
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => setMode('join')}>
            Join the other team's game
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className={`rounded-2xl p-4 space-y-4 ${styles.card}`}>
          <h2 className="text-2xl font-black">
            You're team {TEAM_NAMES[team]}
          </h2>
          <p className={styles.muted}>
            {mode === 'start'
              ? "You'll get a game code for the other team's phone to join with."
              : joinCode
                ? 'The game code from the QR code is filled in.'
                : "Type the game code shown on the other team's phone, or scan its QR code with your camera."}
          </p>
          {mode === 'join' && (
            <label className="block space-y-1">
              <span className={`text-sm font-bold ${styles.muted}`}>Game code</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={GAME_CODE_LENGTH + 2}
                autoComplete="off"
                autoCapitalize="characters"
                autoFocus={!joinCode}
                placeholder="e.g. K7Q2"
                className="w-full rounded-lg bg-transparent ring-1 ring-current/30 px-3 py-2 text-3xl font-mono font-black uppercase tracking-widest"
              />
              {codeMismatch && (
                <span role="alert" className="block text-sm font-bold text-red-600">
                  {cleanCode === joinCode
                    ? "This QR code is from a different version of the app. Reload the app on both phones, then start a new game."
                    : "That code doesn't work. Check it, and if it's right, reload the app on both phones so they're on the same version."}
                </span>
              )}
            </label>
          )}
          {mode === 'join' &&
            (rejoin ? (
              <fieldset className="space-y-2">
                <legend className={`text-sm font-bold ${styles.muted}`}>Rejoining a game: this phone's team and round</legend>
                <div className="grid grid-cols-3 gap-2">
                  {([0, 1] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={rejoinTeam === t}
                      onClick={() => setRejoinTeam(t)}
                      className={`rounded-lg px-3 py-2 font-bold ${rejoinTeam === t ? 'ring-2 ring-current' : `ring-1 ring-current/30 ${styles.muted}`}`}
                    >
                      {TEAM_NAMES[t]}
                    </button>
                  ))}
                  <select
                    value={rejoinRound}
                    onChange={(e) => setRejoinRound(Number(e.target.value))}
                    aria-label="Round"
                    className="rounded-lg bg-transparent px-2 py-2 font-bold ring-1 ring-current/30"
                  >
                    {Array.from({ length: MAX_ROUNDS }, (_, i) => (
                      <option key={i} value={i + 1}>
                        Round {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <span className={`block text-sm ${styles.muted}`}>
                  Enter the players in the same order as before, so the encryptor comes round right.
                </span>
              </fieldset>
            ) : (
              <button type="button" onClick={() => setRejoin(true)} className={`text-sm underline ${styles.muted}`}>
                Rejoining a game?
              </button>
            ))}
          <label className="block space-y-1">
            <span className={`text-sm font-bold ${styles.muted}`}>Your team's players (optional, separated by commas)</span>
            <input
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              placeholder="e.g. Sam, Alex, Jo"
              className="w-full rounded-lg bg-transparent ring-1 ring-current/30 px-3 py-2"
            />
            <span className={`block text-sm ${styles.muted}`}>With names, the app says who's the encryptor each round.</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="custom" className="bg-gray-500/20" onClick={() => setMode(null)}>
              Back
            </Button>
            <Button type="submit" disabled={codeError}>
              {mode === 'start' ? 'Start' : 'Join'}
            </Button>
          </div>
        </form>
      )}

      <div className="text-center space-y-2">
        <button type="button" onClick={() => setShowRules(true)} className="text-white/60 underline">
          How to play
        </button>
        <AppVersion />
      </div>
      {showRules && (
        <Overlay title="How to play" onClose={() => setShowRules(false)}>
          <Rules />
        </Overlay>
      )}
    </Screen>
  );
}
