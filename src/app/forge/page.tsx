'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ForgePage() {
  return (
    <div className={`content`}>
      <main>
        <h2>Forge</h2>
        <section>
          <p>
            <a href="https://youtu.be/D1EggOVIm_s" target="_blank" rel="noopener noreferrer">Forge</a> was a startup that I worked on from 2018-2020, mean to be a "language school in your pocket"—a more effective and comprehensive language learning tool than what was out there at the time.
          </p>
          <p>
            I never quite reached the full vision for the product as I had to wind down the company during the pandemic, but I did end up with a full Spanish language course made up of interactive lessons, vocabulary drills, and quizzes.
          </p>
          <p>
            I'm making the core content of the course available here for free. If you're looking to learn Spanish, I hope you find it useful!
          </p>
        </section>

        <div>
          <Link href="/forge/quizzes" className={styles.link}>
            Spanish Quizzes
          </Link>
        </div>
      </main>
    </div>
  );
}