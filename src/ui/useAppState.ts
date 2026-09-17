import { useCallback, useRef, useState } from 'react';
import type { AppState } from '../storage/schema';
import { loadState, saveState, type KV, type LoadStatus } from '../storage/store';

export function getBrowserStorage(): KV | null {
  try {
    const storage = window.localStorage;
    const probe = 'foot-training:probe';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function useAppState() {
  const [kv] = useState(getBrowserStorage);
  const [initial] = useState(() => loadState(kv, new Date()));
  const [state, setState] = useState<AppState>(initial.state);
  const [saveFailed, setSaveFailed] = useState(false);
  const current = useRef(initial.state);

  const update = useCallback(
    (fn: (s: AppState) => AppState) => {
      const next = fn(current.current);
      if (next === current.current) return;
      current.current = next;
      setSaveFailed(kv !== null && !saveState(kv, next));
      setState(next);
    },
    [kv],
  );

  return { state, update, loadStatus: initial.status as LoadStatus, saveFailed };
}
