import { useState, useCallback, useEffect } from 'react';
import { Quiz, QuizProgress, QuizState } from '../data/types';
import { storage } from '../utils/storage';

// Initialize storage message listener
storage.setupMessageListener();

export const useQuiz = () => {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswer: '',
    showFeedback: false,
    isCorrect: false,
    progress: null,
  });

  // Load progress on mount
  useEffect(() => {
    const savedProgress = storage.loadProgress();
    if (savedProgress) {
      setState((prev: QuizState) => ({
        ...prev,
        progress: savedProgress,
        currentQuestionIndex: savedProgress.currentQuestionIndex,
      }));
    }
  }, []);

  const startQuiz = useCallback((quiz: Quiz) => {
    const newProgress: QuizProgress = {
      quizId: quiz.id,
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
      startedAt: new Date().toISOString(),
      completed: false,
      completedAt: undefined,
    };

    setState((prev: QuizState) => ({
      ...prev,
      progress: newProgress,
      currentQuestionIndex: 0,
      selectedAnswer: '',
      showFeedback: false,
      isCorrect: false,
    }));

    storage.saveProgress(newProgress);
  }, []);

  const answerQuestion = useCallback((questionId: string, selectedAnswer: string, isCorrect: boolean) => {
    setState((prev: QuizState) => {
      if (!prev.progress) return prev;

      const newProgress = {
        ...prev.progress,
        answers: [
          ...prev.progress.answers,
          { questionId, selectedAnswer, isCorrect }
        ],
      };

      storage.saveProgress(newProgress);

      return {
        ...prev,
        progress: newProgress,
        selectedAnswer,
        showFeedback: true,
        isCorrect,
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev: QuizState) => {
      if (!prev.progress) return prev;

      // Check if we're on the last question
      const isLastQuestion = prev.currentQuestionIndex === prev.progress.answers.length;
      
      const newProgress = {
        ...prev.progress,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        completed: isLastQuestion,
        completedAt: isLastQuestion ? new Date().toISOString() : undefined,
      };

      storage.saveProgress(newProgress);

      return {
        ...prev,
        progress: newProgress,
        currentQuestionIndex: newProgress.currentQuestionIndex,
        selectedAnswer: '',
        showFeedback: false,
      };
    });
  }, []);

  const resetQuiz = useCallback(() => {
    setState((prev: QuizState) => ({
      ...prev,
      currentQuestionIndex: 0,
      selectedAnswer: '',
      showFeedback: false,
      progress: null,
    }));
  }, []);

  return {
    state,
    startQuiz,
    answerQuestion,
    nextQuestion,
    resetQuiz,
  };
}; 