// Simple test to verify JSON parsing improvements
console.log('🧪 Testing OpenRouter JSON parsing improvements...\n');

// Test the math notation fixing function
function fixMathematicalNotation(jsonString) {
    return jsonString
        .replace(/\$([^$]*)\$/g, (match, content) => {
            return content
                .replace(/\\times/g, ' × ')
                .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
                .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
                .replace(/\^(\d+)/g, '^$1')
                .replace(/\\pm/g, '±');
        })
        .replace(/\\\\/g, '\\');
}

// Test cases
const testCases = [
    {
        name: 'LaTeX Math Notation',
        input: '{"explanation": "Area is $12 \\times 8 = 96$ square feet."}',
        expected: 'should replace \\times with ×'
    },
    {
        name: 'Fraction Notation',
        input: '{"explanation": "Result is $\\frac{5}{2}$"}',
        expected: 'should replace \\frac with (5)/(2)'
    },
    {
        name: 'Square Root',
        input: '{"explanation": "Value is $\\sqrt{25}$"}',
        expected: 'should replace \\sqrt with √(25)'
    }
];

let passed = 0;
testCases.forEach((test, i) => {
    console.log(`Test ${i + 1}: ${test.name}`);
    console.log(`Input: ${test.input}`);

    const result = fixMathematicalNotation(test.input);
    console.log(`Output: ${result}`);

    // Simple check to see if transformation occurred
    if (result !== test.input && !result.includes('\\times') && !result.includes('\\frac') && !result.includes('\\sqrt')) {
        console.log('✅ PASS\n');
        passed++;
    } else {
        console.log('❌ FAIL\n');
    }
});

console.log(`Results: ${passed}/${testCases.length} tests passed`);

if (passed === testCases.length) {
    console.log('🎉 All math notation tests passed!');
} else {
    console.log('⚠️ Some tests failed.');
}
