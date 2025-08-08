import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Chip,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Timer, NavigateNext, NavigateBefore, Flag } from '@mui/icons-material';

const QuestionDisplay = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswer, 
  onNext, 
  onPrevious, 
  onFinish,
  selectedAnswer,
  isLoading,
  questionsArray = [] // Add to show preloading status
}) => {
  const [currentAnswer, setCurrentAnswer] = useState(selectedAnswer || '');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    setCurrentAnswer(selectedAnswer || '');
  }, [selectedAnswer, question]);

  const handleAnswerChange = (event) => {
    const answer = parseInt(event.target.value);
    setCurrentAnswer(answer);
    onAnswer(answer, timeSpent);
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleFinish = () => {
    onFinish();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Generating question...</Typography>
      </Container>
    );
  }

  if (!question) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Failed to load question. Please try again.
        </Alert>
      </Container>
    );
  }

  const progress = (questionNumber / totalQuestions) * 100;
  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Progress Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Question {questionNumber} of {totalQuestions}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<Timer />} 
              label={formatTime(timeSpent)} 
              variant="outlined"
              color="primary"
            />
            <Chip 
              label={question.difficulty} 
              color={question.difficulty === 'easy' ? 'success' : 
                     question.difficulty === 'medium' ? 'warning' : 'error'}
              size="small"
            />
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ height: 8, borderRadius: 1 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}% Complete
          </Typography>
          {/* Show preloading status */}
          {questionsArray.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              Questions loaded: {questionsArray.filter(q => q !== undefined).length}/{totalQuestions}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Question Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Chip 
            label={`${question.testType} - ${question.section}`} 
            color="primary" 
            sx={{ mb: 2 }}
          />
          
          {/* Passage Display */}
          {question.passage && (
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                mb: 3, 
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Reading Passage
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  lineHeight: 1.8,
                  fontFamily: 'Georgia, serif',
                  textAlign: 'justify'
                }}
              >
                {question.passage}
              </Typography>
            </Paper>
          )}
          
          {/* Image Display */}
          {question.imageDescription && (
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                mb: 3, 
                backgroundColor: 'blue.50',
                border: '1px solid',
                borderColor: 'blue.200',
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Visual Reference
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'white',
                  borderRadius: 1,
                  border: '2px dashed',
                  borderColor: 'grey.300'
                }}
              >
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  📊 {question.imageDescription}
                </Typography>
              </Box>
            </Paper>
          )}
          
          <Typography variant="h5" component="h2" sx={{ lineHeight: 1.6, mb: 3 }}>
            {question.question}
          </Typography>
        </Box>

        {/* Answer Options */}
        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={currentAnswer}
            onChange={handleAnswerChange}
          >
            {question.options?.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={
                  <Typography variant="body1" sx={{ py: 1 }}>
                    <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                  </Typography>
                }
                sx={{
                  border: 1,
                  borderColor: currentAnswer === index ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  m: 0.5,
                  p: 1,
                  backgroundColor: currentAnswer === index ? 'primary.50' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBefore />}
          onClick={handlePrevious}
          disabled={questionNumber === 1}
        >
          Previous
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Flag />}
            color="warning"
            onClick={() => {
              // Mark for review functionality could be added here
              console.log('Question marked for review');
            }}
          >
            Mark for Review
          </Button>
        </Box>

        {isLastQuestion ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleFinish}
            size="large"
            sx={{ px: 4 }}
          >
            Finish Test
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<NavigateNext />}
            onClick={handleNext}
            disabled={currentAnswer === ''}
            sx={{
              backgroundColor: questionsArray[questionNumber] ? 'success.main' : 'primary.main',
              '&:hover': {
                backgroundColor: questionsArray[questionNumber] ? 'success.dark' : 'primary.dark',
              }
            }}
          >
            {questionsArray[questionNumber] ? 'Next (Ready)' : 'Next'}
          </Button>
        )}
      </Box>

      {/* Help Text */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Select an answer to continue. You can come back to review your answers before finishing.
        </Typography>
      </Box>
    </Container>
  );
};

export default QuestionDisplay;
