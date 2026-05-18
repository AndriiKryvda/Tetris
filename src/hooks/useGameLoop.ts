import { useEffect, useRef, useCallback } from 'react';

interface UseGameLoopOptions {
  isPlaying: boolean;
  isPaused: boolean;
  dropSpeed: number;
  onTick: () => void;
}

export function useGameLoop({ isPlaying, isPaused, dropSpeed, onTick }: UseGameLoopOptions) {
  const lastDropTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const onTickRef = useRef(onTick);

  onTickRef.current = onTick;

  const tick = useCallback((timestamp: number) => {
    if (!isPlaying || isPaused) {
      animationFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    if (timestamp - lastDropTimeRef.current >= dropSpeed) {
      onTickRef.current();
      lastDropTimeRef.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [isPlaying, isPaused, dropSpeed]);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      lastDropTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPaused, tick]);

  return { resetTimer: () => { lastDropTimeRef.current = performance.now(); } };
}

export default useGameLoop;
