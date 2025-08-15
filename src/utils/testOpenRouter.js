// OpenRouter API Test Utility
// Run this in your browser console to test OpenRouter configuration

async function testOpenRouterConnection() {
    console.log('🔍 Testing OpenRouter API Configuration...\n');

    // Get configuration
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const baseUrl = import.meta.env.VITE_OPENROUTER_BASE_URL;

    console.log('📋 Configuration Check:');
    console.log('- API Key set:', !!apiKey && apiKey !== 'your-openrouter-api-key-here');
    console.log('- Base URL:', baseUrl);

    if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
        console.error('❌ API Key not configured');
        console.log('💡 Solution: Set VITE_OPENROUTER_API_KEY in your .env file');
        return false;
    }

    if (!baseUrl) {
        console.error('❌ Base URL not configured');
        console.log('💡 Solution: Set VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1');
        return false;
    }

    try {
        // Test 1: Check models endpoint
        console.log('\n🔄 Testing /models endpoint...');
        const modelsResponse = await fetch(`${baseUrl}/models`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!modelsResponse.ok) {
            console.error(`❌ Models endpoint failed: ${modelsResponse.status}`);
            console.log('📄 Response:', await modelsResponse.text());
            return false;
        }

        const models = await modelsResponse.json();
        console.log(`✅ Models endpoint working (${models.data?.length || 0} models available)`);

        // Test 2: Simple chat completion
        console.log('\n🔄 Testing chat completion...');
        const testData = {
            model: "meta-llama/llama-3.1-8b-instruct",
            messages: [
                {
                    role: "user",
                    content: "Generate only a JSON object with one key 'test' and value 'success': "
                }
            ],
            max_tokens: 50,
            temperature: 0.1
        };

        const chatResponse = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        if (!chatResponse.ok) {
            console.error(`❌ Chat completion failed: ${chatResponse.status}`);
            const errorText = await chatResponse.text();
            console.log('📄 Error response:', errorText);

            if (chatResponse.status === 401) {
                console.log('💡 This usually means your API key is invalid');
            } else if (chatResponse.status === 402) {
                console.log('💡 This usually means insufficient credits/quota');
            }
            return false;
        }

        const chatResult = await chatResponse.json();
        console.log('✅ Chat completion working');
        console.log('📝 Response:', chatResult.choices?.[0]?.message?.content);

        console.log('\n🎉 All tests passed! OpenRouter is configured correctly.');
        return true;

    } catch (error) {
        console.error('❌ Network error:', error);
        console.log('💡 Check your internet connection and try again');
        return false;
    }
}

// Export for use
export { testOpenRouterConnection };

// Also make it available globally for console testing
if (typeof window !== 'undefined') {
    window.testOpenRouterConnection = testOpenRouterConnection;
}
