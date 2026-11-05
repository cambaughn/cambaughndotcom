'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (): (() => void) => () => {};

/**
 * False while server-rendering and during hydration, true afterwards.
 *
 * For components whose first client render can't match the server's — a drill
 * whose questions are shuffled, say. Doing it through useSyncExternalStore
 * rather than an effect keeps it out of React's cascading-render warnings.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
