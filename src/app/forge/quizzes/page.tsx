'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface AppData {
  units: {
    id: string;
    title: string;
    description: string;
    sections: {
      id: string;
      title: string;
      lessons: {
        id: string;
        title: string;
        type: 'drill' | 'reading';
        text?: string;
        quiz?: {
          id: string;
          title: string;
          description: string;
          questions: {
            id: string;
            text: string;
            options: string[];
            correctAnswer: string;
            explanation?: string;
            direction: 'spanish-to-english' | 'english-to-spanish';
          }[];
          totalQuestions: number;
        };
      }[];
    }[];
  }[];
}

export default function QuizzesPage() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/quiz-data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch app data');
        }
        const data = await response.json();
        setAppData(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading quizzes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!appData) {
    return null;
  }

  // Filter units and sections to only show those with active quizzes
  const activeUnits = appData.units
    .map(unit => ({
      ...unit,
      sections: unit.sections
        .map(section => ({
          ...section,
          lessons: section.lessons.filter(lesson => lesson.type === 'drill' && lesson.quiz)
        }))
        .filter(section => section.lessons.length > 0)
    }))
    .filter(unit => unit.sections.length > 0);

  if (activeUnits.length === 0) {
    return (
      <div className={styles.page}>
        <p className={styles.description}>
          No active quizzes available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Spanish Quizzes</h1>
      <p className={styles.description}>
        Test your Spanish knowledge with these interactive quizzes.
      </p>
      {activeUnits.map((unit) => (
        <div key={unit.id} className={styles.unit}>
          <h2>{unit.title}</h2>
          <p>{unit.description}</p>

          {unit.sections.map((section) => (
            <div key={section.id} className={styles.section}>
              <h3>{section.title}</h3>

              <div className={styles.lessons}>
                {section.lessons.map((lesson) => (
                  <Link 
                    key={lesson.id} 
                    href={`/forge/quizzes/${lesson.id}`}
                    className={styles.lesson}
                  >
                    <div className={styles.lessonContent}>
                      <span className={styles.lessonIcon}>📝</span>
                      <div className={styles.lessonInfo}>
                        <h4>{lesson.title}</h4>
                        <p>{lesson.quiz?.questions.length || 0} questions</p>
                      </div>
                    </div>
                    <span className={styles.arrow}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 