import { useCallback, useMemo, useRef } from 'react';
import { deal } from '../game/random';
import { applyAction, createInitialState, GameAction, GameState, normalizeState, TeamIndex } from '../game/state';
import { useLocalStorageState } from './useLocalStorageState';

const STORAGE_KEY = 'decrypto:gameState:v1';

// Connects the reducer to React and saves the game in localStorage, so it survives a refresh
export function useGame() {
  const [state, setState] = useLocalStorageState<GameState>(STORAGE_KEY, createInitialState, normalizeState);

  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatch = useCallback(
    (action: GameAction) => {
      const prev = stateRef.current;
      const next = applyAction(prev, action);
      if (next === prev) return;
      stateRef.current = { ...next, version: prev.version + 1 };
      setState(stateRef.current);
    },
    [setState]
  );

  const actions = useMemo(
    () => ({
      // The deal comes from the game code, so both phones get the same one; the reducer stays pure
      startGame: (gameCode: string, team: TeamIndex, players: string[], round = 1) => {
        const { keywords, codes } = deal(gameCode);
        dispatch({ type: 'START_GAME', gameCode, team, players, keywords: keywords[team], codes: codes[team], round });
      },
      revealCode: () => dispatch({ type: 'REVEAL_CODE' }),
      hideCode: () => dispatch({ type: 'HIDE_CODE' }),
      nextRound: () => dispatch({ type: 'NEXT_ROUND' }),
      endGame: () => dispatch({ type: 'END_GAME' }),
      resumeGame: () => dispatch({ type: 'RESUME_GAME' }),
      newGame: () => dispatch({ type: 'NEW_GAME' }),
    }),
    [dispatch]
  );

  return { game: state, actions };
}

export type GameActions = ReturnType<typeof useGame>['actions'];
