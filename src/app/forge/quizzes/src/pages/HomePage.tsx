import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Container, Button, IconButton, Chip, ListItemIcon, ListItemText, List, ListItem, ListItemButton, CircularProgress } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCompletedQuizzes } from '../hooks/useCompletedQuizzes';

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

export const HomePage: React.FC = () => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isQuizCompleted } = useCompletedQuizzes();

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!appData) {
    return null;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      pt: 4,
      pb: 8,
    }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          Spanish Quizzes
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Practice your Spanish with these interactive quizzes. Each quiz is based on a lesson from the course.
        </Typography>

        {appData.units.map((unit) => (
          <Box key={unit.id} sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {unit.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {unit.description}
            </Typography>

            {unit.sections.map((section) => (
              <Box key={section.id} sx={{ mb: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {section.title}
                </Typography>

                <List>
                  {section.lessons
                    .filter(lesson => lesson.type === 'drill')
                    .map((lesson) => (
                      <ListItem key={lesson.id} disablePadding>
                        <ListItemButton
                          component={Link}
                          to={`/quiz/${lesson.id}`}
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: 'background.paper',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon>
                            <Typography variant="h5">📝</Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={lesson.title}
                            secondary={`${lesson.quiz?.questions.length || 0} questions`}
                          />
                          {isQuizCompleted(lesson.id) && (
                            <CheckCircleIcon color="success" />
                          )}
                          <IconButton edge="end" size="small">
                            <ArrowForwardIcon />
                          </IconButton>
                        </ListItemButton>
                      </ListItem>
                    ))}
                </List>
              </Box>
            ))}
          </Box>
        ))}
      </Container>
    </Box>
  );
}; 