import { useCallback, useMemo, useState } from 'react';
import firebaseService from '../services/firebase';
import openRouterService from '../services/openrouter';

export default function useTestFlow(user) {
    const [testConfig, setTestConfig] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [testResult, setTestResult] = useState(null);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
    const [preloadingQuestions, setPreloadingQuestions] = useState(new Set());
    const [error, setError] = useState('');

    const showError = useCallback((message) => setError(message), []);
    const clearError = useCallback(() => setError(''), []);

    const generateQuestion = useCallback(async (questionIndex, isPreload = false, cfg = null) => {
        const currentConfig = cfg || testConfig;

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

            const question = await openRouterService.generateQuestion(
                currentConfig.testType,
                currentConfig.section,
                currentConfig.difficulty
            );

            setQuestions((prev) => {
                const next = [...prev];
                next[questionIndex] = question;
                return next;
            });

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
    }, [preloadingQuestions, showError, testConfig]);

    const startTest = useCallback(async (config) => {
        setTestConfig(config);
        setQuestions([]);
        setAnswers(new Array(config.questionCount).fill(null));
        setCurrentQuestionIndex(0);
        setPreloadingQuestions(new Set());
        setTestResult(null);

        await generateQuestion(0, false, config);
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
        }
    }, [currentQuestionIndex, generateQuestion, preloadingQuestions, questions, showError, testConfig]);

    const previousQuestion = useCallback(() => {
        setCurrentQuestionIndex((idx) => (idx > 0 ? idx - 1 : idx));
    }, []);

    const finishTest = useCallback(async () => {
        try {
            if (!user) throw new Error('User not available');
            if (!testConfig) throw new Error('Test configuration missing');

            const testQuestions = questions.map((q, index) => {
                const ua = answers[index];
                const isCorrect = ua ? ua.answerIndex === q.correctAnswer : false;
                return {
                    ...q,
                    userAnswer: ua?.answerIndex ?? -1,
                    isCorrect,
                    timeSpent: ua?.timeSpent ?? 0,
                    testType: q.testType || testConfig.testType,
                    section: q.section || testConfig.section,
                    difficulty: q.difficulty || testConfig.difficulty,
                };
            });

            const result = {
                userId: user.uid,
                testType: testConfig.testType,
                section: testConfig.section,
                difficulty: testConfig.difficulty,
                questions: testQuestions,
                createdAt: new Date().toISOString(),
            };

            await firebaseService.saveTestResult(result);
            for (const q of testQuestions) {
                await firebaseService.saveQuestionResponse(
                    user.uid,
                    q,
                    q.userAnswer,
                    q.isCorrect,
                    q.timeSpent
                );
            }

            setTestResult(result);
            return result;
        } catch (err) {
            console.error('Failed to save test results:', err);
            showError('Failed to save test results. Please try again.');
            return null;
        }
    }, [answers, questions, showError, testConfig, user]);

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
