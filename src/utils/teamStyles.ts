import type { TeamIndex } from '../game/state';

// Like the board game, one team is black and the other white
export const TEAM_STYLES: Record<TeamIndex, { card: string; muted: string; button: string }> = {
  0: {
    card: 'bg-black text-white ring-1 ring-white/20',
    muted: 'text-white/60',
    button: 'bg-white text-black hover:bg-gray-200',
  },
  1: {
    card: 'bg-white text-black ring-1 ring-black/10',
    muted: 'text-black/50',
    button: 'bg-black text-white hover:bg-gray-800',
  },
};

export const DEFAULT_TEAM_NAMES = ['Black', 'White'];
