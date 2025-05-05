export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  direction: 'spanish-to-english' | 'english-to-spanish';
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  totalQuestions: number;
  timeLimit?: number; // in minutes
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface QuizProgress {
  quizId: string;
  currentQuestionIndex: number;
  answers: {
    questionId: string;
    answer: string;
    isCorrect: boolean;
  }[];
  score: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  selectedAnswer: string;
  showFeedback: boolean;
  isCorrect: boolean;
  progress: QuizProgress | null;
  quiz: Quiz | null;
} 