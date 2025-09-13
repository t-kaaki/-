export const POSITION_NAMES: { [key: string]: string } = {
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  'DP': 'DP',
};

// SVG coordinates for player positions on a 100x100 viewBox
export const POSITION_COORDINATES: { [key: string]: { x: number; y: number } } = {
    '1': { x: 50, y: 62 },   // Pitcher
    '2': { x: 50, y: 95 },   // Catcher
    '3': { x: 73.5, y: 68.5 }, // 1B - Symmetrical with 3B, on the line
    '4': { x: 65, y: 52 },   // 2B
    '5': { x: 26.5, y: 68.5 }, // 3B - Symmetrical with 1B, on the line
    '6': { x: 35, y: 52 },   // SS
    '7': { x: 18, y: 30 },   // LF
    '8': { x: 50, y: 20 },   // CF
    '9': { x: 82, y: 30 },   // RF
    'DP': { x: 92, y: 88 },  // DP
};