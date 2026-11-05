/** Shapes shared by the server content layer and the client lesson players. */

export interface Sentence {
  id: string;
  es: string;
  en: string;
  /** Other translations accepted when typing. */
  esAccepted: string[];
  enAccepted: string[];
  /** Hand-written wrong answers. Most sentences have none. */
  esDistractors: string[];
  enDistractors: string[];
  tips: string[];
  hasAudio: boolean;
}

export interface Tip {
  id: string;
  title: string;
  /** Tip bodies are written in markdown, rendered on the server. */
  html: string;
}

export type LessonType = 'reading' | 'drill';

/** Just enough to render a lesson in the course outline. */
export interface LessonSummary {
  id: string;
  title: string;
  type: LessonType;
  /** Number of sentences in a drill; omitted for readings. */
  sentenceCount?: number;
}

export interface Section {
  id: string;
  title: string;
  /** Position within its unit, starting at 1. */
  number: number;
  lessons: LessonSummary[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  /** Position within the course, starting at 1. */
  number: number;
  sections: Section[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  units: Unit[];
  lessonCount: number;
}

export interface ReadingLesson {
  id: string;
  type: 'reading';
  title: string;
  html: string;
}

export interface DrillLesson {
  id: string;
  type: 'drill';
  title: string;
  sentences: Sentence[];
  tips: Tip[];
}

export type Lesson = ReadingLesson | DrillLesson;

/** Where a lesson sits in the course, for breadcrumbs and next/prev. */
export interface LessonContext {
  unitTitle: string;
  unitNumber: number;
  sectionTitle: string;
  sectionNumber: number;
  previous: LessonSummary | null;
  next: LessonSummary | null;
}
