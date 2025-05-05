'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  direction: 'spanish-to-english' | 'english-to-spanish';
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  totalQuestions: number;
}

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
        quiz?: Quiz;
      }[];
    }[];
  }[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const [appData, setAppData] = useState<AppData | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/quiz-data.json');
        if (!response.ok) {
          throw new Error('Failed to fetch quiz data');
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

  useEffect(() => {
    if (appData && quizId) {
      // Find the quiz in the app data
      const foundQuiz = appData.units
        .flatMap(unit => unit.sections)
        .flatMap(section => section.lessons)
        .find(lesson => lesson.id === quizId && lesson.type === 'drill')?.quiz;

      if (foundQuiz) {
        setQuiz(foundQuiz);
      } else {
        setError('Quiz not found');
      }
    }
  }, [appData, quizId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <Link href="/forge/quizzes" className={styles.backLink}>
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>Quiz not found</p>
          <Link href="/forge/quizzes" className={styles.backLink}>
            Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // Show completion screen if we've answered all questions
  if (currentQuestionIndex >= quiz.questions.length) {
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className={styles.page}>
        <div className={styles.completionScreen}>
          <h2>Quiz Complete!</h2>
          <p className={styles.score}>
            Your score: {correctAnswers} out of {totalQuestions} ({percentage}%)
          </p>
          <div className={styles.buttons}>
            <button 
              onClick={() => {
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setShowNextButton(false);
                setCorrectAnswers(0);
              }}
              className={styles.button}
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/forge/quizzes')}
              className={styles.button}
            >
              All Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    // Once an answer is selected, don't allow changing it
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    // Show next button regardless of whether the answer was correct or not
    setShowNextButton(true);
  };

  const handleNextQuestion = () => {
    // Move to next question
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowNextButton(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/forge/quizzes" className={styles.backLink}>
          ← Back to Quizzes
        </Link>
      </div>

      <div className={styles.quiz}>
        <div className={styles.progress}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>

        <div className={styles.question}>
          <h3>{currentQuestion.text}</h3>
          
          <div className={styles.options}>
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                className={`${styles.option} ${
                  selectedAnswer === option
                    ? option === currentQuestion.correctAnswer
                      ? styles.correct
                      : styles.incorrect
                    : ''
                }`}
                disabled={selectedAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedAnswer && (
            <div className={styles.feedback}>
              {isCorrect ? (
                <p className={styles.correct}>¡Correcto! ✨</p>
              ) : (
                <div className={styles.incorrect}>
                  <p>Not quite. The correct answer is: {currentQuestion.correctAnswer}</p>
                  {currentQuestion.explanation && (
                    <p className={styles.explanation}>{currentQuestion.explanation}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {showNextButton && (
            <button
              onClick={handleNextQuestion}
              className={`${styles.button} ${styles.nextButton}`}
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 