import { useState, useEffect, useCallback } from 'react';
import firebaseService from '../services/firebase';
import openRouterService from '../services/openrouter';

export default function useDashboardData(userId) {
    const [stats, setStats] = useState(null);
    const [aiEvaluation, setAiEvaluation] = useState('');
    const [aiInsights, setAiInsights] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingAI, setLoadingAI] = useState(false);
    const [error, setError] = useState('');
    const [cachedAIEvaluation, setCachedAIEvaluation] = useState(null);
    const [cachedAIInsights, setCachedAIInsights] = useState(null);
    const [lastStatsHash, setLastStatsHash] = useState('');
    const [quickInsight, setQuickInsight] = useState('');

    const load = useCallback(async () => {
        if (!userId) return;
        try {
            setLoadingStats(true);
            setError('');

            const userStats = await firebaseService.calculateUserStats(userId);
            setStats(userStats);
            setLoadingStats(false);

            // Quick insight (best-effort)
            try {
                const insights = openRouterService.generateQuickInsights(userStats);
                setQuickInsight(insights?.[0] || 'Keep practicing to improve your performance!');
            } catch {
                setQuickInsight('Keep practicing to improve your performance!');
            }

            const currentStatsHash = JSON.stringify({
                totalTests: userStats.totalTests,
                totalQuestions: userStats.totalQuestions,
                overallAccuracy: userStats.overallAccuracy,
                recentTests: userStats.recentPerformance?.length || 0,
            });

            if (userStats.totalTests > 0) {
                if (cachedAIEvaluation && cachedAIInsights && lastStatsHash === currentStatsHash) {
                    setAiEvaluation(cachedAIEvaluation);
                    setAiInsights(cachedAIInsights);
                } else {
                    setLoadingAI(true);
                    try {
                        const testResults = await firebaseService.getUserTestResults(userId);
                        const [evaluation, insights] = await Promise.all([
                            openRouterService.evaluatePerformance(testResults.slice(0, 3)),
                            openRouterService.evaluatePerformanceWithFormat(testResults.slice(0, 3), 'json'),
                        ]);
                        setAiEvaluation(evaluation);
                        setAiInsights(insights);
                        setCachedAIEvaluation(evaluation);
                        setCachedAIInsights(insights);
                        setLastStatsHash(currentStatsHash);
                    } catch (e) {
                        console.error('AI evaluation failed:', e);
                        setAiEvaluation('AI evaluation temporarily unavailable. Please check your OpenRouter API configuration.');
                    } finally {
                        setLoadingAI(false);
                    }
                }
            } else {
                // New users
                const insights = openRouterService.generateQuickInsights(userStats);
                setAiEvaluation(insights.join('\n\n'));
            }
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Failed to load dashboard data. Please check your Firebase configuration.');
            setLoadingStats(false);
        }
    }, [userId, cachedAIEvaluation, cachedAIInsights, lastStatsHash]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        stats,
        aiEvaluation,
        aiInsights,
        loadingStats,
        loadingAI,
        error,
        quickInsight,
        reload: load,
    };
}
