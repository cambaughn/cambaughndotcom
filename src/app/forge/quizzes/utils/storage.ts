const COMPLETED_LESSONS_KEY = 'completed_lessons';

export function getCompletedLessons(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(COMPLETED_LESSONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function markLessonAsCompleted(lessonId: string): void {
  if (typeof window === 'undefined') return;
  const completed = getCompletedLessons();
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(completed));
  }
}

export function isLessonCompleted(lessonId: string): boolean {
  if (typeof window === 'undefined') return false;
  return getCompletedLessons().includes(lessonId);
} 