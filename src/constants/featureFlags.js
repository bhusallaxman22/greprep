/**
 * Feature flags configuration
 * Controls which features are enabled in the application
 */

// Environment-based feature flags
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Feature flags configuration
export const FEATURE_FLAGS = {
    // Rate limiting system
    RATE_LIMITING: {
        enabled: false, // Can be toggled on/off
        showUsageStats: true, // Show usage statistics to users
        enforceQuestionLimits: true,
        enforceEvaluationLimits: true,
        showWarnings: true,
    },

    // AI features
    AI_FEATURES: {
        enabled: true,
        questionGeneration: true,
        performanceEvaluation: true,
        insights: true,
    },

    // Development features (only in dev mode)
    DEV_FEATURES: {
        enabled: isDevelopment,
        debugMode: isDevelopment,
        verboseLogging: isDevelopment,
        mockData: false,
    },

    // Analytics and monitoring
    ANALYTICS: {
        enabled: isProduction,
        userTracking: false,
        performanceMonitoring: isProduction,
        errorReporting: isProduction,
    },

    // UI enhancements
    UI_ENHANCEMENTS: {
        animations: true,
        transitions: true,
        darkMode: false,
        responsiveDesign: true,
    },

    // Security features
    SECURITY: {
        inputValidation: true,
        securityThreats: true,
        csrfProtection: isProduction,
    },
};

/**
 * Check if a feature is enabled
 * @param {string} featureCategory - The category of the feature (e.g., 'RATE_LIMITING')
 * @param {string} featureName - The specific feature name (e.g., 'enabled')
 * @returns {boolean} Whether the feature is enabled
 */
export const isFeatureEnabled = (featureCategory, featureName = 'enabled') => {
    try {
        const category = FEATURE_FLAGS[featureCategory];
        if (!category) {
            console.warn(`Feature category '${featureCategory}' not found`);
            return false;
        }

        if (featureName in category) {
            return category[featureName];
        }

        console.warn(`Feature '${featureName}' not found in category '${featureCategory}'`);
        return false;
    } catch (error) {
        console.error('Error checking feature flag:', error);
        return false;
    }
};

/**
 * Get all features in a category
 * @param {string} featureCategory - The category of the feature
 * @returns {object} All features in the category
 */
export const getFeatureCategory = (featureCategory) => {
    return FEATURE_FLAGS[featureCategory] || {};
};

/**
 * Runtime feature flag updates (for admin/development)
 */
export const updateFeatureFlag = (category, feature, value) => {
    if (isDevelopment || window.location.hostname === 'localhost') {
        if (FEATURE_FLAGS[category]) {
            FEATURE_FLAGS[category][feature] = value;
            console.log(`Feature flag updated: ${category}.${feature} = ${value}`);
            return true;
        }
    }
    console.warn('Feature flag updates only allowed in development');
    return false;
};

/**
 * Get all feature flags (for debugging)
 */
export const getAllFeatureFlags = () => {
    if (isDevelopment) {
        return FEATURE_FLAGS;
    }
    return null;
};

// Development utilities
if (isDevelopment) {
    // Make feature flags available in console for testing
    window.FEATURE_FLAGS = FEATURE_FLAGS;
    window.isFeatureEnabled = isFeatureEnabled;
    window.updateFeatureFlag = updateFeatureFlag;
}
