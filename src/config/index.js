// Centralized app configuration
export const OPENROUTER = {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL,
    appTitle: 'GRE/GMAT Test Prep App',
    maxRetries: 3,
    baseDelayMs: 1000,
};

export const FIREBASE = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const FEATURE_FLAGS = {
    useJsonAiInsights: true,
};
