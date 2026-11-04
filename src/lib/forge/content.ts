/**
 * Server-side access to the Forge Spanish course.
 *
 * The content lives in src/content/forge as four id-keyed JSON files, imported
 * directly so Next can statically render every lesson at build time. See
 * scripts/import-forge-content.mjs for where it came from.
 */

import { remark } from 'remark';
import breaks from 'remark-breaks';
import gfm from 'remark-gfm';
import html from 'remark-html';

import courseData from '@/content/forge/course.json';
import lessonData from '@/content/forge/lessons.json';
import sentenceData from '@/content/forge/sentences.json';
import tipData from '@/content/forge/tips.json';

import type {
  Course,
  Lesson,
  LessonContext,
  LessonSummary,
  Sentence,
  Tip,
  Unit,
} from './types';

interface RawReadingLesson {
  id: string;
  type: 'reading';
  title: string;
  text: string;
}

interface RawDrillLesson {
  id: string;
  type: 'drill';
  title: string;
  sentences: string[];
}

type RawLesson = RawReadingLesson | RawDrillLesson;

const lessons = lessonData as Record<string, RawLesson>;
const sentences = sentenceData as Record<string, Sentence>;
const tips = tipData as Record<string, { id: string; title: string; text: string }>;

// `breaks` keeps single newlines as line breaks. This content was written
// for a renderer that honoured them, so word lists like the one in "-al the
// words" are a line each rather than a markdown paragraph, and would
// otherwise run together into a sentence.
const toHtml = async (markdown: string): Promise<string> => {
  const processed = await remark().use(gfm).use(breaks).use(html).process(markdown);
  return processed.toString();
};

const summarize = (lesson: RawLesson): LessonSummary => ({
  id: lesson.id,
  title: lesson.title,
  type: lesson.type,
  ...(lesson.type === 'drill' ? { sentenceCount: lesson.sentences.length } : {}),
});

/** The course outline: units, sections and lesson titles, with no body text. */
export function getCourse(): Course {
  const units: Unit[] = courseData.units.map((unit, unitIndex) => ({
    id: unit.id,
    title: unit.title,
    description: unit.description,
    number: unitIndex + 1,
    sections: unit.sections.map((section, sectionIndex) => ({
      id: section.id,
      title: section.title,
      number: sectionIndex + 1,
      lessons: section.lessons
        .map((id) => lessons[id])
        .filter(Boolean)
        .map(summarize),
    })),
  }));

  return {
    id: courseData.id,
    title: courseData.title,
    description: courseData.description,
    units,
    lessonCount: units.reduce(
      (total, unit) =>
        total + unit.sections.reduce((n, section) => n + section.lessons.length, 0),
      0
    ),
  };
}

/** Every lesson id in course order. */
export function getLessonIds(): string[] {
  return getCourse().units.flatMap((unit) =>
    unit.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id))
  );
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const raw = lessons[id];
  if (!raw) return null;

  if (raw.type === 'reading') {
    // The app this came from split the text on `---` and paginated it. On the
    // web it reads better as one page, where those breaks become rules.
    return {
      id: raw.id,
      type: 'reading',
      title: raw.title,
      html: await toHtml(raw.text),
    };
  }

  const drillSentences = raw.sentences
    .map((sentenceId) => sentences[sentenceId])
    .filter(Boolean);

  const tipIds = [...new Set(drillSentences.flatMap((sentence) => sentence.tips))];

  const drillTips: Tip[] = await Promise.all(
    tipIds
      .map((tipId) => tips[tipId])
      .filter(Boolean)
      .map(async (tip) => ({ id: tip.id, title: tip.title, html: await toHtml(tip.text) }))
  );

  return {
    id: raw.id,
    type: 'drill',
    title: raw.title,
    sentences: drillSentences,
    tips: drillTips,
  };
}

/** Breadcrumb titles plus the lessons either side of this one. */
export function getLessonContext(id: string): LessonContext | null {
  const course = getCourse();
  const flat = course.units.flatMap((unit) =>
    unit.sections.flatMap((section) =>
      section.lessons.map((lesson) => ({ lesson, unit, section }))
    )
  );

  const index = flat.findIndex((entry) => entry.lesson.id === id);
  if (index === -1) return null;

  const { unit, section } = flat[index];
  return {
    unitTitle: unit.title,
    unitNumber: unit.number,
    sectionTitle: section.title,
    sectionNumber: section.number,
    previous: flat[index - 1]?.lesson ?? null,
    next: flat[index + 1]?.lesson ?? null,
  };
}
