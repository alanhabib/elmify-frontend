import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage sleep timer functionality
 * Automatically pauses the player when timer expires
 * NOTE: This hook is no longer needed as sleep timer logic is in PlayerProvider
 * Kept for backwards compatibility
 */
export function useSleepTimer(pauseFn?: () => void | Promise<void>) {
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const sleepTimerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sleepTimer === null) {
      if (sleepTimerInterval.current) {
        clearInterval(sleepTimerInterval.current);
        sleepTimerInterval.current = null;
      }
      setSleepTimerRemaining(null);
      return;
    }

    // Set initial remaining time
    setSleepTimerRemaining(sleepTimer * 60);

    // Count down every second
    sleepTimerInterval.current = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Timer finished - pause player
          if (pauseFn) {
            pauseFn();
          }
          setSleepTimer(null);
          clearInterval(sleepTimerInterval.current!);
          sleepTimerInterval.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sleepTimerInterval.current) {
        clearInterval(sleepTimerInterval.current);
        sleepTimerInterval.current = null;
      }
    };
  }, [sleepTimer, pauseFn]);

  return {
    sleepTimer,
    setSleepTimer,
    sleepTimerRemaining,
  };
}
