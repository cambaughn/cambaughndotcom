'use client';

/**
 * Lesson progress, kept in localStorage.
 *
 * There are no accounts, so progress lives in the browser and is lost if the
 * visitor clears their storage. Lessons can be checked and unchecked by hand,
 * which is the escape hatch for that, and for marking something for review.
 *
 * The key matches the one the old quiz pages used, so anyone who worked
 * through those keeps their ticks.
 */

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'completed_lessons';

const EMPTY: string[] = [];

// useSyncExternalStore re-renders in a loop if the snapshot changes identity,
// so the parsed list is cached until the raw string changes.
let cachedRaw: string | null = null;
let cachedList: string[] = EMPTY;

const listeners = new Set<() => void>();

const notify = (): void => {
  for (const listener of listeners) listener();
};

const read = (): string[] => {
  if (typeof window === 'undefined') return EMPTY;

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private windows and blocked site data both throw here.
    return EMPTY;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : EMPTY;
      cachedList = Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : EMPTY;
    } catch {
      cachedList = EMPTY;
    }
  }

  return cachedList;
};

const write = (ids: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Nothing to do if we can't persist; the UI still updates for this view.
  }
  notify();
};

// The server has no localStorage, so nothing is complete in the first render.
const readOnServer = (): string[] => EMPTY;

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  // Picks up writes from other tabs; same-tab writes go through notify().
  window.addEventListener('storage', notify);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', notify);
    }
  };
};

export function useCompletedLessons(): string[] {
  return useSyncExternalStore(subscribe, read, readOnServer);
}

export function markComplete(lessonId: string): void {
  const completed = read();
  if (completed.includes(lessonId)) return;
  write([...completed, lessonId]);
}

export function toggleComplete(lessonId: string): void {
  const completed = read();
  write(
    completed.includes(lessonId)
      ? completed.filter((id) => id !== lessonId)
      : [...completed, lessonId]
  );
}
