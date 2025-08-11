/**
 * Rate limiting service to prevent API abuse
 */

import { isFeatureEnabled } from '../constants/featureFlags';

// Rate limiting configuration
const RATE_LIMITS = {
    // Questions per user per hour
    QUESTIONS_PER_HOUR: 50,
    // AI evaluations per user per hour
    EVALUATIONS_PER_HOUR: 20,
    // Maximum questions per test session
    MAX_QUESTIONS_PER_TEST: 30,
    // Minimum time between API calls (in milliseconds)
    MIN_CALL_INTERVAL: 2000, // 2 seconds
    // Daily limits
    DAILY_QUESTION_LIMIT: 200,
    DAILY_EVALUATION_LIMIT: 100,
};

// Storage keys for rate limiting
const STORAGE_KEYS = {
    QUESTIONS_HOURLY: 'rateLimiter_questions_hourly',
    EVALUATIONS_HOURLY: 'rateLimiter_evaluations_hourly',
    QUESTIONS_DAILY: 'rateLimiter_questions_daily',
    EVALUATIONS_DAILY: 'rateLimiter_evaluations_daily',
    LAST_API_CALL: 'rateLimiter_last_api_call',
    SESSION_QUESTIONS: 'rateLimiter_session_questions',
};

/**
 * Get current timestamp in milliseconds
 */
const getCurrentTimestamp = () => Date.now();

/**
 * Get hour key for current hour
 */
const getCurrentHourKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
};

/**
 * Get day key for current day
 */
const getCurrentDayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
};

/**
 * Get stored rate limit data
 */
const getRateLimitData = (key, currentKey) => {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return { key: currentKey, count: 0 };

        const data = JSON.parse(stored);

        // Reset if time period has changed
        if (data.key !== currentKey) {
            return { key: currentKey, count: 0 };
        }

        return data;
    } catch (error) {
        console.warn('Error reading rate limit data:', error);
        return { key: currentKey, count: 0 };
    }
};

/**
 * Store rate limit data
 */
const setRateLimitData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn('Error storing rate limit data:', error);
    }
};

/**
 * Check if minimum time has passed since last API call
 */
const checkCallInterval = () => {
    const lastCall = localStorage.getItem(STORAGE_KEYS.LAST_API_CALL);
    if (!lastCall) return true;

    const timeSinceLastCall = getCurrentTimestamp() - parseInt(lastCall);
    return timeSinceLastCall >= RATE_LIMITS.MIN_CALL_INTERVAL;
};

/**
 * Update last API call timestamp
 */
const updateLastCallTime = () => {
    localStorage.setItem(STORAGE_KEYS.LAST_API_CALL, getCurrentTimestamp().toString());
};

/**
 * Check and increment question generation rate limit
 */
