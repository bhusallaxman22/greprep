/**
 * Input validation service to prevent malicious API requests
 */

// Maximum allowed lengths for user inputs
const MAX_LENGTHS = {
    PROMPT_LENGTH: 2000,
    ANSWER_LENGTH: 500,
    QUESTION_TEXT: 1000,
    EXPLANATION_LENGTH: 1500,
    USER_INPUT: 100,
};

// Blocked patterns and keywords
const BLOCKED_PATTERNS = [
    // Injection attempts
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script[^>]*>/i,
    /<\/script>/i,
    /on\w+\s*=/i,

    // API manipulation attempts
    /api[_\s]*key/i,
    /secret/i,
    /token/i,
    /password/i,
    /authorization/i,

    // Prompt injection attempts
    /ignore\s+(previous|all)\s+instructions/i,
    /system\s*:/i,
    /assistant\s*:/i,
    /you\s+are\s+now/i,
    /forget\s+everything/i,
    /act\s+as\s+if/i,
    /pretend\s+to\s+be/i,
    /role\s*:\s*system/i,

    // Attempts to extract information
    /what\s+is\s+your\s+api\s+key/i,
    /show\s+me\s+your\s+prompt/i,
    /reveal\s+your\s+instructions/i,
    /tell\s+me\s+about\s+your\s+system/i,
];

// Suspicious content patterns
const SUSPICIOUS_PATTERNS = [
    // Excessive repetition
    /(.{1,10})\1{10,}/,
    // Multiple special characters
    /[!@#$%^&*()_+={}[\]:";'<>?,./\\|`~]{10,}/,
    // Base64-like patterns (potential data exfiltration)
    /[A-Za-z0-9+/]{50,}={0,2}/,
    // Unicode manipulation
    /[\u200B-\u200D\uFEFF]/,
];

/**
 * Sanitize and validate text input
 */
export const validateTextInput = (input, maxLength = MAX_LENGTHS.USER_INPUT, fieldName = 'input') => {
    const errors = [];

    // Basic validation
    if (typeof input !== 'string') {
        errors.push(`${fieldName} must be a string`);
        return { isValid: false, errors, sanitized: '' };
    }

    // Length validation
    if (input.length > maxLength) {
        errors.push(`${fieldName} exceeds maximum length of ${maxLength} characters`);
    }

    // Check for blocked patterns
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(input)) {
            errors.push(`${fieldName} contains prohibited content`);
            break;
        }
    }

    // Check for suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(input)) {
            errors.push(`${fieldName} contains suspicious content`);
            break;
        }
    }

    // Sanitize the input
    let sanitized = input
        .trim()
        .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .substring(0, maxLength); // Truncate if needed

    return {
        isValid: errors.length === 0,
        errors,
        sanitized,
        originalLength: input.length,
        truncated: input.length > maxLength
    };
};

/**
 * Validate test configuration
 */
export const validateTestConfig = (config) => {
    const errors = [];

    if (!config || typeof config !== 'object') {
        errors.push('Test configuration must be an object');
        return { isValid: false, errors };
    }

    // Validate test type
    const allowedTestTypes = ['GRE', 'GMAT'];
    if (!allowedTestTypes.includes(config.testType)) {
        errors.push('Invalid test type');
    }

    // Validate section
    const allowedSections = [
        'verbal', 'quantitative', 'analytical-writing',
        'integrated-reasoning', 'critical-reasoning', 'reading-comprehension',
        'problem-solving', 'data-sufficiency', 'sentence-correction'
    ];
    if (!allowedSections.includes(config.section)) {
        errors.push('Invalid section');
    }

    // Validate difficulty
    const allowedDifficulties = ['easy', 'medium', 'hard'];
    if (!allowedDifficulties.includes(config.difficulty)) {
        errors.push('Invalid difficulty level');
    }

    // Validate question count
    if (!Number.isInteger(config.questionCount) ||
        config.questionCount < 1 ||
        config.questionCount > 30) {
        errors.push('Question count must be between 1 and 30');
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitized: {
            testType: config.testType,
            section: config.section,
            difficulty: config.difficulty,
            questionCount: Math.min(Math.max(parseInt(config.questionCount) || 10, 1), 30)
        }
    };
};

/**
 * Validate question data from API response
 */
