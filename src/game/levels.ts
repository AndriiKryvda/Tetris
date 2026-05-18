// Level system - drop speed based on level
// Standard Tetris drop speeds (in milliseconds)
const DROP_SPEEDS: Record<number, number> = {
  1: 800,
  2: 720,
  3: 630,
  4: 550,
  5: 470,
  6: 380,
  7: 300,
  8: 240,
  9: 200,
  10: 170,
  11: 140,
  12: 130,
  13: 110,
  14: 100,
  15: 90,
  16: 80,
  17: 70,
  18: 63,
  19: 56,
  20: 50,
  21: 50,
  22: 50,
  23: 50,
  24: 50,
  25: 50,
  26: 50,
  27: 50,
  28: 50,
  29: 50,
};

// Get drop speed for a given level
export function getDropSpeed(level: number): number {
  if (level < 1) return DROP_SPEEDS[1];
  if (level > 29) return DROP_SPEEDS[29];
  return DROP_SPEEDS[level];
}

// Get lock delay (time before piece locks when touching ground)
export function getLockDelay(): number {
  return 500; // 500ms lock delay
}
