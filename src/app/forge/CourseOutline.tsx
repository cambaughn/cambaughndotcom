'use client';

import Link from 'next/link';
import { useState } from 'react';

import { toggleComplete, useCompletedLessons } from '@/lib/forge/progress';
import type { Course, LessonSummary, Section } from '@/lib/forge/types';
import styles from './CourseOutline.module.css';

export default function CourseOutline({ course }: { course: Course }) {
  const completed = useCompletedLessons();
  const completedSet = new Set(completed);

  // Sections open or closed by hand. Anything not listed falls back to the
  // section holding the next unfinished lesson, so the page opens where you
  // left off without hiding the rest of the course.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const next = findNextLesson(course, completedSet);

  const doneCount = course.units.reduce(
    (total, unit) =>
      total +
      unit.sections.reduce(
        (n, section) => n + section.lessons.filter((l) => completedSet.has(l.id)).length,
        0
      ),
    0
  );

  const isOpen = (section: Section): boolean =>
    overrides[section.id] ?? section.id === next?.section.id;

  const toggleSection = (section: Section): void =>
    setOverrides((current) => ({ ...current, [section.id]: !isOpen(section) }));

  return (
    <section>
      <header className={styles.header}>
        <h2 className={styles.courseTitle}>{course.title}</h2>
        <p className={styles.progress}>
          {doneCount} of {course.lessonCount} lessons complete
        </p>
        <div className={styles.track} aria-hidden="true">
          <div
            className={styles.fill}
            style={{ width: `${(doneCount / course.lessonCount) * 100}%` }}
          />
        </div>
        {next && (
          <Link href={`/forge/${next.lesson.id}`} className={styles.continue}>
            {doneCount === 0 ? 'Start the course' : 'Continue'}
            <span className={styles.continueLesson}>{next.lesson.title}</span>
          </Link>
        )}
      </header>

      {course.units.map((unit) => {
        const unitLessons = unit.sections.flatMap((section) => section.lessons);
        const unitDone = unitLessons.every((lesson) => completedSet.has(lesson.id));

        return (
          <div key={unit.id} className={styles.unit}>
            <h3 className={styles.unitTitle}>
              <span className={styles.unitNumber}>
                {String(unit.number).padStart(2, '0')}
              </span>
              {unit.title}
              {unitDone && (
                <span className={styles.unitDone} title="Unit complete">
                  ✓
                </span>
              )}
            </h3>

            <ul className={styles.sections}>
              {unit.sections.map((section) => {
                const done = section.lessons.filter((l) => completedSet.has(l.id)).length;
                const open = isOpen(section);

                return (
                  <li key={section.id} className={styles.section}>
                    <button
                      type="button"
                      className={styles.sectionButton}
                      onClick={() => toggleSection(section)}
                      aria-expanded={open}
                    >
                      <span className={styles.sectionNumber}>
                        {done === section.lessons.length ? '✓' : String(section.number).padStart(2, '0')}
                      </span>
                      <span className={styles.sectionTitle}>{section.title}</span>
                      <span className={styles.sectionCount}>
                        {done}/{section.lessons.length}
                      </span>
                      <span className={open ? styles.chevronOpen : styles.chevron} aria-hidden="true">
                        ›
                      </span>
                    </button>

                    {open && (
                      <ul className={styles.lessons}>
                        {section.lessons.map((lesson) => (
                          <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            isComplete={completedSet.has(lesson.id)}
                          />
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

/** The first lesson, in course order, that isn't ticked off. */
function findNextLesson(course: Course, completedSet: Set<string>) {
  for (const unit of course.units) {
    for (const section of unit.sections) {
      for (const lesson of section.lessons) {
        if (!completedSet.has(lesson.id)) return { lesson, section, unit };
      }
    }
  }
  return null;
}

function LessonRow({
  lesson,
  isComplete,
}: {
  lesson: LessonSummary;
  isComplete: boolean;
}) {
  return (
    <li className={styles.lesson}>
      <button
        type="button"
        className={isComplete ? styles.checkDone : styles.check}
        onClick={() => toggleComplete(lesson.id)}
        aria-pressed={isComplete}
        title={isComplete ? 'Mark as not complete' : 'Mark as complete'}
      >
        <span aria-hidden="true">{isComplete ? '✓' : ''}</span>
        <span className={styles.srOnly}>
          {isComplete ? `Mark ${lesson.title} as not complete` : `Mark ${lesson.title} as complete`}
        </span>
      </button>

      <Link
        href={`/forge/${lesson.id}`}
        className={isComplete ? styles.lessonLinkDone : styles.lessonLink}
      >
        <span className={styles.lessonType} aria-hidden="true">
          {lesson.type === 'reading' ? '📖' : '⚡'}
        </span>
        <span className={styles.lessonTitle}>{lesson.title}</span>
        {lesson.sentenceCount != null && (
          <span className={styles.lessonMeta}>
            {lesson.sentenceCount} questions
          </span>
        )}
      </Link>
    </li>
  );
}
