import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

export const useCompletedQuizzes = () => {
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);

  // Load completed quizzes on mount
  useEffect(() => {
    const quizzes = storage.loadCompletedQuizzes();
    setCompletedQuizzes(quizzes);
  }, []);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = () => {
      const quizzes = storage.loadCompletedQuizzes();
      setCompletedQuizzes(quizzes);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const markQuizAsCompleted = (quizId: string) => {
    if (!completedQuizzes.includes(quizId)) {
      const newCompletedQuizzes = [...completedQuizzes, quizId];
      storage.saveCompletedQuizzes(newCompletedQuizzes);
      setCompletedQuizzes(newCompletedQuizzes);
    }
  };

  const isQuizCompleted = (quizId: string) => {
    return completedQuizzes.includes(quizId);
  };

  return {
    completedQuizzes,
    markQuizAsCompleted,
    isQuizCompleted,
  };
}; 