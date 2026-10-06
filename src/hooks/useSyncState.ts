import { useState, useEffect } from 'react';
import { SyncState } from '../types';
import { syncEngine } from '../lib/syncEngine';

export function useSyncState() {
  const [syncState, setSyncState] = useState<SyncState>(syncEngine.getState());

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  return syncState;
}
