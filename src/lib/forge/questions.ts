/**
 * Turns a drill's sentences into a quiz.
 *
 * One question per sentence, its shape drawn at random from four: multiple
 * choice and typing, in each direction. The set is then shuffled, so
 * repeating a drill gives you a different mix of shapes over the same
 * sentences. The original app asked two questions per sentence, which made
 * drills drag.
 */

import type { Sentence } from './types';

export type QuestionKind = 'multipleChoice' | 'typing';
/** Which language the prompt is in. */
export type Direction = 'es-to-en' | 'en-to-es';

export interface Question {
  /** Unique within a generated set; sentences appear more than once. */
  key: string;
  sentenceId: string;
  kind: QuestionKind;
  direction: Direction;
  prompt: string;
  /** The answer we show as correct. */
  answer: string;
  /** Everything we accept as correct, answer included. */
  accepted: string[];
  /** Multiple choice only. Always includes the answer. */
  options?: string[];
  /** Set only when the prompt is Spanish, so audio never gives it away. */
  audioUrl: string | null;
  tips: string[];
}

const OPTION_COUNT = 3;

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Lowercase, unaccented, punctuation-free. Typed answers are compared this
 * way so a missing accent or stray comma doesn't read as a mistake.
 */
export const normalizeAnswer = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const isAnswerCorrect = (input: string, accepted: string[]): boolean => {
  const normalized = normalizeAnswer(input);
  return normalized.length > 0 && accepted.some((a) => normalizeAnswer(a) === normalized);
}

const SHAPES: { kind: QuestionKind; direction: Direction }[] = [
  { kind: 'multipleChoice', direction: 'es-to-en' },
  { kind: 'multipleChoice', direction: 'en-to-es' },
  { kind: 'typing', direction: 'es-to-en' },
  { kind: 'typing', direction: 'en-to-es' },
];

const QUESTIONS_PER_SENTENCE = 1;

export function buildDrillQuestions(sentences: Sentence[]): Question[] {
  const questions: Question[] = [];

  sentences.forEach((sentence) => {
    const shapes = shuffle(SHAPES).slice(0, QUESTIONS_PER_SENTENCE);

    shapes.forEach((shape, index) => {
      const promptIsSpanish = shape.direction === 'es-to-en';
      const prompt = promptIsSpanish ? sentence.es : sentence.en;
      const answer = promptIsSpanish ? sentence.en : sentence.es;
      const accepted = [
        answer,
        ...(promptIsSpanish ? sentence.enAccepted : sentence.esAccepted),
      ];

      const question: Question = {
        key: `${sentence.id}-${shape.kind}-${shape.direction}-${index}`,
        sentenceId: sentence.id,
        kind: shape.kind,
        direction: shape.direction,
        prompt,
        answer,
        accepted,
        audioUrl:
          promptIsSpanish && sentence.hasAudio
            ? `/forge/audio/${sentence.id}.mp3`
            : null,
        tips: sentence.tips,
      };

      if (shape.kind === 'multipleChoice') {
        question.options = buildOptions(sentence, sentences, promptIsSpanish, accepted);
      }

      questions.push(question);
    });
  });

  return shuffle(questions);
}

/**
 * The answer, any hand-written distractors, then other answers from the same
 * drill until there are enough. Borrowing from the drill keeps the wrong
 * answers on-topic, which matters because most sentences have no distractors
 * of their own.
 */
function buildOptions(
  sentence: Sentence,
  pool: Sentence[],
  promptIsSpanish: boolean,
  accepted: string[]
): string[] {
  const answer = promptIsSpanish ? sentence.en : sentence.es;
  const distractors = promptIsSpanish ? sentence.enDistractors : sentence.esDistractors;
  const options = [answer, ...distractors].slice(0, OPTION_COUNT);

  if (options.length < OPTION_COUNT) {
    const acceptedSet = new Set(accepted.map(normalizeAnswer));
    const siblings = shuffle(
      pool
        .filter((other) => other.id !== sentence.id)
        .map((other) => (promptIsSpanish ? other.en : other.es))
        .filter((text) => text && !acceptedSet.has(normalizeAnswer(text)))
    );

    for (const sibling of siblings) {
      if (options.length >= OPTION_COUNT) break;
      if (!options.some((o) => normalizeAnswer(o) === normalizeAnswer(sibling))) {
        options.push(sibling);
      }
    }
  }

  return shuffle(options);
}
