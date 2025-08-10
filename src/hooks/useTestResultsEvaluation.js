import { useEffect, useState, useCallback } from 'react';

export default function useTestResultsEvaluation(testResult) {
    const [aiEvaluation, setAiEvaluation] = useState('');
    const [aiInsights, setAiInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!testResult) return;
        setIsLoading(true);
        setError('');
        try {
            const { default: openRouterService } = await import('../services/openrouter');
            const [evaluation, insights] = await Promise.all([
                openRouterService.evaluatePerformance([testResult]),
                openRouterService.evaluatePerformanceWithFormat([testResult], 'json'),
            ]);
            setAiEvaluation(evaluation);
            setAiInsights(insights);
        } catch (e) {
            console.error('AI evaluation failed:', e);
            setAiEvaluation('AI evaluation temporarily unavailable. Please check your OpenRouter API configuration.');
            setError('Failed to load AI evaluation');
        } finally {
            setIsLoading(false);
        }
    }, [testResult]);

    useEffect(() => {
        load();
    }, [load]);

    return { aiEvaluation, aiInsights, isLoading, error, reload: load };
}
