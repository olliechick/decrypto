import { useCallback, useMemo, useRef } from 'react';
import { drawCodes, drawKeywords } from '../game/random';
import { applyAction, Code, createInitialState, GameAction, GameState, normalizeState, TeamSetup } from '../game/state';
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
      // The keywords and codes are drawn here, so the reducer stays pure
      startGame: (teams: TeamSetup[]) =>
        dispatch({ type: 'START_GAME', teams, keywords: drawKeywords(), codes: drawCodes() }),
      doneKeywords: () => dispatch({ type: 'DONE_KEYWORDS' }),
      submitClues: (clues: string[]) => dispatch({ type: 'SUBMIT_CLUES', clues }),
      submitIntercept: (guess: Code) => dispatch({ type: 'SUBMIT_INTERCEPT', guess }),
      submitDecode: (guess: Code) => dispatch({ type: 'SUBMIT_DECODE', guess }),
      backToIntercept: () => dispatch({ type: 'BACK_TO_INTERCEPT' }),
      next: () => dispatch({ type: 'NEXT' }),
      newGame: () => dispatch({ type: 'NEW_GAME' }),
    }),
    [dispatch]
  );

  return { game: state, actions };
}

export type GameActions = ReturnType<typeof useGame>['actions'];
