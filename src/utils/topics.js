// Topic utilities: pools, unique context builder, and topic extraction

export const topicPools = {
    reading: [
        'scientific research and discoveries', 'historical analysis and interpretation',
        'literary criticism and analysis', 'social policy and economics',
        'environmental science and conservation', 'technological innovation',
        'cultural anthropology', 'psychology and behavioral studies',
        'art history and aesthetics', 'political science and governance',
        'philosophy and ethics', 'medicine and public health',
        'archaeology and ancient civilizations', 'linguistics and language',
        'education and learning theory', 'urban planning and development'
    ],
    verbal: [
        'advanced vocabulary in context', 'logical argument analysis',
        'sentence completion with nuanced meaning', 'critical reasoning',
        'text coherence and organization', 'rhetorical devices and style',
        'inference and implication', 'cause and effect relationships',
        'comparison and contrast', 'evidence evaluation',
        'assumption identification', 'conclusion strengthening/weakening'
    ],
    quantitative: [
        'algebra and equations', 'geometry and coordinate systems',
        'statistics and probability', 'data analysis and interpretation',
        'number theory and properties', 'arithmetic and percentages',
        'word problems and real-world applications', 'sequences and series',
        'functions and graphs', 'combinatorics and counting',
        'ratio and proportion', 'exponents and radicals',
        'bar chart analysis', 'line graph interpretation',
        'pie chart data analysis', 'scatter plot correlation',
        'histogram distribution analysis', 'box plot statistical analysis',
        'coordinate geometry with graphs', 'geometric shape analysis',
        'data table interpretation', 'trend analysis from charts',
        'comparative graph analysis', 'function graphing and analysis'
    ]
};

export function getUnusedTopics(section, previousTopics = []) {
    const pool = topicPools[section] || [];
    return pool.filter((t) => !previousTopics.includes(t));
}

export function buildUniqueContext({ questionIndex = 0, previousTopics = [], sessionId = Date.now().toString() } = {}) {
    const uniqueSeed = `${sessionId}-${questionIndex}-${Date.now()}`;

    const variationPrompts = [
        'Focus on a completely different topic/theme than any previous questions.',
        'Use a unique questioning approach and fresh perspective.',
        'Incorporate current or contemporary examples rather than historical ones.',
        'Create a scenario-based question with practical applications.',
        'Design a question that tests analytical thinking from a new angle.',
        'Use interdisciplinary connections between different fields of study.'
    ];
    const selectedVariation = variationPrompts[questionIndex % variationPrompts.length];

    const unusedTopics = Object.keys(topicPools).reduce((acc, sec) => {
        acc[sec] = getUnusedTopics(sec, previousTopics);
        return acc;
    }, {});

    return {
        uniqueSeed,
        unusedTopics,
        contextPrompt: `
- Question ID: ${uniqueSeed}
- This is question ${questionIndex + 1} in the session
- Previously used topics to AVOID: ${previousTopics.join(', ') || 'None'}
- ${selectedVariation}
- MANDATORY: Choose from these fresh topics: [SELECT ONE SPECIFIC TOPIC, DON'T REUSE]
    `,
        sessionId
    };
}

export function extractTopicFromQuestion(question) {
    try {
        const text = (question.passage || question.question || '').toLowerCase();
        const words = text.split(/\s+/);

        const topicKeywords = [
            'teacher', 'teaching', 'education', 'student', 'learning', 'school',
            'science', 'research', 'study', 'analysis', 'history', 'literature',
            'technology', 'computer', 'environmental', 'social', 'political',
            'economic', 'cultural', 'psychological', 'medical', 'mathematical',
            'artistic', 'business', 'legal', 'philosophical'
        ];

        const found = topicKeywords.find((k) => words.some((w) => w.includes(k)));
        if (found) return found;

        const meaningful = words.filter((w) => w.length > 4 && !['question', 'following', 'which', 'according', 'based'].includes(w));
        return meaningful.slice(0, 2).join(' ') || 'general';
    } catch {
        return `topic-${Date.now()}`;
    }
}

export default {
    topicPools,
    getUnusedTopics,
    buildUniqueContext,
    extractTopicFromQuestion,
};
