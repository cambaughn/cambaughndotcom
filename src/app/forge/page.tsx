'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ForgePage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Forge</h1>
        <p className={styles.description}>
          Interactive tools and resources for learning Spanish.
        </p>

        <div className={styles.links}>
          <Link href="/forge/quizzes" className={styles.link}>
            Spanish Quizzes
          </Link>
        </div>
      </main>
    </div>
  );
} 