import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getLesson, getLessonContext, getLessonIds } from '@/lib/forge/content';
import Drill from './Drill';
import Reading from './Reading';
import LessonFooter from './LessonFooter';
import styles from './lesson.module.css';

export async function generateStaticParams() {
  return getLessonIds().map((lessonId) => ({ lessonId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await getLesson(lessonId);
  if (!lesson) return { title: 'Lesson Not Found' };

  return {
    title: `${lesson.title} — Forge Spanish`,
    description:
      lesson.type === 'reading'
        ? `A Forge Spanish reading lesson: ${lesson.title}.`
        : `Practice ${lesson.title} with ${lesson.sentences.length} questions.`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const [lesson, context] = [await getLesson(lessonId), getLessonContext(lessonId)];

  if (!lesson || !context) {
    notFound();
  }

  const footer = (
    <LessonFooter lessonId={lesson.id} next={context.next} previous={context.previous} />
  );

  return (
    <article className={`content ${styles.lesson}`}>
      <nav className={styles.breadcrumb}>
        <Link href="/forge">← Course</Link>
        <span className={styles.crumbSeparator}>/</span>
        <span>
          {String(context.unitNumber).padStart(2, '0')} {context.unitTitle}
        </span>
        <span className={styles.crumbSeparator}>/</span>
        <span>{context.sectionTitle}</span>
      </nav>

      <h1 className={styles.title}>{lesson.title}</h1>

      <div className={styles.body}>
        {lesson.type === 'reading' ? (
          <Reading lesson={lesson} />
        ) : (
          // A drill holds its footer back until you've finished, so the
          // lesson controls don't sit among the question's own buttons.
          <Drill lesson={lesson} footer={footer} />
        )}
      </div>

      {lesson.type === 'reading' && footer}
    </article>
  );
}
