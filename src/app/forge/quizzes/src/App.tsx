import { ThemeProvider, createTheme } from '@mui/material';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { UnitPage } from './pages/UnitPage';
import { QuizContainer } from './components/Quiz/QuizContainer';
import { Box } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          minWidth: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          minWidth: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/unit/:unitId" element={<UnitPage />} />
            <Route path="/quiz/:quizId" element={<QuizContainer />} />
            {/* Catch any other routes and redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
