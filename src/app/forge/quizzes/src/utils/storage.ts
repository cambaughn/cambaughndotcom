import { QuizProgress } from '../data/types';

const STORAGE_KEY = 'quiz_progress';
const COMPLETED_QUIZZES_KEY = 'completed_quizzes';

// Check if we're in an iframe
const isInIframe = window.parent !== window;

export const storage = {
  // Save quiz progress
  saveProgress(progress: QuizProgress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    
    // If in iframe, notify parent
    if (isInIframe) {
      window.parent.postMessage({
        type: 'SAVE_PROGRESS',
        data: progress
      }, '*');
    }
  },

  // Load quiz progress
  loadProgress(): QuizProgress | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Save completed quizzes
  saveCompletedQuizzes(quizzes: string[]) {
    localStorage.setItem(COMPLETED_QUIZZES_KEY, JSON.stringify(quizzes));
    
    // If in iframe, notify parent
    if (isInIframe) {
      window.parent.postMessage({
        type: 'SAVE_COMPLETED_QUIZZES',
        data: quizzes
      }, '*');
    }
  },

  // Load completed quizzes
  loadCompletedQuizzes(): string[] {
    const stored = localStorage.getItem(COMPLETED_QUIZZES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Listen for messages from parent
  setupMessageListener() {
    if (!isInIframe) return;

    window.addEventListener('message', (event) => {
      // Verify the message is from a trusted source
      // if (event.origin !== 'https://cambaughn.com') return;

      const { type, data } = event.data;

      switch (type) {
        case 'LOAD_PROGRESS':
          const progress = this.loadProgress();
          window.parent.postMessage({
            type: 'PROGRESS_LOADED',
            data: progress
          }, '*');
          break;
        case 'LOAD_COMPLETED_QUIZZES':
          const quizzes = this.loadCompletedQuizzes();
          window.parent.postMessage({
            type: 'COMPLETED_QUIZZES_LOADED',
            data: quizzes
          }, '*');
          break;
      }
    });
  }
}; 