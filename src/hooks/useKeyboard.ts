import { useEffect, useRef } from 'react';

// Keyboard action types with player identifier
export type KeyboardAction = 
  | 'player1-moveLeft'
  | 'player1-moveRight'
  | 'player1-rotate'
  | 'player1-softDrop'
  | 'player1-hardDrop'
  | 'player2-moveLeft'
  | 'player2-moveRight'
  | 'player2-rotate'
  | 'player2-softDrop'
  | 'player2-hardDrop'
  | 'pause';

// Keyboard event handlers
export interface KeyboardHandlers {
  onAction: (action: KeyboardAction) => void;
}

// Map of key codes to actions
const KEY_MAP: Record<string, KeyboardAction> = {
  // Player 1: Arrow keys
  'ArrowLeft': 'player1-moveLeft',
  'ArrowRight': 'player1-moveRight',
  'ArrowUp': 'player1-rotate',
  'ArrowDown': 'player1-softDrop',
  'Space': 'player1-hardDrop',
  // Player 2: WASD + E + Q
  'KeyA': 'player2-moveLeft',
  'KeyD': 'player2-moveRight',
  'KeyE': 'player2-rotate',
  'KeyX': 'player2-softDrop',
  'KeyQ': 'player2-hardDrop',
  // Pause (shared)
  'KeyP': 'pause',
  'Escape': 'pause',
};

export function useKeyboard(handlers: KeyboardHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  // Track repeated actions for continuous movement
  const repeatedActionRef = useRef<KeyboardAction | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code];
      if (action) {
        e.preventDefault();
        handlersRef.current.onAction(action);
        repeatedActionRef.current = action;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code];
      if (action === repeatedActionRef.current) {
        repeatedActionRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        repeatedActionRef.current = null;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { repeatedActionRef };
}
