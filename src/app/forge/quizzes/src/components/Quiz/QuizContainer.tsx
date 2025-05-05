import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useQuiz } from '../../hooks/useQuiz';
import { Quiz } from '../../data/types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useCompletedQuizzes } from '../../hooks/useCompletedQuizzes';

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
        type: 'drill' | 'lesson';
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
  version: string;
  lastUpdated: string;
}

export const QuizContainer: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const { markQuizAsCompleted } = useCompletedQuizzes();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/app-data.json');
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
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center"
        p={3}
        maxWidth="800px"
        mx="auto"
      >
        <Typography color="error" variant="h6" gutterBottom>
          Error: {error}
        </Typography>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Quizzes
        </Button>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center"
        p={3}
        maxWidth="800px"
        mx="auto"
      >
        <Typography variant="h6" gutterBottom>
          Quiz not found
        </Typography>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Quizzes
        </Button>
      </Box>
    );
  }

  // Show completion screen if we've answered all questions
  if (currentQuestionIndex >= quiz.questions.length) {
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100vh',
        gap: 4,
        p: 3
      }}>
        <Typography variant="h4" component="h1" sx={{ textAlign: 'center' }}>
          Quiz Complete!
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          Your score: {correctAnswers} out of {totalQuestions} ({percentage}%)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => {
              setCurrentQuestionIndex(0);
              setSelectedAnswer(null);
              setShowNextButton(false);
              setCorrectAnswers(0);
              navigate(`/quiz/${quiz.id}`);
            }}
          >
            Try Again
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
          >
            All Quizzes
          </Button>
        </Box>
      </Box>
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
    
    // If this was the last question, mark the quiz as completed
    if (currentQuestionIndex === quiz.questions.length - 1) {
      markQuizAsCompleted(quiz.id);
    }
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      minHeight="100vh"
      width="100%"
      bgcolor="background.default"
    >
      {/* Fixed Header */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: 1,
          py: 2,
          px: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: '800px',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBackIcon />}
            size="small"
          >
            Back to Quizzes
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
            {quiz.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Question {currentQuestionIndex + 1} of {quiz.totalQuestions}
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box 
        sx={{ 
          maxWidth: '800px',
          width: '100%',
          mx: 'auto',
          mt: 12,
          px: 3,
          pb: 4,
        }}
      >
        <Box 
          sx={{ 
            mb: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 3,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {/* Language indicator */}
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ mb: 1 }}
          >
            {currentQuestion.direction === 'spanish-to-english' 
              ? 'Translate to English:' 
              : 'Translate to Spanish:'}
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ mt: 1, mb: 3 }}>
            {currentQuestion.text}
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentQuestion.correctAnswer;
              
              // Determine button color based on selection state
              let buttonColor = 'divider';
              let buttonBgColor = 'transparent';
              
              if (selectedAnswer !== null) {
                if (isSelected) {
                  buttonColor = isCorrect ? 'success.main' : 'error.main';
                  buttonBgColor = isCorrect ? 'success.light' : 'error.light';
                } else if (isCorrectAnswer) {
                  // Show correct answer in green if wrong answer was selected
                  buttonColor = 'success.main';
                  buttonBgColor = 'success.light';
                }
              }
              
              return (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  sx={{
                    justifyContent: 'flex-start',
                    p: 2,
                    textAlign: 'left',
                    borderColor: buttonColor,
                    bgcolor: buttonBgColor,
                    color: selectedAnswer !== null && (isSelected || isCorrectAnswer) ? 'white' : 'inherit',
                    '&:hover': {
                      borderColor: selectedAnswer === null ? 'primary.main' : buttonColor,
                      bgcolor: selectedAnswer === null ? 'action.hover' : buttonBgColor,
                      color: selectedAnswer !== null && (isSelected || isCorrectAnswer) ? 'white' : 'inherit',
                    },
                    position: 'relative',
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                  {selectedAnswer !== null && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        right: 16,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {isSelected ? (
                        isCorrect ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )
                      ) : isCorrectAnswer ? (
                        <CheckCircleIcon color="success" />
                      ) : null}
                    </Box>
                  )}
                </Button>
              );
            })}
          </Box>
          
          {/* Feedback message */}
          {selectedAnswer !== null && (
            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                borderRadius: 1,
                bgcolor: isCorrect ? 'success.light' : 'error.light',
                color: isCorrect ? 'success.dark' : 'error.dark',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {isCorrect ? (
                <>
                  <CheckCircleIcon color="success" />
                  <Typography>¡Correcto!</Typography>
                </>
              ) : (
                <>
                  <CancelIcon color="error" />
                  <Typography>Incorrecto. The correct answer is highlighted in green.</Typography>
                </>
              )}
            </Box>
          )}
          
          {/* Next button - show after any answer is selected */}
          {showNextButton && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextQuestion}
                size="large"
                sx={{
                  borderRadius: 1,
                  px: 3,
                }}
              >
                {currentQuestionIndex === quiz.totalQuestions - 1 ? 'Finish' : 'Next Question'}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}; 