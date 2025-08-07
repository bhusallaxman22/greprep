import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Alert
} from '@mui/material';
import { Quiz, School, Speed, TrendingUp } from '@mui/icons-material';

const TestSelection = ({ onStartTest, onBack }) => {
  const [testType, setTestType] = useState('');
  const [section, setSection] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);

  const testTypes = [
    { value: 'GRE', label: 'GRE', description: 'Graduate Record Examination' },
    { value: 'GMAT', label: 'GMAT', description: 'Graduate Management Admission Test' }
  ];

  const sections = {
    GRE: [
      { value: 'verbal', label: 'Verbal Reasoning', icon: '📚' },
      { value: 'quantitative', label: 'Quantitative Reasoning', icon: '🔢' },
      { value: 'analytical-writing', label: 'Analytical Writing', icon: '✍️' }
    ],
    GMAT: [
      { value: 'verbal', label: 'Verbal', icon: '📚' },
      { value: 'quantitative', label: 'Quantitative', icon: '🔢' },
      { value: 'integrated-reasoning', label: 'Integrated Reasoning', icon: '🧩' },
      { value: 'analytical-writing', label: 'Analytical Writing Assessment', icon: '✍️' }
    ]
  };

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'success', description: 'Good for beginners' },
    { value: 'medium', label: 'Medium', color: 'warning', description: 'Standard difficulty' },
    { value: 'hard', label: 'Hard', color: 'error', description: 'Advanced level' }
  ];

  const questionCounts = [5, 10, 15, 20, 25];

  const handleStartTest = () => {
    if (!testType || !section) {
      return;
    }

    const testConfig = {
      testType,
      section,
      difficulty,
      questionCount
    };

    onStartTest(testConfig);
  };

  const isValid = testType && section;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 300 }}>
          Configure Your Test
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Choose your test type, section, and difficulty level
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={4}>
          {/* Test Type Selection */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <School sx={{ mr: 1 }} />
              Test Type
            </Typography>
            <Grid container spacing={2}>
              {testTypes.map((type) => (
                <Grid item xs={12} sm={6} key={type.value}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      border: testType === type.value ? 2 : 1,
                      borderColor: testType === type.value ? 'primary.main' : 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => {
                      setTestType(type.value);
                      setSection(''); // Reset section when test type changes
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5" color="primary" gutterBottom>
                        {type.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Section Selection */}
          {testType && (
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Quiz sx={{ mr: 1 }} />
                Section
              </Typography>
              <Grid container spacing={2}>
                {sections[testType]?.map((sec) => (
                  <Grid item xs={12} sm={6} md={4} key={sec.value}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        border: section === sec.value ? 2 : 1,
                        borderColor: section === sec.value ? 'primary.main' : 'divider',
                        '&:hover': { borderColor: 'primary.main' },
                        height: '100%'
                      }}
                      onClick={() => setSection(sec.value)}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ mb: 1 }}>
                          {sec.icon}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          {sec.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Difficulty and Question Count */}
          {section && (
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty Level</InputLabel>
                    <Select
                      value={difficulty}
                      label="Difficulty Level"
                      onChange={(e) => setDifficulty(e.target.value)}
                      startAdornment={<Speed sx={{ mr: 1 }} />}
                    >
                      {difficulties.map((diff) => (
                        <MenuItem key={diff.value} value={diff.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Chip 
                              label={diff.label} 
                              color={diff.color} 
                              size="small" 
                              sx={{ mr: 2 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {diff.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Number of Questions</InputLabel>
                    <Select
                      value={questionCount}
                      label="Number of Questions"
                      onChange={(e) => setQuestionCount(e.target.value)}
                      startAdornment={<TrendingUp sx={{ mr: 1 }} />}
                    >
                      {questionCounts.map((count) => (
                        <MenuItem key={count} value={count}>
                          {count} questions
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Test Summary */}
      {isValid && (
        <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: 'primary.50' }}>
          <Typography variant="h6" gutterBottom>
            Test Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Chip label={`${testType} Test`} color="primary" />
            </Grid>
            <Grid item>
              <Chip 
                label={sections[testType]?.find(s => s.value === section)?.label} 
                variant="outlined" 
              />
            </Grid>
            <Grid item>
              <Chip 
                label={`${difficulty} difficulty`} 
                color={difficulties.find(d => d.value === difficulty)?.color}
                variant="outlined"
              />
            </Grid>
            <Grid item>
              <Chip label={`${questionCount} questions`} variant="outlined" />
            </Grid>
          </Grid>
        </Paper>
      )}

      {!isValid && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please select a test type and section to continue.
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={onBack}
          size="large"
        >
          Back to Dashboard
        </Button>
        
        <Button
          variant="contained"
          onClick={handleStartTest}
          disabled={!isValid}
          size="large"
          sx={{ px: 4 }}
        >
          Start Test
        </Button>
      </Box>
    </Container>
  );
};

export default TestSelection;
