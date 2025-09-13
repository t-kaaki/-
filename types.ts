export interface Player {
  _id: string;
  uniformNumber: number;
  name: string;
}

export interface LineupPlayer extends Player {
  battingOrder: number;
  position: number | string; // Use string for DP/FP
  isFlex?: boolean;
}

export interface RosterPlayer extends Player {
  isPlaying: boolean;
}

export interface Lineup {
  title: string;
  starting: (LineupPlayer | null)[]; // Can be a player or an empty slot
  bench: Player[];
  rosterStatus: RosterPlayer[];
}