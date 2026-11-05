'use client';

import Link from 'next/link';

import { toggleComplete, useCompletedLessons } from '@/lib/forge/progress';
import type { LessonSummary } from '@/lib/forge/types';
import styles from './lesson.module.css';

export default function LessonFooter({
  lessonId,
  next,
  previous,
}: {
  lessonId: string;
  next: LessonSummary | null;
  previous: LessonSummary | null;
}) {
  const completed = useCompletedLessons();
  const isComplete = completed.includes(lessonId);

  return (
    <footer className={styles.footer}>
      <button
        type="button"
        className={isComplete ? styles.completeToggleDone : styles.completeToggle}
        onClick={() => toggleComplete(lessonId)}
        aria-pressed={isComplete}
      >
        <span aria-hidden="true">{isComplete ? '✓' : '○'}</span>
        {isComplete ? 'Completed' : 'Mark as complete'}
      </button>

      <div className={styles.lessonNav}>
        {previous && (
          <Link href={`/forge/${previous.id}`} className={styles.navLink}>
            ← {previous.title}
          </Link>
        )}
        {next && (
          <Link href={`/forge/${next.id}`} className={styles.navLink}>
            {next.title} →
          </Link>
        )}
      </div>
    </footer>
  );
}
