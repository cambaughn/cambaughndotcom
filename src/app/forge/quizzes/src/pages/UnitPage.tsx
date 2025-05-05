import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, ListItemButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCompletedQuizzes } from '../hooks/useCompletedQuizzes';

interface Unit {
  id: string;
  title: string;
  description: string;
  sections: string[];
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  questions: string[];
}

export const UnitPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isQuizCompleted } = useCompletedQuizzes();

  useEffect(() => {
    const fetchUnitAndLessons = async () => {
      try {
        // Fetch unit data
        const unitResponse = await fetch(`/data/content/units/${unitId}.json`);
        if (!unitResponse.ok) {
          throw new Error('Failed to fetch unit');
        }
        const unitData = await unitResponse.json();
        setUnit(unitData);

        // Fetch lessons for each section
        const lessonPromises = unitData.sections.map(async (sectionId: string) => {
          const lessonResponse = await fetch(`/data/content/lessons/${sectionId}.json`);
          if (!lessonResponse.ok) {
            throw new Error(`Failed to fetch lesson ${sectionId}`);
          }
          return lessonResponse.json();
        });

        const lessonData = await Promise.all(lessonPromises);
        setLessons(lessonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (unitId) {
      fetchUnitAndLessons();
    }
  }, [unitId]);

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

  if (!unit) {
    return (
      <Box p={3}>
        <Typography>Unit not found</Typography>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth="800px" mx="auto">
      <Box display="flex" alignItems="center" mb={4}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Box display="flex" alignItems="center">
            <ArrowBackIcon sx={{ mr: 1 }} />
            <Typography>Back to Quizzes</Typography>
          </Box>
        </Link>
      </Box>

      <List>
        {lessons.map((lesson) => (
          <ListItem key={lesson.id} disablePadding>
            <ListItemButton 
              component={Link} 
              to={`/quiz/${lesson.id}`}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">
                  {isQuizCompleted(lesson.id) ? '✅' : '📝'}
                </Typography>
                <ListItemText 
                  primary={lesson.title}
                />
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 