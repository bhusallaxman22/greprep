import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Paper,
  Alert,
  FormControlLabel,
  Switch,
  Slider,
  Divider,
} from "@mui/material";
import { Speed, TrendingUp, Timer as TimerIcon } from "@mui/icons-material";
import {
  TEST_TYPES,
  SECTIONS,
  DIFFICULTIES,
  QUESTION_COUNTS,
} from "../constants/testConfig";
import SelectableCard from "./molecules/SelectableCard";
import DifficultySelect from "./molecules/DifficultySelect";
import QuestionCountSelect from "./molecules/QuestionCountSelect";
import SummaryChips from "./molecules/SummaryChips";
import LoadingButton from "./atoms/LoadingButton";
import RateLimitAlert from "./atoms/RateLimitAlert";
import useLoadingStates from "../hooks/useLoadingStates";
import APP_STATES from "../constants/appStates";

function TestSelection({ onStartTest, onBack, currentAppState }) {
  const [testType, setTestType] = useState("");
  const [section, setSection] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [enableQuestionTimer, setEnableQuestionTimer] = useState(false);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(120); // 2 minutes default
  const [enableExamTimer, setEnableExamTimer] = useState(false);
  const [examTimeLimit, setExamTimeLimit] = useState(1800); // 30 minutes default

  // Loading states hook
  const { loadingStates, withLoading } = useLoadingStates();

  // Track if we're in the process of starting a test
  const [isStartingTest, setIsStartingTest] = useState(false);

  // Monitor app state changes to properly handle loading state
  useEffect(() => {
    if (isStartingTest && currentAppState === APP_STATES.TEST_IN_PROGRESS) {
      setIsStartingTest(false);
    }
  }, [currentAppState, isStartingTest]);

  const testTypes = TEST_TYPES;

  const sections = SECTIONS;

  const difficulties = DIFFICULTIES;

  const questionCounts = QUESTION_COUNTS;

  const handleStartTest = withLoading("examStart", async () => {
    if (!testType || !section) {
      return;
    }

    setIsStartingTest(true);

    const testConfig = {
      testType,
      section,
      difficulty,
      questionCount,
      questionTimeLimit: enableQuestionTimer ? questionTimeLimit : 0,
      examTimeLimit: enableExamTimer ? examTimeLimit : 0,
    };

    try {
      // Simulate exam initialization (loading questions, setting up environment, etc.)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await onStartTest(testConfig);
    } catch (error) {
      console.error("Failed to start test:", error);
      setIsStartingTest(false);
    }
  });

  const isValid = testType && section;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 300 }}
        >
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
            <Typography
              variant="h5"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              Test Type
            </Typography>
            <Grid container spacing={2}>
              {testTypes.map((type) => (
                <Grid item xs={12} sm={6} key={type.value}>
                  <SelectableCard
                    selected={testType === type.value}
                    onClick={() => {
                      setTestType(type.value);
                      setSection(""); // Reset section when test type changes
                    }}
                    title={type.label}
                    description={type.description}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Section Selection */}
          {testType && (
            <Grid item xs={12}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                Section
              </Typography>
              <Grid container spacing={2}>
                {sections[testType]?.map((sec) => (
                  <Grid item xs={12} sm={6} md={4} key={sec.value}>
                    <SelectableCard
                      selected={section === sec.value}
                      onClick={() => setSection(sec.value)}
                      title={sec.label}
                      icon={sec.icon}
                      center
                    />
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
                  <DifficultySelect
                    value={difficulty}
                    onChange={setDifficulty}
                    options={difficulties}
                    startAdornment={<Speed sx={{ mr: 1 }} />}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <QuestionCountSelect
                    value={questionCount}
                    onChange={setQuestionCount}
                    counts={questionCounts}
                    startAdornment={<TrendingUp sx={{ mr: 1 }} />}
                  />
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Timer Configuration */}
          {section && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TimerIcon />
                Timer Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure time limits for your practice session
              </Typography>

              <Grid container spacing={3}>
                {/* Question Timer */}
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enableQuestionTimer}
                          onChange={(e) =>
                            setEnableQuestionTimer(e.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label="Question Timer"
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Limit time per question
                    </Typography>

                    {enableQuestionTimer && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Time per question:{" "}
                          {Math.floor(questionTimeLimit / 60)}:
                          {(questionTimeLimit % 60).toString().padStart(2, "0")}{" "}
                          minutes
                        </Typography>
                        <Slider
                          value={questionTimeLimit}
                          onChange={(_, value) => setQuestionTimeLimit(value)}
                          min={30}
                          max={600}
                          step={30}
                          marks={[
                            { value: 60, label: "1m" },
                            { value: 120, label: "2m" },
                            { value: 300, label: "5m" },
                            { value: 600, label: "10m" },
                          ]}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) =>
                            `${Math.floor(value / 60)}:${(value % 60)
                              .toString()
                              .padStart(2, "0")}`
                          }
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>

                {/* Exam Timer */}
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enableExamTimer}
                          onChange={(e) => setEnableExamTimer(e.target.checked)}
                          color="secondary"
                        />
                      }
                      label="Exam Timer"
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Limit total exam time
                    </Typography>

                    {enableExamTimer && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Total time: {Math.floor(examTimeLimit / 60)} minutes
                        </Typography>
                        <Slider
                          value={examTimeLimit}
                          onChange={(_, value) => setExamTimeLimit(value)}
                          min={300}
                          max={7200}
                          step={300}
                          marks={[
                            { value: 600, label: "10m" },
                            { value: 1800, label: "30m" },
                            { value: 3600, label: "1h" },
                            { value: 7200, label: "2h" },
                          ]}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) =>
                            `${Math.floor(value / 60)}m`
                          }
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Test Summary */}
      {isValid && (
        <Paper
          elevation={2}
          sx={{ p: 3, mb: 3, backgroundColor: "primary.50" }}
        >
          <Typography variant="h6" gutterBottom>
            Test Summary
          </Typography>
          <SummaryChips
            items={[
              {
                label: `${testType} Test`,
                color: "primary",
                variant: "filled",
              },
              {
                label: sections[testType]?.find((s) => s.value === section)
                  ?.label,
                variant: "outlined",
              },
              {
                label: `${difficulty} difficulty`,
                color: difficulties.find((d) => d.value === difficulty)?.color,
                variant: "outlined",
              },
              { label: `${questionCount} questions`, variant: "outlined" },
              ...(enableQuestionTimer
                ? [
                    {
                      label: `${Math.floor(questionTimeLimit / 60)}:${(
                        questionTimeLimit % 60
                      )
                        .toString()
                        .padStart(2, "0")} per question`,
                      color: "info",
                      variant: "outlined",
                    },
                  ]
                : []),
              ...(enableExamTimer
                ? [
                    {
                      label: `${Math.floor(examTimeLimit / 60)}min total`,
                      color: "warning",
                      variant: "outlined",
                    },
                  ]
                : []),
            ]}
          />
        </Paper>
      )}

      {!isValid && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please select a test type and section to continue.
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={onBack} size="large">
          Back to Dashboard
        </Button>

        <LoadingButton
          variant="contained"
          onClick={handleStartTest}
          disabled={!isValid}
          loading={loadingStates.examStart || isStartingTest}
          size="large"
          sx={{ px: 4 }}
        >
          Start Test
        </LoadingButton>
      </Box>
    </Container>
  );
}

TestSelection.propTypes = {
  onStartTest: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  currentAppState: PropTypes.string.isRequired,
};

export default TestSelection;
