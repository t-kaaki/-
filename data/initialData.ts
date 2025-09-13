import type { Lineup, RosterPlayer, Player, LineupPlayer } from './types';

// A single source of truth for all players to ensure ID consistency.
const allPlayers: Player[] = [
  { _id: 'player-1', uniformNumber: 1, name: '高田 茉央' },
  { _id: 'player-2', uniformNumber: 2, name: '鈴木 楠乃' },
  { _id: 'player-3', uniformNumber: 3, name: '渡邉 碧唯' },
  { _id: 'player-4', uniformNumber: 4, name: '井田 日瑠' },
  { _id: 'player-5', uniformNumber: 5, name: '新井 芙羽' },
  { _id: 'player-6', uniformNumber: 6, name: '長沼 芽衣' },
  { _id: 'player-7', uniformNumber: 7, name: '塩谷 日菜歌' },
  { _id: 'player-8', uniformNumber: 8, name: 'N/A' },
  { _id: 'player-9', uniformNumber: 9, name: '板橋 桜空' },
  { _id: 'player-10', uniformNumber: 10, name: '細沢 芽生' },
  { _id: 'player-11', uniformNumber: 11, name: '須水 心春' },
  { _id: 'player-12', uniformNumber: 12, name: '飯野 蓮叶' },
  { _id: 'player-13', uniformNumber: 13, name: '阿部 日陽' },
  { _id: 'player-14', uniformNumber: 14, name: '金子 未来' },
  { _id: 'player-15', uniformNumber: 15, name: '清村 侑加' },
  { _id: 'player-16', uniformNumber: 16, name: '須田 莉子' },
  { _id: 'player-17', uniformNumber: 17, name: 'N/A' },
  { _id: 'player-19', uniformNumber: 19, name: 'N/A' },
];

// Helper to find a player by their uniform number from the master list.
const getPlayer = (num: number): Player => {
  const player = allPlayers.find(p => p.uniformNumber === num);
  if (!player) {
    // Return a default player object if not found to avoid crashes.
    return { _id: `not-found-${num}`, uniformNumber: num, name: 'Unknown' };
  }
  return player;
};

export const initialRoster: RosterPlayer[] = allPlayers.map(p => ({ ...p, isPlaying: false }));

const generateRosterStatus = (starting: (LineupPlayer | null)[], bench: Player[]): RosterPlayer[] => {
  const playingIds = new Set([
    ...starting.filter(p => p).map(p => p!._id),
    ...bench.map(p => p._id)
  ]);
  return allPlayers.map(player => ({
    ...player,
    isPlaying: playingIds.has(player._id),
  }));
};

const createFixedLineup = (players: (LineupPlayer | null)[]): (LineupPlayer | null)[] => {
    const fixedLineup: (LineupPlayer | null)[] = Array(10).fill(null);
    players.forEach(player => {
        if (!player) return;
        if (player.battingOrder > 0 && player.battingOrder <= 9) {
            fixedLineup[player.battingOrder - 1] = player;
        } else if (player.isFlex || player.position === 'FP' || player.battingOrder === 0) {
            fixedLineup[9] = player;
        }
    });
    return fixedLineup;
};


// Game 1 Data (using the master player list for consistency)
const game1StartingRaw: LineupPlayer[] = [
  { ...getPlayer(4), battingOrder: 1, position: 4 },
  { ...getPlayer(5), battingOrder: 2, position: 5 },
  { ...getPlayer(1), battingOrder: 3, position: 1 },
  { ...getPlayer(10), battingOrder: 4, position: 2 },
  { ...getPlayer(3), battingOrder: 5, position: 3 },
  { ...getPlayer(6), battingOrder: 6, position: 6 },
  { ...getPlayer(9), battingOrder: 7, position: 'DP' },
  { ...getPlayer(11), battingOrder: 8, position: 7 },
  { ...getPlayer(14), battingOrder: 9, position: 9 },
  { ...getPlayer(16), battingOrder: 0, position: 8, isFlex: true },
];
const game1Starting = createFixedLineup(game1StartingRaw);
const game1StartingIds = new Set(game1Starting.filter(p => p).map(p => p!._id));
const game1Bench: Player[] = allPlayers.filter(p => !game1StartingIds.has(p._id));

// Game 2 Data
const game2StartingRaw: LineupPlayer[] = [
    { ...getPlayer(4), battingOrder: 1, position: 4 },
    { ...getPlayer(5), battingOrder: 2, position: 5 },
    { ...getPlayer(1), battingOrder: 3, position: 1 },
    { ...getPlayer(10), battingOrder: 4, position: 2 },
    { ...getPlayer(3), battingOrder: 5, position: 3 },
    { ...getPlayer(6), battingOrder: 6, position: 6 },
    { ...getPlayer(9), battingOrder: 7, position: 'DP' },
    { ...getPlayer(16), battingOrder: 8, position: 8 },
    { ...getPlayer(14), battingOrder: 9, position: 9 },
    { ...getPlayer(2), battingOrder: 0, position: 7, isFlex: true },
];
const game2Starting = createFixedLineup(game2StartingRaw);
const game2StartingIds = new Set(game2Starting.filter(p => p).map(p => p!._id));
const game2Bench: Player[] = allPlayers.filter(p => !game2StartingIds.has(p._id));

// Game 3 Data
const game3StartingRaw: (LineupPlayer | null)[] = [
    { ...getPlayer(10), battingOrder: 1, position: 6 },
    { ...getPlayer(2), battingOrder: 2, position: 8 },
    { ...getPlayer(1), battingOrder: 3, position: 7 },
    { ...getPlayer(8), battingOrder: 4, position: 5 },
    { ...getPlayer(6), battingOrder: 5, position: 'DP' },
    { ...getPlayer(5), battingOrder: 6, position: 2 },
    { ...getPlayer(7), battingOrder: 7, position: 1 },
    { ...getPlayer(3), battingOrder: 8, position: 4 },
    { ...getPlayer(13), battingOrder: 9, position: 3 },
    { ...getPlayer(17), battingOrder: 0, position: 9, isFlex: true },
];
const game3Starting = createFixedLineup(game3StartingRaw);
const game3StartingIds = new Set(game3Starting.filter(p => p).map(p => p!._id));
const game3Bench: Player[] = allPlayers.filter(p => !game3StartingIds.has(p._id));

// Final Lineups object export
export const initialLineups: { [key: string]: Lineup } = {
  "game1": {
    title: "2年のみ9人 (Game 1)",
    starting: game1Starting,
    bench: game1Bench,
    rosterStatus: generateRosterStatus(game1Starting, game1Bench),
  },
  "game2": {
    title: "10人 (Game 2)",
    starting: game2Starting,
    bench: game2Bench,
    rosterStatus: generateRosterStatus(game2Starting, game2Bench),
  },
  "game3": {
    title: "坂本p (Game 3)",
    starting: game3Starting,
    bench: game3Bench,
    rosterStatus: generateRosterStatus(game3Starting, game3Bench),
  },
};