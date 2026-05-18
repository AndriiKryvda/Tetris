# Tetris

A classic Tetris game built with React, TypeScript, and Vite.

## Features

- Classic Tetris gameplay with all 7 standard tetrominoes (I, O, T, S, Z, J, L)
- Ghost piece showing where your piece will land
- Next piece preview (shows 3 upcoming pieces)
- Scoring system with bonuses for multi-line clears
- Leveling system with increasing speed
- Fair piece distribution using the bag system
- Pause/resume functionality
- Responsive dark theme design

## Technology Stack

- **React 18+** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **CSS Modules** - Styling

## Getting Started

### Prerequisites

- Node.js 16+ and npm 8+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The game will open at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Controls

| Action | Key |
|--------|-----|
| Move Left | `←` or `A` |
| Move Right | `→` or `D` |
| Rotate | `↑` or `W` |
| Soft Drop | `↓` or `S` |
| Hard Drop | `Space` |
| Pause | `P` or `Escape` |

## Scoring

| Action | Points |
|--------|--------|
| Single line | 100 × level |
| Double lines | 300 × level |
| Triple lines | 500 × level |
| Tetris (4 lines) | 800 × level |
| Soft drop | 1 point per cell |
| Hard drop | 2 points per cell |

## Leveling

- Level increases every 10 lines cleared
- Drop speed increases with each level
- Maximum level: 29

## Project Structure

```
tetris/
├── src/
│   ├── components/        # React components
│   │   ├── Cell.tsx
│   │   ├── GameBoard.tsx
│   │   ├── GameOverlay.tsx
│   │   ├── NextPiece.tsx
│   │   └── ScorePanel.tsx
│   ├── game/              # Game logic modules
│   │   ├── board.ts
│   │   ├── lines.ts
│   │   ├── levels.ts
│   │   ├── pieces.ts
│   │   └── scoring.ts
│   ├── hooks/             # React hooks
│   │   ├── useGameLoop.ts
│   │   ├── useKeyboard.ts
│   │   └── useGameState.ts
│   ├── styles/            # CSS styles
│   │   ├── App.css
│   │   ├── GameBoard.css
│   │   └── GameOverlay.css
│   ├── types/             # TypeScript types
│   │   └── tetris.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## License

MIT