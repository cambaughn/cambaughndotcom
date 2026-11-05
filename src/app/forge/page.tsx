import type { Metadata } from 'next';

import { getCourse } from '@/lib/forge/content';
import CourseOutline from './CourseOutline';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Forge — Spanish Course',
  description:
    'The full Spanish course from Forge: reading lessons and drills, free and with no sign-up.',
};

export default function ForgePage() {
  const course = getCourse();

  return (
    <div className="content">
      <section className={styles.intro}>
        <h1>Forge</h1>
        <p>
          <a
            href="https://youtu.be/D1EggOVIm_s"
            target="_blank"
            rel="noopener noreferrer"
          >
            Forge
          </a>{' '}
          was a startup I worked on from 2018&ndash;2020, meant to be a
          &ldquo;language school in your pocket&rdquo;&mdash;a more effective and
          comprehensive language learning tool than what was out there at the
          time.
        </p>
        <p>
          I never quite reached the full vision for the product, as I had to wind
          down the company during the pandemic, but I did end up with a full
          Spanish course made up of reading lessons and drills to practice what
          each one teaches.
        </p>
        <p>
          The whole course is here for free. Start anywhere, work in any order,
          and your progress is saved in this browser&mdash;no account needed. If
          you&rsquo;re looking to learn Spanish, I hope you find it useful.
        </p>
      </section>

      <CourseOutline course={course} />
    </div>
  );
}
