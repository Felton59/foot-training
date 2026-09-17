import { useEffect, useRef, useState } from 'react';

export function useCountdown(initialSec: number, onEnd: () => void) {
  const [remaining, setRemaining] = useState(initialSec);
  const [running, setRunning] = useState(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;
  const remainingRef = useRef(initialSec);
  remainingRef.current = remaining;

  useEffect(() => {
    if (!running) return;
    const endAt = Date.now() + remainingRef.current * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        setRunning(false);
        onEndRef.current();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  return {
    remaining,
    running,
    start: () => {
      if (remainingRef.current > 0) setRunning(true);
    },
    pause: () => setRunning(false),
  };
}