export const checkQuestionRateLimit = () => {
    // Check if rate limiting is enabled
    if (!isFeatureEnabled('RATE_LIMITING', 'enabled') || !isFeatureEnabled('RATE_LIMITING', 'enforceQuestionLimits')) {
        return {
            allowed: true,
            bypassedReason: 'Rate limiting disabled via feature flag'
        };
    }

    // Check call interval
    if (!checkCallInterval()) {
        return {
            allowed: false,
            reason: 'Too many requests. Please wait a moment before generating more questions.',
            remainingTime: RATE_LIMITS.MIN_CALL_INTERVAL - (getCurrentTimestamp() - parseInt(localStorage.getItem(STORAGE_KEYS.LAST_API_CALL)))
        };
    }

    const currentHour = getCurrentHourKey();
    const currentDay = getCurrentDayKey();

    // Check hourly limit
    const hourlyData = getRateLimitData(STORAGE_KEYS.QUESTIONS_HOURLY, currentHour);
    if (hourlyData.count >= RATE_LIMITS.QUESTIONS_PER_HOUR) {
        return {
            allowed: false,
            reason: `Hourly question limit reached (${RATE_LIMITS.QUESTIONS_PER_HOUR}). Please try again next hour.`,
            resetTime: new Date(Date.now() + (60 - new Date().getMinutes()) * 60 * 1000)
        };
    }

    // Check daily limit
    const dailyData = getRateLimitData(STORAGE_KEYS.QUESTIONS_DAILY, currentDay);
    if (dailyData.count >= RATE_LIMITS.DAILY_QUESTION_LIMIT) {
        return {
            allowed: false,
            reason: `Daily question limit reached (${RATE_LIMITS.DAILY_QUESTION_LIMIT}). Please try again tomorrow.`,
            resetTime: new Date(Date.now() + (24 - new Date().getHours()) * 60 * 60 * 1000)
        };
    }

    // Check session limit
    const sessionCount = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_QUESTIONS) || '0');
    if (sessionCount >= RATE_LIMITS.MAX_QUESTIONS_PER_TEST) {
        return {
            allowed: false,
            reason: `Maximum questions per test session reached (${RATE_LIMITS.MAX_QUESTIONS_PER_TEST}). Please start a new test.`,
        };
    }

    // Increment counters
    setRateLimitData(STORAGE_KEYS.QUESTIONS_HOURLY, {
        key: currentHour,
        count: hourlyData.count + 1
    });

    setRateLimitData(STORAGE_KEYS.QUESTIONS_DAILY, {
        key: currentDay,
        count: dailyData.count + 1
    });

    localStorage.setItem(STORAGE_KEYS.SESSION_QUESTIONS, (sessionCount + 1).toString());
    updateLastCallTime();

    return {
        allowed: true,
        remaining: {
            hourly: RATE_LIMITS.QUESTIONS_PER_HOUR - hourlyData.count - 1,
            daily: RATE_LIMITS.DAILY_QUESTION_LIMIT - dailyData.count - 1,
            session: RATE_LIMITS.MAX_QUESTIONS_PER_TEST - sessionCount - 1
        }
    };
};

/**
 * Check and increment AI evaluation rate limit
 */
export const checkEvaluationRateLimit = () => {
    // Check if rate limiting is enabled
    if (!isFeatureEnabled('RATE_LIMITING', 'enabled') || !isFeatureEnabled('RATE_LIMITING', 'enforceEvaluationLimits')) {
        return {
            allowed: true,
            bypassedReason: 'Rate limiting disabled via feature flag'
        };
    }

    // Check call interval
    if (!checkCallInterval()) {
        return {
            allowed: false,
            reason: 'Too many requests. Please wait a moment before requesting more evaluations.',
            remainingTime: RATE_LIMITS.MIN_CALL_INTERVAL - (getCurrentTimestamp() - parseInt(localStorage.getItem(STORAGE_KEYS.LAST_API_CALL)))
        };
    }

    const currentHour = getCurrentHourKey();
    const currentDay = getCurrentDayKey();

    // Check hourly limit
    const hourlyData = getRateLimitData(STORAGE_KEYS.EVALUATIONS_HOURLY, currentHour);
    if (hourlyData.count >= RATE_LIMITS.EVALUATIONS_PER_HOUR) {
        return {
            allowed: false,
            reason: `Hourly evaluation limit reached (${RATE_LIMITS.EVALUATIONS_PER_HOUR}). Please try again next hour.`,
            resetTime: new Date(Date.now() + (60 - new Date().getMinutes()) * 60 * 1000)
        };
    }

    // Check daily limit
    const dailyData = getRateLimitData(STORAGE_KEYS.EVALUATIONS_DAILY, currentDay);
    if (dailyData.count >= RATE_LIMITS.DAILY_EVALUATION_LIMIT) {
        return {
            allowed: false,
            reason: `Daily evaluation limit reached (${RATE_LIMITS.DAILY_EVALUATION_LIMIT}). Please try again tomorrow.`,
            resetTime: new Date(Date.now() + (24 - new Date().getHours()) * 60 * 60 * 1000)
        };
    }

    // Increment counters
    setRateLimitData(STORAGE_KEYS.EVALUATIONS_HOURLY, {
        key: currentHour,
        count: hourlyData.count + 1
    });

    setRateLimitData(STORAGE_KEYS.EVALUATIONS_DAILY, {
        key: currentDay,
        count: dailyData.count + 1
    });

    updateLastCallTime();

    return {
        allowed: true,
        remaining: {
            hourly: RATE_LIMITS.EVALUATIONS_PER_HOUR - hourlyData.count - 1,
            daily: RATE_LIMITS.DAILY_EVALUATION_LIMIT - dailyData.count - 1
        }
    };
};

