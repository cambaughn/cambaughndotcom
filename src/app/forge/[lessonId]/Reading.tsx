'use client';

import { useEffect } from 'react';

import { markComplete } from '@/lib/forge/progress';
import type { ReadingLesson } from '@/lib/forge/types';

/**
 * Reading lessons were paginated in the app, split on the `---` breaks in
 * their text. Here the whole lesson is one page and those breaks are rules,
 * which is how long-form reading wants to work in a browser.
 *
 * Opening a reading lesson is the whole of doing it, so it ticks itself off.
 * The checkbox in the footer still lets you undo that.
 */
export default function Reading({ lesson }: { lesson: ReadingLesson }) {
  useEffect(() => {
    markComplete(lesson.id);
  }, [lesson.id]);

  return (
    <div className="post-content" dangerouslySetInnerHTML={{ __html: lesson.html }} />
  );
}
