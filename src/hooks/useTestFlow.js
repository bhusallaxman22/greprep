import { useCallback, useMemo, useState } from 'react';
import firebaseService from '../services/firebase';
import openRouterService from '../services/openrouter';
import { resetSessionCounters } from '../services/rateLimiter';

export default function useTestFlow(user) {
    const [testConfig, setTestConfig] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [testResult, setTestResult] = useState(null);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
    const [isStartingTest, setIsStartingTest] = useState(false);
    const [preloadingQuestions, setPreloadingQuestions] = useState(new Set());
    const [renderedQuestions, setRenderedQuestions] = useState(new Set());
    const [error, setError] = useState('');
    const [sessionId] = useState(() => Date.now().toString()); // Session tracking
    const [usedTopics, setUsedTopics] = useState([]); // Track used topics to avoid repetition

    const showError = useCallback((message) => setError(message), []);
    const clearError = useCallback(() => setError(''), []);

    // Helper function to check for undefined values in nested objects
    const containsUndefined = useCallback((obj) => {
        if (obj === undefined) return true;
        if (obj === null || typeof obj !== 'object') return false;

        if (Array.isArray(obj)) {
            return obj.some(item => containsUndefined(item));
        }

        return Object.values(obj).some(value => containsUndefined(value));
    }, []);

    const generateQuestion = useCallback(async (questionIndex, isPreload = false, cfg = null) => {
        const currentConfig = cfg || testConfig;

        // Prevent regenerating already rendered questions
        if (!isPreload && renderedQuestions.has(questionIndex)) {
            return questions[questionIndex];
        }

        if (isPreload && preloadingQuestions.has(questionIndex)) {
            return;
        }
        if (isPreload) {
            setPreloadingQuestions((prev) => new Set([...prev, questionIndex]));
        }

        if (!isPreload) setIsLoadingQuestion(true);

        try {
            if (!currentConfig || !currentConfig.testType || !currentConfig.section) {
                throw new Error('Test configuration is not available');
            }

            // Create question context for uniqueness
            const questionContext = {
                questionIndex,
                previousTopics: usedTopics,
                sessionId,
            };

            const question = await openRouterService.generateQuestion(
                currentConfig.testType,
                currentConfig.section,
                currentConfig.difficulty,
                0, // retryCount
                questionContext
            );

            // Track the topic for future uniqueness
            if (question && question.topic) {
                setUsedTopics(prev => [...prev, question.topic]);
            }

            setQuestions((prev) => {
                const next = [...prev];
                next[questionIndex] = question;
                return next;
            });

            // Mark question as rendered if it's the current question
            if (!isPreload) {
                setRenderedQuestions((prev) => new Set([...prev, questionIndex]));
            }

            if (!isPreload && questionIndex < currentConfig.questionCount - 1) {
                setTimeout(() => {
                    const nextIndex = questionIndex + 1;
                    if (!preloadingQuestions.has(nextIndex)) {
                        generateQuestion(nextIndex, true, currentConfig);
                    }
                }, 500);
                setTimeout(() => {
                    const nextNextIndex = questionIndex + 2;
                    if (nextNextIndex < currentConfig.questionCount && !preloadingQuestions.has(nextNextIndex)) {
                        generateQuestion(nextNextIndex, true, currentConfig);
                    }
                }, 1000);
            }

            return question;
        } catch (err) {
            console.error(`Failed to generate question ${questionIndex + 1}:`, err);
            if (!isPreload) {
                showError(`Failed to generate question ${questionIndex + 1}. ${err.message || 'Please try again.'}`);
                throw err;
            }
            return null;
        } finally {
            if (isPreload) {
                setPreloadingQuestions((prev) => {
                    const s = new Set(prev);
                    s.delete(questionIndex);
                    return s;
                });
            }
            if (!isPreload) setIsLoadingQuestion(false);
        }
    }, [preloadingQuestions, showError, testConfig, renderedQuestions, questions, usedTopics, sessionId]);

    const startTest = useCallback(async (config) => {
        // Reset session counters for new test
        resetSessionCounters();

        setIsStartingTest(true);
        setTestConfig(config);
        setQuestions([]);
        setAnswers(new Array(config.questionCount).fill(null));
        setCurrentQuestionIndex(0);
        setPreloadingQuestions(new Set());
        setRenderedQuestions(new Set());
        setTestResult(null);
        setUsedTopics([]); // Reset used topics for new test

        try {
            await generateQuestion(0, false, config);
        } finally {
            setIsStartingTest(false);
        }
    }, [generateQuestion]);

    const handleAnswer = useCallback((answerIndex, timeSpent) => {
        setAnswers((prev) => {
            const next = [...prev];
            next[currentQuestionIndex] = { answerIndex, timeSpent };
            return next;
        });
    }, [currentQuestionIndex]);

    const nextQuestion = useCallback(async () => {
        try {
            const nextIndex = currentQuestionIndex + 1;
            if (!testConfig || nextIndex >= testConfig.questionCount) return;

            setIsLoadingQuestion(true);

            if (!questions[nextIndex]) {
                const generatedQuestion = await generateQuestion(nextIndex, false);
                if (!generatedQuestion) throw new Error('Failed to generate question');
            }

            setCurrentQuestionIndex(nextIndex);

            setTimeout(() => {
                const idx = nextIndex + 1;
                if (testConfig && idx < testConfig.questionCount && !preloadingQuestions.has(idx)) {
                    generateQuestion(idx, true, testConfig);
                }
            }, 100);

            setTimeout(() => {
                const idx2 = nextIndex + 2;
                if (testConfig && idx2 < testConfig.questionCount && !preloadingQuestions.has(idx2)) {
                    generateQuestion(idx2, true, testConfig);
                }
            }, 300);
        } catch (err) {
            console.error('Error in nextQuestion:', err);
            showError(`Failed to load next question. ${err.message || 'Please try again.'}`);
        } finally {
            setIsLoadingQuestion(false);
        }
    }, [currentQuestionIndex, generateQuestion, preloadingQuestions, questions, showError, testConfig]);

    const previousQuestion = useCallback(() => {
        setCurrentQuestionIndex((idx) => (idx > 0 ? idx - 1 : idx));
    }, []);

    const finishTest = useCallback(async () => {
        try {
            if (!user) throw new Error('User not available');
            if (!testConfig) throw new Error('Test configuration missing');

            // Sanitize and validate question data
            const testQuestions = questions.map((q, index) => {
                const ua = answers[index];
                const isCorrect = ua ? ua.answerIndex === q?.correctAnswer : false;

                // Sanitize question data to remove undefined values
                const sanitizedQuestion = {
                    question: q?.question || 'Question not available',
                    options: Array.isArray(q?.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: typeof q?.correctAnswer === 'number' ? q.correctAnswer : 0,
                    explanation: q?.explanation || 'Explanation not available',
                    testType: q?.testType || testConfig.testType || 'gre',
                    section: q?.section || testConfig.section || 'verbal',
                    difficulty: q?.difficulty || testConfig.difficulty || 'medium',
                    userAnswer: ua?.answerIndex ?? -1,
                    isCorrect,
                    timeSpent: ua?.timeSpent ?? 0,
                };

                // Only include passage if it exists and has content
                if (q?.passage && typeof q.passage === 'string' && q.passage.trim().length > 0) {
                    sanitizedQuestion.passage = q.passage;
                }

                // Only include image if it exists and has content
                if (q?.image && typeof q.image === 'string' && q.image.trim().length > 0) {
                    sanitizedQuestion.image = q.image;
                }

                // Only include imageDescription if it exists and has content
                if (q?.imageDescription && typeof q.imageDescription === 'string' && q.imageDescription.trim().length > 0) {
                    sanitizedQuestion.imageDescription = q.imageDescription;
                }

                // Only include topic if it exists
                if (q?.topic && typeof q.topic === 'string' && q.topic.trim().length > 0) {
                    sanitizedQuestion.topic = q.topic;
                }

                return sanitizedQuestion;
            });

            // Sanitize result object
            const result = {
                userId: user.uid || 'unknown',
                testType: testConfig.testType || 'gre',
                section: testConfig.section || 'verbal',
                difficulty: testConfig.difficulty || 'medium',
                questions: testQuestions,
                createdAt: new Date().toISOString(),
                questionCount: testQuestions.length,
                correctCount: testQuestions.filter(q => q.isCorrect).length,
                totalTimeSpent: testQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0),
            };

            // Validate that no undefined values exist
            const hasUndefinedValues = containsUndefined(result);
            if (hasUndefinedValues) {
                console.error('Result object contains undefined values:', JSON.stringify(result, null, 2));
                throw new Error('Result contains undefined values, cannot save to Firebase');
            }

            console.log('Saving sanitized test result:', {
                questionCount: result.questions.length,
                testType: result.testType,
                section: result.section,
                userId: result.userId
            });

            await firebaseService.saveTestResult(result);

            // Save individual question responses with sanitized data
            for (const q of testQuestions) {
                try {
                    await firebaseService.saveQuestionResponse(
                        user.uid,
                        q,
                        q.userAnswer,
                        q.isCorrect,
                        q.timeSpent
                    );
                } catch (qErr) {
                    console.warn('Failed to save individual question response:', qErr);
                    // Continue with other questions even if one fails
                }
            }

            setTestResult(result);
            return result;
        } catch (err) {
            console.error('Failed to save test results:', err);
            showError('Failed to save test results. Please try again.');
            return null;
        }
    }, [answers, questions, showError, testConfig, user, containsUndefined]);

    const reset = useCallback(() => {
        setTestConfig(null);
        setQuestions([]);
        setAnswers([]);
        setTestResult(null);
        setCurrentQuestionIndex(0);
        setPreloadingQuestions(new Set());
        setIsLoadingQuestion(false);
        setError('');
    }, []);

    const retakeTest = useCallback(async () => {
        if (testConfig) {
            await startTest(testConfig);
        }
    }, [startTest, testConfig]);

    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
    const currentAnswer = useMemo(() => answers[currentQuestionIndex], [answers, currentQuestionIndex]);

    return {
        // state
        testConfig,
        questions,
        answers,
        currentQuestionIndex,
        currentQuestion,
        currentAnswer,
        isLoadingQuestion,
        isStartingTest,
        testResult,
        error,
        // actions
        startTest,
        handleAnswer,
        nextQuestion,
        previousQuestion,
        finishTest,
        reset,
        retakeTest,
        showError,
        clearError,
    };
}
