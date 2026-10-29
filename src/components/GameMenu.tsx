import { useState } from 'react';
import type { GameState, TeamIndex } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';
import { Button } from './Button';
import { Gate } from './Gate';
import { KeywordsCard } from './KeywordsCard';
import { Overlay } from './Overlay';
import { Rules } from './Rules';

type Panel = 'words' | 'rules' | 'endGame';

interface GameMenuProps {
  game: GameState;
  onEndGame: () => void;
}

// The buttons along the top of the game: a team's own keywords (behind a gate), rules and end game
export function GameMenu({ game, onEndGame }: GameMenuProps) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [wordsTeam, setWordsTeam] = useState<TeamIndex | null>(null);
  const close = () => {
    setPanel(null);
    setWordsTeam(null);
  };

  const item = (p: Panel, label: string) => (
    <button
      type="button"
      onClick={() => setPanel(p)}
      className="rounded-lg bg-white/10 px-1 py-2 text-sm font-bold hover:bg-white/20"
    >
      {label}
    </button>
  );

  return (
    <>
      <nav className="grid grid-cols-3 gap-1.5">
        {item('words', 'Our words')}
        {item('rules', 'Rules')}
        {item('endGame', 'End game')}
      </nav>

      {panel === 'words' && (
        <Overlay title="Our words" onClose={close}>
          {wordsTeam === null ? (
            <div className="space-y-3">
              <p className="text-white/60">Which team are you on?</p>
              {([0, 1] as TeamIndex[]).map((t) => (
                <Button key={t} variant="custom" className={`w-full ${TEAM_STYLES[t].card}`} onClick={() => setWordsTeam(t)}>
                  Team {game.teams[t].name}
                </Button>
              ))}
            </div>
          ) : (
            <Gate
              team={wordsTeam}
              title={`Only team ${game.teams[wordsTeam].name} should look`}
              hint="Make sure the other team can't see the screen."
            >
              <div className="space-y-5">
                <KeywordsCard team={wordsTeam} keywords={game.teams[wordsTeam].keywords} />
                <Button className="w-full" onClick={close}>
                  Done, hide them
                </Button>
              </div>
            </Gate>
          )}
        </Overlay>
      )}

      {panel === 'rules' && (
        <Overlay title="How to play" onClose={close}>
          <Rules />
        </Overlay>
      )}

      {panel === 'endGame' && (
        <Overlay title="End game" onClose={close}>
          <p className="text-white/80">Has someone won? This ends the game, and then everyone's keywords can be shown.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={close}>
              Keep playing
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-400"
              variant="custom"
              onClick={() => {
                close();
                onEndGame();
              }}
            >
              End game
            </Button>
          </div>
        </Overlay>
      )}
    </>
  );
}
