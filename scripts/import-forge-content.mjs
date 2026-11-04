/**
 * One-time importer for the Forge Spanish course.
 *
 * Reads the raw Firebase export from the archived Forge repo and writes the
 * normalized course data this site actually uses, plus the sentence audio.
 * Kept in the repo for provenance: it documents exactly where the content in
 * src/content/forge came from and lets us re-import if we need a field we
 * dropped.
 *
 * Usage: node scripts/import-forge-content.mjs [path-to-archive-data-dir]
 */

import fs from 'node:fs';
import path from 'node:path';

const ARCHIVE =
  process.argv[2] ||
  '/Users/cambaughn/Code/_archive/forge-language/reforge/data';
const EXTRA_AUDIO = process.argv[3] || null; // dir of mp3s pulled from Firebase

const CONTENT = path.join(ARCHIVE, 'content');
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DATA = path.join(ROOT, 'src/content/forge');
const OUT_AUDIO = path.join(ROOT, 'public/forge/audio');

const COURSE_ID = 'en-es-fundamentals';

const read = (kind, id) => {
  const file = path.join(CONTENT, kind, `${id}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
};

// --- walk the course graph -------------------------------------------------

const course = read('courses', COURSE_ID);
if (!course) throw new Error(`no course record for ${COURSE_ID}`);

const units = [];
const lessons = {};
const sentenceIds = [];
const tipIds = new Set();

for (const unitId of course.units) {
  const unit = read('units', unitId);
  if (!unit) continue;

  const sections = [];
  for (const sectionId of unit.sections ?? []) {
    const section = read('sections', sectionId);
    if (!section) continue;

    const lessonIds = [];
    for (const lessonId of section.lessons ?? []) {
      const lesson = read('lessons', lessonId);
      if (!lesson) continue;

      lessonIds.push(lessonId);
      if (lesson.type === 'reading') {
        lessons[lessonId] = {
          id: lessonId,
          type: 'reading',
          title: lesson.title,
          // The app used to split on \n---\n to paginate. We render one page,
          // so the separators become plain horizontal rules.
          text: lesson.text ?? '',
        };
      } else {
        const questions = lesson.questions ?? [];
        sentenceIds.push(...questions);
        lessons[lessonId] = {
          id: lessonId,
          type: 'drill',
          title: lesson.title,
          sentences: questions,
        };
      }
    }

    if (lessonIds.length) {
      sections.push({ id: sectionId, title: section.title, lessons: lessonIds });
    }
  }

  // Five units are titles with no sections in the source data. They were
  // never built, so they don't belong in the course.
  if (sections.length) {
    units.push({
      id: unitId,
      title: unit.title,
      description: unit.description || '',
      sections,
    });
  }
}

// --- sentences -------------------------------------------------------------

const audioNames = {
  sentence: new Set(fs.readdirSync(path.join(ARCHIVE, 'media/sentence_audio'))),
  question: new Set(fs.readdirSync(path.join(ARCHIVE, 'media/question_audio'))),
  extra: new Set(EXTRA_AUDIO && fs.existsSync(EXTRA_AUDIO) ? fs.readdirSync(EXTRA_AUDIO) : []),
};

// Returns the source file for a sentence's audio, or null. The export split
// audio across two buckets, and question_audio drops the language prefix.
const findAudio = (id) => {
  const stripped = id.startsWith('es-') ? `${id.slice(3)}.mp3` : `${id}.mp3`;
  if (audioNames.sentence.has(`${id}.mp3`))
    return path.join(ARCHIVE, 'media/sentence_audio', `${id}.mp3`);
  if (audioNames.question.has(stripped))
    return path.join(ARCHIVE, 'media/question_audio', stripped);
  if (audioNames.question.has(`${id}.mp3`))
    return path.join(ARCHIVE, 'media/question_audio', `${id}.mp3`);
  if (audioNames.extra.has(`${id}.mp3`)) return path.join(EXTRA_AUDIO, `${id}.mp3`);
  return null;
};

fs.mkdirSync(OUT_AUDIO, { recursive: true });

const sentences = {};
let withAudio = 0;
let copied = 0;

for (const id of [...new Set(sentenceIds)]) {
  const raw = read('sentences', id);
  if (!raw) continue;

  const source = findAudio(id);
  if (source) {
    const dest = path.join(OUT_AUDIO, `${id}.mp3`);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(source, dest);
      copied++;
    }
    withAudio++;
  }

  for (const tip of raw.tips ?? []) tipIds.add(tip);

  sentences[id] = {
    id,
    es: raw.to_language_sentence,
    en: raw.from_language_sentence,
    esAccepted: raw.to_language_alternates ?? [],
    enAccepted: raw.from_language_alternates ?? [],
    esDistractors: raw.to_language_distractors ?? [],
    enDistractors: raw.from_language_distractors ?? [],
    tips: raw.tips ?? [],
    hasAudio: Boolean(source),
  };
}

// --- tips ------------------------------------------------------------------

const tips = {};
for (const id of [...tipIds].sort()) {
  const raw = read('tips', id);
  if (raw) tips[id] = { id, title: raw.title, text: raw.text };
}

// --- write -----------------------------------------------------------------

const write = (name, data) => {
  fs.mkdirSync(OUT_DATA, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DATA, name),
    `${JSON.stringify(data, null, 2)}\n`
  );
};

write('course.json', {
  id: COURSE_ID,
  title: course.title,
  description: course.description,
  units,
});
write('lessons.json', lessons);
write('sentences.json', sentences);
write('tips.json', tips);

const counts = Object.values(lessons).reduce(
  (acc, lesson) => {
    acc[lesson.type]++;
    return acc;
  },
  { reading: 0, drill: 0 }
);

console.log(`units        ${units.length}`);
console.log(`sections     ${units.reduce((n, u) => n + u.sections.length, 0)}`);
console.log(`lessons      ${Object.keys(lessons).length} (${counts.reading} reading, ${counts.drill} drill)`);
console.log(`sentences    ${Object.keys(sentences).length}`);
console.log(`  w/ audio   ${withAudio}`);
console.log(`  copied     ${copied} new mp3s`);
console.log(`tips         ${Object.keys(tips).length}`);
