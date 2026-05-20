# Tetris 2-Player Mode - Requirements & Implementation Plan

## Overview
This document describes the requirements and implementation plan for adding 2-player dual control mode to the existing Tetris game.

## Key Features

### 1. Game Modes
- **Single Player**: Original gameplay with one player controlling pieces using arrow keys
- **Dual Player**: Two players compete on a shared 20-column wide field, each controlling their own pieces in the common play area

### 2. Controls

#### Player 1
| Action | Key |
|--------|-----|
| Move Left | ← (Arrow Left) |
| Move Right | → (Arrow Right) |
| Rotate | ↑ (Arrow Up) or W |
| Soft Drop | ↓ (Arrow Down) or S |
| Hard Drop | Space |

#### Player 2
| Action | Key |
|--------|-----|
| Move Left | A |
| Move Right | D |
| Rotate | E |
| Soft Drop | X |
| Hard Drop | Q |

### 3. Shared Field Layout
- The field is a **20-column wide board** (2x the original width)
- Both players share the **same common field** — pieces can move freely across the entire board
- Each player controls their own piece simultaneously
- Players can move shapes from left to right side without restrictions
- Pieces from one player can block the other by filling cells anywhere on the board
- No visual divider between players — unified play area

### 4. Visual Indicators
- Player 1 pieces have a blue border tint
- Player 2 pieces have a red border tint
- No zone labels or divider — unified shared field

### 5. Scoring
- Each player has independent scoring
- Both players share the same line-clearing mechanics
- When a line is cleared, it affects both players' stacked pieces
- Game ends when BOTH players have their pieces locked at the top

### 6. Game Over Conditions (Dual Mode)
- Game ends when both players cannot place new pieces
- Individual player status shown (active/eliminated)
- Winner determined by total lines cleared

## Implementation Details

### Files Modified

1. **src/types/tetris.ts**
   - Updated board comment to note 20-column width
   - Kept `GameMode`, `PlayerId`, and dual player types

2. **src/game/board.ts**
   - Changed `BOARD_COLS` from 10 to 20
   - Removed `PLAYER1_ZONE` and `PLAYER2_ZONE` constants
   - Removed `getPlayerZone()` function
   - Simplified `isValidPosition()` - removed zone checking logic

3. **src/hooks/useGameState.ts**
   - Changed `BOARD_COLS` from 10 to 20
   - Removed zone restriction logic from `checkShapeCollision()`
   - Updated spawn positions for shared field
   - Removed `playerId` parameter usage in collision checks

4. **src/components/GameBoard.tsx**
   - Removed zone labels (P1, P2)
   - Removed center divider support
   - Simplified render map logic

5. **src/components/Cell.tsx**
   - No changes needed (isCenterDivider prop now always false)

6. **src/components/ScorePanel.tsx**
   - No changes needed

7. **src/components/GameOverlay.tsx**
   - No changes needed

8. **src/App.tsx**
   - No changes needed

9. **src/styles/GameBoard.css**
   - Changed grid to `repeat(20, 28px)` columns
   - Removed zone label styles
   - Removed center divider line styles

10. **src/styles/GameOverlay.css**
    - No changes needed

11. **src/styles/App.css**
    - No changes needed

## Testing Checklist
- [ ] Single player mode works as before
- [ ] Dual player mode starts correctly
- [ ] Field is 20 columns wide (2x original width)
- [ ] Both players share the common field
- [ ] Player 1 pieces can move across the entire board
- [ ] Player 2 pieces can move across the entire board
- [ ] Player 1 controls (arrows) work correctly
- [ ] Player 2 controls (WASD+E/Q/X) work correctly
- [ ] No visual divider between zones
- [ ] No zone labels displayed
- [ ] Player indicators (blue/red borders) show correctly
- [ ] Line clearing works for both players
- [ ] Independent scoring works
- [ ] Game over triggers when both players lose
- [ ] Mode selection works on menu screen