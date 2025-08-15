# OpenRouter API Troubleshooting Guide

## Current Issues & Solutions

### 1. 404 API Errors

**Problem:** `POST https://openrouter.ai/api/v1/chat/completions 404 (Not Found)`

**Root Causes:**
- Missing or invalid API key
- Incorrect base URL configuration
- API endpoint changes
- Account/billing issues

**Solutions:**

#### Step 1: Check Environment Variables
Create a `.env` file in your project root (copy from `.env.example`):

```env
# OpenRouter AI Configuration
VITE_OPENROUTER_API_KEY=your-actual-api-key-here
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

#### Step 2: Verify API Key
1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Sign up/login to your account
3. Navigate to API Keys section
4. Generate a new API key
5. Replace `your-actual-api-key-here` with your real key

#### Step 3: Test API Connection
Add this test function to check your API configuration:

```javascript
// Add to openrouter.js for testing
async testConnection() {
  try {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      }
    });
    
    if (response.ok) {
      console.log('✅ OpenRouter API connection successful');
      return true;
    } else {
      console.error('❌ API connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}
```

### 2. JSON Parsing Errors

**Problem:** AI responses are malformed and can't be parsed as JSON.

**Improved Solutions:**
- Better prompt engineering to force JSON responses
- Multiple parsing strategies implemented
- Fallback to predefined questions when parsing fails
- Model rotation for better reliability

### 3. Infinite Retry Loops

**Problem:** The service keeps retrying failed requests endlessly.

**Fixed:** 
- Added better error classification
- Configuration errors don't trigger retries
- Maximum retry limit enforced
- Exponential backoff implemented

## Updated Model List

The service now uses more reliable models in this order:

1. `openai/gpt-3.5-turbo` (paid, most reliable)
2. `anthropic/claude-3-haiku` (paid, good for structured output)
3. `meta-llama/llama-3.1-8b-instruct` (free tier)
4. `google/gemma-2-9b-it` (free tier)
5. `microsoft/wizardlm-2-7b` (free tier)

## Quick Fix Checklist

- [ ] `.env` file exists with correct API key
- [ ] API key is valid and has credits/permissions
- [ ] Base URL is `https://openrouter.ai/api/v1`
- [ ] Network connection is stable
- [ ] Console shows "✅ OpenRouter API connection successful"

## Alternative Solutions

If OpenRouter continues to have issues:

1. **Use Fallback Questions**: The app will automatically use predefined questions
2. **Switch API Provider**: Consider alternatives like:
   - OpenAI API directly
   - Anthropic Claude API
   - Google Gemini API
3. **Local Models**: Use Ollama for local AI generation

## Environment Variables Template

```env
# Copy this to your .env file
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Firebase (required for user data)
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Testing the Fix

1. Restart your development server: `npm run dev`
2. Check the console for configuration status
3. Try generating a test question
4. Look for success messages in the console

If you're still experiencing issues, the app will gracefully fall back to predefined questions while you resolve the API configuration.
