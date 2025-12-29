import { useState, useRef, useCallback } from 'react';

export interface SwipeState {
  offsetX: number;
  isDragging: boolean;
}

export interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

interface UseSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
}: UseSwipeOptions): [SwipeState, SwipeHandlers] {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const handleStart = useCallback((clientX: number) => {
    startXRef.current = clientX;
    setIsDragging(true);
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      const diff = clientX - startXRef.current;
      setOffsetX(diff);
    },
    [isDragging]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;

    if (offsetX > threshold) {
      onSwipeRight();
    } else if (offsetX < -threshold) {
      onSwipeLeft();
    }

    setOffsetX(0);
    setIsDragging(false);
  }, [isDragging, offsetX, threshold, onSwipeLeft, onSwipeRight]);

  const handlers: SwipeHandlers = {
    onTouchStart: (e) => handleStart(e.touches[0].clientX),
    onTouchMove: (e) => handleMove(e.touches[0].clientX),
    onTouchEnd: handleEnd,
    onMouseDown: (e) => handleStart(e.clientX),
    onMouseMove: (e) => handleMove(e.clientX),
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
  };

  return [{ offsetX, isDragging }, handlers];
}
