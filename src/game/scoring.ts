import { ScoreData } from '../types/tetris';

// Scoring system based on lines cleared and level
export function calculateLineClearPoints(lines: number, level: number): number {
  const basePoints: Record<number, number> = {
    1: 100,  // Single
    2: 300,  // Double
    3: 500,  // Triple
    4: 800,  // Tetris
  };

  const base = basePoints[lines] || 0;
  return base * level;
}

// Calculate soft drop points
export function calculateSoftDropPoints(cells: number): number {
  return cells; // 1 point per cell
}

// Calculate hard drop points
export function calculateHardDropPoints(cells: number): number {
  return cells * 2; // 2 points per cell
}

// Update score data
export function updateScore(
  currentScore: ScoreData,
  linesCleared: number,
  softDropCells: number = 0,
  hardDropCells: number = 0
): ScoreData {
  let newScore = currentScore.score;
  let newLines = currentScore.lines;
  let newLevel = currentScore.level;

  // Add line clear points
  newScore += calculateLineClearPoints(linesCleared, newLevel);

  // Add drop points
  newScore += softDropCells;
  newScore += hardDropCells;

  // Update lines
  newLines += linesCleared;

  // Level up every 10 lines
  newLevel = Math.min(Math.floor(newLines / 10) + 1, 29);

  return {
    score: newScore,
    level: newLevel,
    lines: newLines,
  };
}
