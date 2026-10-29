import { useState } from 'react';
import type { GameState, TeamIndex } from '../game/state';
import { TEAM_STYLES } from '../utils/teamStyles';
import { Button } from './Button';
import { ClueSheet } from './ClueSheet';
import { Gate } from './Gate';
import { KeywordsCard } from './KeywordsCard';
import { Overlay } from './Overlay';
import { Rules } from './Rules';

type Panel = 'clues' | 'words' | 'rules' | 'newGame';

interface GameMenuProps {
  game: GameState;
  onNewGame: () => void;
}

// The buttons along the top of the game: clue sheets, a team's own keywords (behind a gate), rules and new game
export function GameMenu({ game, onNewGame }: GameMenuProps) {
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
      className="rounded-lg bg-white/10 px-1 py-2 text-xs font-bold hover:bg-white/20"
    >
      {label}
    </button>
  );

  return (
    <>
      <nav className="grid grid-cols-4 gap-1.5">
        {item('clues', 'Clues')}
        {item('words', 'Our words')}
        {item('rules', 'Rules')}
        {item('newGame', 'New game')}
      </nav>

      {panel === 'clues' && (
        <Overlay title="Clue sheets" onClose={close}>
          <ClueSheet game={game} initialTeam={game.activeTeam} />
        </Overlay>
      )}

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

      {panel === 'newGame' && (
        <Overlay title="New game" onClose={close}>
          <p className="text-white/80">This ends the game in progress and goes back to the setup screen.</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={close}>
              Keep playing
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-400"
              variant="custom"
              onClick={() => {
                close();
                onNewGame();
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