/**
 * Reset session counters (call when starting a new test)
 */
export const resetSessionCounters = () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION_QUESTIONS);
};

/**
 * Get current usage statistics
 */
export const getUsageStats = () => {
    // Check if usage stats should be shown
    if (!isFeatureEnabled('RATE_LIMITING', 'enabled') || !isFeatureEnabled('RATE_LIMITING', 'showUsageStats')) {
        return null;
    }

    const currentHour = getCurrentHourKey();
    const currentDay = getCurrentDayKey();

    const questionsHourly = getRateLimitData(STORAGE_KEYS.QUESTIONS_HOURLY, currentHour);
    const evaluationsHourly = getRateLimitData(STORAGE_KEYS.EVALUATIONS_HOURLY, currentHour);
    const questionsDaily = getRateLimitData(STORAGE_KEYS.QUESTIONS_DAILY, currentDay);
    const evaluationsDaily = getRateLimitData(STORAGE_KEYS.EVALUATIONS_DAILY, currentDay);
    const sessionQuestions = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_QUESTIONS) || '0');

    return {
        questions: {
            hourly: {
                used: questionsHourly.count,
                limit: RATE_LIMITS.QUESTIONS_PER_HOUR,
                remaining: RATE_LIMITS.QUESTIONS_PER_HOUR - questionsHourly.count
            },
            daily: {
                used: questionsDaily.count,
                limit: RATE_LIMITS.DAILY_QUESTION_LIMIT,
                remaining: RATE_LIMITS.DAILY_QUESTION_LIMIT - questionsDaily.count
            },
            session: {
                used: sessionQuestions,
                limit: RATE_LIMITS.MAX_QUESTIONS_PER_TEST,
                remaining: RATE_LIMITS.MAX_QUESTIONS_PER_TEST - sessionQuestions
            }
        },
        evaluations: {
            hourly: {
                used: evaluationsHourly.count,
                limit: RATE_LIMITS.EVALUATIONS_PER_HOUR,
                remaining: RATE_LIMITS.EVALUATIONS_PER_HOUR - evaluationsHourly.count
            },
            daily: {
                used: evaluationsDaily.count,
                limit: RATE_LIMITS.DAILY_EVALUATION_LIMIT,
                remaining: RATE_LIMITS.DAILY_EVALUATION_LIMIT - evaluationsDaily.count
            }
        }
    };
};

/**
 * Check if user is approaching limits (for warnings)
 */
export const checkUsageWarnings = () => {
    // Check if warnings should be shown
    if (!isFeatureEnabled('RATE_LIMITING', 'enabled') || !isFeatureEnabled('RATE_LIMITING', 'showWarnings')) {
        return [];
    }

    const stats = getUsageStats();
    if (!stats) return [];

    const warnings = [];

    // Check if approaching hourly question limit
    if (stats.questions.hourly.remaining <= 5 && stats.questions.hourly.remaining > 0) {
        warnings.push(`Only ${stats.questions.hourly.remaining} questions remaining this hour`);
    }

    // Check if approaching daily question limit
    if (stats.questions.daily.remaining <= 20 && stats.questions.daily.remaining > 0) {
        warnings.push(`Only ${stats.questions.daily.remaining} questions remaining today`);
    }

    // Check if approaching session limit
    if (stats.questions.session.remaining <= 5 && stats.questions.session.remaining > 0) {
        warnings.push(`Only ${stats.questions.session.remaining} questions remaining in this session`);
    }

    return warnings;
};
