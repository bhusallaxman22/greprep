// Test for OpenRouter JSON parsing improvements
// This can be run in browser console to test the parsing

const testResponses = [
    // Test 1: Markdown code block with math notation (the error we're fixing)
    `\`\`\`json
{
  "question": "A rectangular garden is 12 feet long and 8 feet wide. What is the area?",
  "options": ["96", "104", "88", "112"],
  "correctAnswer": 0,
  "explanation": "The area is $12 \\times 8 = 96$ square feet."
}
\`\`\``,

    // Test 2: LaTeX notation without code blocks
    `{
  "question": "Solve for x: $x^2 + 5x - 6 = 0$",
  "options": ["1 and 6", "-6 and 1", "2 and 3", "-2 and -3"],
  "correctAnswer": 1,
  "explanation": "Using the quadratic formula: $x = \\frac{-5 \\pm \\sqrt{25 + 24}}{2} = \\frac{-5 \\pm 7}{2}$, so x = 1 or x = -6."
}`,

    // Test 3: Mixed content with text before JSON
    `Here's a math question for you:

{
  "question": "What is 15% of 240?",
  "options": ["30", "32", "36", "38"],
  "correctAnswer": 2,
  "explanation": "15% of 240 = 0.15 × 240 = 36"
}

That should work!`,

    // Test 4: Valid JSON that should parse directly
    `{
  "question": "Choose the best word to complete the sentence.",
  "options": ["excellent", "terrible", "mediocre", "outstanding"],
  "correctAnswer": 0,
  "explanation": "Excellent is the most appropriate choice for this context."
}`
];

// Mock OpenRouter service for testing
class TestOpenRouterService {
    // Copy the improved math notation fixing method
    fixMathematicalNotation(jsonString) {
        try {
            return jsonString
                .replace(/\$([^$]*)\$/g, (match, content) => {
                    const plainText = content
                        .replace(/\\times/g, ' times ')
                        .replace(/\\cdot/g, ' · ')
                        .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
                        .replace(/\\sqrt\{([^}]*)\}/g, 'sqrt($1)')
                        .replace(/\^([0-9])/g, '^$1')
                        .replace(/_{([^}]*)}/g, '_$1')
                        .replace(/\\/g, '')
                        .replace(/"/g, '\\"');
                    return plainText;
                })
                .replace(/\\times/g, ' times ')
                .replace(/\\cdot/g, ' · ')
                .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
                .replace(/\\sqrt\{([^}]*)\}/g, 'sqrt($1)')
                .replace(/\\pm/g, '±')
                .replace(/\\[a-zA-Z]+\{[^}]*\}/g, (match) => match.replace(/[\\{}]/g, ''))
                .replace(/"([^"]*\\[^"\\]*[^"]*)"/g, (match, content) => {
                    const escaped = content
                        .replace(/\\(?!["\\/bfnrtu])/g, '')
                        .replace(/\\"/g, '\\"');
                    return `"${escaped}"`;
                })
                .replace(/[^\x20-\x7E]/g, (char) => {
                    const charCode = char.charCodeAt(0);
                    if (charCode === 8211 || charCode === 8212) return '-';
                    if (charCode === 8216 || charCode === 8217) return "'";
                    if (charCode === 8220 || charCode === 8221) return '"';
                    return ' ';
                });
        } catch (error) {
            console.log('Error fixing mathematical notation:', error);
            return jsonString;
        }
    }

    // Copy the improved JSON parsing method
    cleanAndParseJSON(content) {
        if (!content || typeof content !== 'string') {
            throw new Error('Invalid content provided');
        }

        const originalContent = content.trim();
        console.log('Testing content:', originalContent.substring(0, 100) + '...');

        if (originalContent.startsWith('```json') || originalContent.includes('```json')) {
            console.log('Detected markdown code block, cleaning...');
        }

        let cleanContent = originalContent;

        cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

        const jsonStart = cleanContent.indexOf('{');
        const jsonEnd = cleanContent.lastIndexOf('}');

        if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
            throw new Error('Response does not contain valid JSON structure');
        }

        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
        cleanContent = this.fixMathematicalNotation(cleanContent);

        const strategies = [
            () => JSON.parse(cleanContent),
            () => {
                let fixed = cleanContent
                    .replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"')
                    .replace(/,(\s*[}\]])/g, '$1')
                    .replace(/([{,]\s*)(\w+):/g, '$1"$2":');
                return JSON.parse(fixed);
            },
            () => {
                let cleaned = '';
                let inString = false;
                let escapeNext = false;

                for (let i = 0; i < cleanContent.length; i++) {
                    const char = cleanContent[i];

                    if (escapeNext) {
                        cleaned += char;
                        escapeNext = false;
                        continue;
                    }

                    if (char === '\\') {
                        const nextChar = cleanContent[i + 1];
                        if (inString && nextChar && ['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'].includes(nextChar)) {
                            cleaned += char;
                            escapeNext = true;
                        } else if (inString) {
                            if (nextChar === 't' && cleanContent.substring(i, i + 6) === '\\times') {
                                cleaned += 'times';
                                i += 5;
                            } else if (nextChar === 'f' && cleanContent.substring(i, i + 5) === '\\frac') {
                                cleaned += 'fraction';
                                i += 4;
                            } else {
                                continue;
                            }
                        } else {
                            cleaned += char;
                        }
                    } else if (char === '"') {
                        inString = !inString;
                        cleaned += char;
                    } else {
                        cleaned += char;
                    }
                }

                return JSON.parse(cleaned);
            }
        ];

        for (let i = 0; i < strategies.length; i++) {
            try {
                const result = strategies[i]();
                console.log(`✅ Parsed successfully with strategy ${i + 1}`);
                return result;
            } catch (error) {
                console.log(`❌ Strategy ${i + 1} failed:`, error.message);
                if (i === strategies.length - 1) {
                    throw new Error(`All JSON parsing strategies failed. Response: ${originalContent.substring(0, 100)}...`);
                }
            }
        }
    }
}

// Run tests
function testOpenRouterParsing() {
    console.log('🧪 Testing OpenRouter JSON parsing improvements...\n');

    const service = new TestOpenRouterService();
    let passedTests = 0;

    testResponses.forEach((response, index) => {
        console.log(`\n📝 Test ${index + 1}:`);
        try {
            const result = service.cleanAndParseJSON(response);
            console.log('✅ SUCCESS - Parsed JSON:', result);
            passedTests++;
        } catch (error) {
            console.log('❌ FAILED:', error.message);
        }
    });

    console.log(`\n🎯 Results: ${passedTests}/${testResponses.length} tests passed`);

    if (passedTests === testResponses.length) {
        console.log('🎉 All tests passed! The parsing improvements work correctly.');
    } else {
        console.log('⚠️ Some tests failed. Further improvements may be needed.');
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.testOpenRouterParsing = testOpenRouterParsing;
}

export { testOpenRouterParsing };
