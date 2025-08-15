import { useState, useCallback, useRef, useEffect } from "react";

const useTimer = (initialDuration = 0, options = {}) => {
    const {
        autoStart = false,
        onTimeUp,
        onTick,
        warningThreshold = 60,
    } = options;

    const [duration] = useState(initialDuration);
    const [timeRemaining, setTimeRemaining] = useState(initialDuration);
    const [isRunning, setIsRunning] = useState(autoStart);
    const [startTime, setStartTime] = useState(autoStart ? Date.now() : null);
    const intervalRef = useRef(null);

    const start = useCallback(() => {
        if (!isRunning && timeRemaining > 0) {
            setIsRunning(true);
            setStartTime(Date.now());
        }
    }, [isRunning, timeRemaining]);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    // Reset now supports optional auto-restart behavior
    const reset = useCallback((restart = autoStart) => {
        setIsRunning(false);
        setTimeRemaining(duration);
        if (restart) {
            setStartTime(Date.now());
            setIsRunning(true);
        } else {
            setStartTime(null);
        }
    }, [duration, autoStart]);

    // Explicit restart convenience method
    const restart = useCallback(() => {
        setTimeRemaining(duration);
        setStartTime(Date.now());
        setIsRunning(true);
    }, [duration]);

    const stop = useCallback(() => {
        setIsRunning(false);
        setTimeRemaining(0);
        setStartTime(null);
    }, []);

    const getElapsedTime = useCallback(() => {
        if (!startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
    }, [startTime]);

    // Timer logic: do not depend on timeRemaining to avoid interval recreation every second
    useEffect(() => {
        if (isRunning && timeRemaining > 0 && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    const newTime = prev - 1;
                    onTick?.(newTime);
                    if (newTime <= 0) {
                        setIsRunning(false);
                        onTimeUp?.();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        }
        if (!isRunning && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, onTimeUp, onTick, timeRemaining]); // keep timeRemaining only to allow early stop when hits 0

    // Reset when duration changes
    useEffect(() => {
        setTimeRemaining(initialDuration);
        if (autoStart) {
            setIsRunning(true);
            setStartTime(Date.now());
        } else {
            setIsRunning(false);
            setStartTime(null);
        }
    }, [initialDuration, autoStart]);

    // Cleanup on unmount
    useEffect(() => () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);

    const progress = duration > 0 ? ((duration - timeRemaining) / duration) * 100 : 0;
    const isWarning = timeRemaining <= warningThreshold && timeRemaining > 30;
    const isDanger = timeRemaining <= 30;

    return {
        timeRemaining,
        isRunning,
        progress,
        isWarning,
        isDanger,
        elapsedTime: getElapsedTime(),
        start,
        pause,
        reset,
        restart,
        stop,
    };
};

export default useTimer;