export const validateQuestionData = (questionData) => {
    const errors = [];

    if (!questionData || typeof questionData !== 'object') {
        errors.push('Question data must be an object');
        return { isValid: false, errors };
    }

    // Required fields
    const requiredFields = ['question', 'options', 'correctAnswer'];
    for (const field of requiredFields) {
        if (!(field in questionData)) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Validate question text
    if (questionData.question) {
        const questionValidation = validateTextInput(
            questionData.question,
            MAX_LENGTHS.QUESTION_TEXT,
            'question'
        );
        if (!questionValidation.isValid) {
            errors.push(...questionValidation.errors);
        }
    }

    // Validate options
    if (questionData.options) {
        if (!Array.isArray(questionData.options)) {
            errors.push('Options must be an array');
        } else if (questionData.options.length < 2 || questionData.options.length > 6) {
            errors.push('Options must contain 2-6 choices');
        } else {
            questionData.options.forEach((option, index) => {
                const optionValidation = validateTextInput(
                    option,
                    MAX_LENGTHS.ANSWER_LENGTH,
                    `option ${index + 1}`
                );
                if (!optionValidation.isValid) {
                    errors.push(...optionValidation.errors);
                }
            });
        }
    }

    // Validate correct answer
    if (questionData.correctAnswer !== undefined) {
        const correctAnswer = parseInt(questionData.correctAnswer);
        if (!Number.isInteger(correctAnswer) ||
            correctAnswer < 0 ||
            correctAnswer >= (questionData.options?.length || 0)) {
            errors.push('Invalid correct answer index');
        }
    }

    // Validate explanation if present
    if (questionData.explanation) {
        const explanationValidation = validateTextInput(
            questionData.explanation,
            MAX_LENGTHS.EXPLANATION_LENGTH,
            'explanation'
        );
        if (!explanationValidation.isValid) {
            errors.push(...explanationValidation.errors);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate user answer data
 */
export const validateAnswerData = (answerData) => {
    const errors = [];

    if (!answerData || typeof answerData !== 'object') {
        errors.push('Answer data must be an object');
        return { isValid: false, errors };
    }

    // Validate answer index
    if (answerData.answerIndex !== undefined) {
        const answerIndex = parseInt(answerData.answerIndex);
        if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 10) {
            errors.push('Invalid answer index');
        }
    }

    // Validate time spent
    if (answerData.timeSpent !== undefined) {
        const timeSpent = parseInt(answerData.timeSpent);
        if (!Number.isInteger(timeSpent) || timeSpent < 0 || timeSpent > 3600000) { // Max 1 hour
            errors.push('Invalid time spent value');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        sanitized: {
            answerIndex: Math.min(Math.max(parseInt(answerData.answerIndex) || 0, 0), 10),
            timeSpent: Math.min(Math.max(parseInt(answerData.timeSpent) || 0, 0), 3600000)
        }
    };
};

/**
 * Rate limit request size to prevent resource exhaustion
 */
export const validateRequestSize = (requestData, maxSizeKB = 50) => {
    const jsonString = JSON.stringify(requestData);
    const sizeInKB = new Blob([jsonString]).size / 1024;

    if (sizeInKB > maxSizeKB) {
        return {
            isValid: false,
            error: `Request size (${sizeInKB.toFixed(2)}KB) exceeds limit (${maxSizeKB}KB)`,
            actualSize: sizeInKB
        };
    }

    return {
        isValid: true,
        actualSize: sizeInKB
    };
};

/**
 * Comprehensive validation for API requests
 */
export const validateAPIRequest = (requestType, data) => {
    const errors = [];

    // Validate request size first
    const sizeValidation = validateRequestSize(data);
    if (!sizeValidation.isValid) {
        errors.push(sizeValidation.error);
    }

    // Type-specific validation
    switch (requestType) {
        case 'GENERATE_QUESTION': {
            const configValidation = validateTestConfig(data);
            if (!configValidation.isValid) {
                errors.push(...configValidation.errors);
            }
            break;
        }

        case 'SUBMIT_ANSWER': {
            const answerValidation = validateAnswerData(data);
            if (!answerValidation.isValid) {
                errors.push(...answerValidation.errors);
            }
            break;
        }

        case 'EVALUATE_PERFORMANCE': {
            if (!Array.isArray(data.testResults)) {
                errors.push('Test results must be an array');
            } else if (data.testResults.length > 100) {
                errors.push('Too many test results provided');
            }
            break;
        }

        default:
            errors.push('Unknown request type');
    }

    return {
        isValid: errors.length === 0,
        errors,
        requestSize: sizeValidation.actualSize
    };
};

/**
 * Check for potential security threats
 */
export const checkSecurityThreats = (input) => {
    const threats = [];

    // Check for script injection
    if (/<script|javascript:|data:/i.test(input)) {
        threats.push('SCRIPT_INJECTION');
    }

    // Check for prompt injection
    if (/ignore\s+(previous|all)\s+instructions/i.test(input)) {
        threats.push('PROMPT_INJECTION');
    }

    // Check for API key extraction attempts
    if (/api[_\s]*key|secret|token/i.test(input)) {
        threats.push('CREDENTIAL_EXTRACTION');
    }

    // Check for excessive length (potential DoS)
    if (input.length > 10000) {
        threats.push('EXCESSIVE_LENGTH');
    }

    let riskLevel = 'LOW';
    if (threats.length > 0) {
        riskLevel = threats.length <= 2 ? 'MEDIUM' : 'HIGH';
    }

    return {
        hasThreats: threats.length > 0,
        threats,
        riskLevel
    };
};
