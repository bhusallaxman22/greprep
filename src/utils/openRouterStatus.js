// OpenRouter Status Checker
import { OPENROUTER } from '../config/index.js';

export class OpenRouterStatus {
    static checkConfiguration() {
        const status = {
            isConfigured: false,
            issues: [],
            recommendations: []
        };

        // Check API key
        if (!OPENROUTER.apiKey || OPENROUTER.apiKey === 'your-openrouter-api-key-here') {
            status.issues.push('API key not configured');
            status.recommendations.push('Set VITE_OPENROUTER_API_KEY in your .env file');
        }

        // Check base URL
        if (!OPENROUTER.baseUrl || OPENROUTER.baseUrl === 'your-base-url-here') {
            status.issues.push('Base URL not configured');
            status.recommendations.push('Set VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1');
        }

        // Check if properly configured
        status.isConfigured = status.issues.length === 0;

        return status;
    }

    static async testConnection() {
        const configStatus = this.checkConfiguration();

        if (!configStatus.isConfigured) {
            return {
                success: false,
                error: 'Configuration incomplete',
                details: configStatus
            };
        }

        try {
            const response = await fetch(`${OPENROUTER.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return {
                    success: true,
                    message: 'OpenRouter API connection successful'
                };
            } else {
                const errorText = await response.text();
                return {
                    success: false,
                    error: `API returned ${response.status}`,
                    details: errorText
                };
            }
        } catch (error) {
            return {
                success: false,
                error: 'Network error',
                details: error.message
            };
        }
    }

    static getDebugInfo() {
        return {
            apiKeySet: !!OPENROUTER.apiKey && OPENROUTER.apiKey !== 'your-openrouter-api-key-here',
            baseUrl: OPENROUTER.baseUrl,
            maxRetries: OPENROUTER.maxRetries,
            environment: import.meta.env.MODE || 'unknown'
        };
    }
}

// Auto-check on import in development
if (import.meta.env.DEV) {
    const status = OpenRouterStatus.checkConfiguration();
    if (!status.isConfigured) {
        console.warn('⚠️ OpenRouter not properly configured:');
        status.issues.forEach(issue => console.warn(`  - ${issue}`));
        console.log('💡 Solutions:');
        status.recommendations.forEach(rec => console.log(`  - ${rec}`));
    } else {
        console.log('✅ OpenRouter configuration looks good');
    }
}
