import { useState } from "react";

const useLoadingStates = () => {
    const [loadingStates, setLoadingStates] = useState({
        examStart: false,
        nextQuestion: false,
        finishTest: false,
        retakeTest: false,
        reviewAnswers: false,
        returnToDashboard: false,
    });

    const setLoading = (action, isLoading) => {
        setLoadingStates(prev => ({
            ...prev,
            [action]: isLoading,
        }));
    };

    const withLoading = (action, asyncFunction) => {
        return async (...args) => {
            setLoading(action, true);
            try {
                const result = await asyncFunction(...args);
                return result;
            } finally {
                setLoading(action, false);
            }
        };
    };

    const simulateLoading = (action, duration = 1000) => {
        setLoading(action, true);
        return new Promise(resolve => {
            setTimeout(() => {
                setLoading(action, false);
                resolve();
            }, duration);
        });
    };

    return {
        loadingStates,
        setLoading,
        withLoading,
        simulateLoading,
    };
};

export default useLoadingStates;
