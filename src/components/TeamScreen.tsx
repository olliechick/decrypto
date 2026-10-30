import { useState } from 'react';
import { joinUrl } from '../game/joinLink';
import { getCode, getCodeKeywords, getEncryptor, isLastRound, MAX_ROUNDS, type GameState } from '../game/state';
import type { GameActions } from '../hooks/useGame';
import { TEAM_NAMES, TEAM_STYLES } from '../utils/teamStyles';
import { Button } from './Button';
import { CodeDisplay } from './CodeDisplay';
import { CodeKeywords } from './CodeKeywords';
import { Gate } from './Gate';
import { KeywordsCard } from './KeywordsCard';
import { Overlay } from './Overlay';
import { QrCode } from './QrCode';
import { Rules } from './Rules';
import { Screen } from './Screen';

type Panel = 'code' | 'reveal' | 'qr' | 'rules' | 'endGame';

// The team's phone, propped up on the table: the keywords are always on show, the encryptor taps to see the code,
// and once both teams have written their guesses down the code is revealed to everyone
export function TeamScreen({ game, actions }: { game: GameState; actions: GameActions }) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const close = () => setPanel(null);
  const encryptor = getEncryptor(game);
  const code = getCode(game)!;
  const styles = TEAM_STYLES[game.team];
  const teamName = TEAM_NAMES[game.team];

  return (
    <Screen wide>
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="font-bold">
          Team {teamName} · Round {game.round} of {MAX_ROUNDS}
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setPanel('rules')} className="rounded-lg bg-white/10 px-3 py-1.5 font-bold">
            Rules
          </button>
          <button type="button" onClick={() => setPanel('endGame')} className="rounded-lg bg-white/10 px-3 py-1.5 font-bold">
            End
          </button>
        </div>
      </div>
      {game.team === 0 && game.round === 1 && !game.revealed && (
        <div className="rounded-xl bg-emerald-500/15 px-4 py-2 text-center">
          The other phone joins with game code{' '}
          <span className="font-mono text-2xl font-black tracking-widest text-emerald-300">{game.gameCode}</span>
          <button
            type="button"
            onClick={() => setPanel('qr')}
            className="block mx-auto text-sm text-emerald-300 underline landscape:inline landscape:ml-3"
          >
            or by scanning a QR code
          </button>
        </div>
      )}

      <KeywordsCard team={game.team} keywords={game.keywords} />

      {game.revealed ? (
        <div className="space-y-3 landscape:space-y-0 landscape:grid landscape:grid-cols-[auto_1fr_auto] landscape:items-center landscape:gap-4">
          <div className="text-center space-y-2 landscape:flex landscape:items-center landscape:gap-3 landscape:space-y-0">
            <div className="font-bold">Round {game.round} code</div>
            <CodeDisplay code={code} />
          </div>
          <Button className="w-full" onClick={actions.nextRound}>
            {isLastRound(game) ? 'Finish the game' : `On to round ${game.round + 1}`}
          </Button>
          <div className="text-center">
            <button type="button" onClick={actions.hideCode} className="text-sm text-white/50 underline">
              Revealed too soon? Hide it again
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="custom" className={styles.button} onClick={() => setPanel('code')}>
            {encryptor ? `${encryptor}: see code` : 'Encryptor: see code'}
          </Button>
          <Button variant="secondary" onClick={() => setPanel('reveal')}>
            Reveal to all
          </Button>
        </div>
      )}

      {panel === 'code' && (
        <Overlay title={`Round ${game.round} code`} onClose={close} wide>
          <Gate
            team={game.team}
            title={encryptor ? `Only ${encryptor} should look` : 'Only the encryptor should look'}
            hint="Pick up the phone so the rest of your team can't see."
          >
            <div className="space-y-5 landscape:space-y-3">
              <CodeKeywords team={game.team} code={code} words={getCodeKeywords(game)} />
              <p className="text-white/60 text-center landscape:text-sm">
                Write a clue on your sheet for each keyword in the code, in order. Read them out once both encryptors
                are ready.
              </p>
              <Button className="w-full" onClick={close}>
                Done, hide the code
              </Button>
            </div>
          </Gate>
        </Overlay>
      )}

      {panel === 'reveal' && (
        <Overlay title={`Round ${game.round} code`} onClose={close} wide>
          <Gate
            team={game.team}
            emoji="📣"
            title="Reveal the code to everyone?"
            hint="Only once both teams have written their guesses on their sheets."
            buttonLabel="Reveal to all"
            onShow={() => {
              close();
              actions.revealCode();
            }}
          />
        </Overlay>
      )}

      {panel === 'qr' && (
        <Overlay title="Join this game" onClose={close}>
          <p className="text-white/70">
            On the other team's phone, open the camera and point it at this code, then tap the link it shows.
          </p>
          <QrCode text={joinUrl(window.location.origin, game.gameCode)} label={`QR code to join game ${game.gameCode}`} />
          <p className="text-center text-white/70">
            Or type the game code{' '}
            <span className="font-mono text-2xl font-black tracking-widest text-emerald-300">{game.gameCode}</span>
          </p>
          <Button className="w-full" onClick={close}>
            Done
          </Button>
        </Overlay>
      )}

      {panel === 'rules' && (
        <Overlay title="How to play" onClose={close}>
          <Rules />
        </Overlay>
      )}

      {panel === 'endGame' && (
        <Overlay title="End game" onClose={close}>
          <p className="text-white/80">Has someone won? This ends the game on this phone.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={close}>
              Keep playing
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-400"
              variant="custom"
              onClick={() => {
                close();
                actions.endGame();
              }}
            >
              End game
            </Button>
          </div>
        </Overlay>
      )}
    </Screen>
  );
}
