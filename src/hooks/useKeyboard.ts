import { useEffect, useRef, useCallback } from 'react';

// Keyboard action types
export type KeyboardAction = 
  | 'moveLeft'
  | 'moveRight'
  | 'rotate'
  | 'softDrop'
  | 'hardDrop'
  | 'pause';

// Keyboard event handlers
export interface KeyboardHandlers {
  onAction: (action: KeyboardAction) => void;
}

// Map of key codes to actions
const KEY_MAP: Record<string, KeyboardAction> = {
  'ArrowLeft': 'moveLeft',
  'KeyA': 'moveLeft',
  'ArrowRight': 'moveRight',
  'KeyD': 'moveRight',
  'ArrowUp': 'rotate',
  'KeyW': 'rotate',
  'ArrowDown': 'softDrop',
  'KeyS': 'softDrop',
  'Space': 'hardDrop',
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
