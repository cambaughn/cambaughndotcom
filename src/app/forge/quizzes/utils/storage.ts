const COMPLETED_LESSONS_KEY = 'completed_lessons';

const EMPTY: string[] = [];

// Cache the parsed list so repeated reads return the same reference.
// useSyncExternalStore re-renders in a loop if the snapshot changes identity.
let cachedRaw: string | null = null;
let cachedList: string[] = EMPTY;

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function getCompletedLessons(): string[] {
  if (typeof window === 'undefined') return EMPTY;
  const raw = localStorage.getItem(COMPLETED_LESSONS_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedList = raw ? JSON.parse(raw) : EMPTY;
  }
  return cachedList;
}

// Server render has no localStorage, so nothing is completed yet.
export function getCompletedLessonsOnServer(): string[] {
  return EMPTY;
}

export function subscribeToCompletedLessons(listener: () => void): () => void {
  listeners.add(listener);
  // Picks up writes from other tabs; same-tab writes go through notify().
  window.addEventListener('storage', notify);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', notify);
    }
  };
}

export function markLessonAsCompleted(lessonId: string): void {
  if (typeof window === 'undefined') return;
  const completed = getCompletedLessons();
  if (completed.includes(lessonId)) return;
  localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify([...completed, lessonId]));
  notify();
}

export function isLessonCompleted(lessonId: string): boolean {
  return getCompletedLessons().includes(lessonId);
}
