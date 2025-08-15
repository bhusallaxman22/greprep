const PROMPT_RULES = `
CRITICAL INSTRUCTIONS FOR AI:
- RESPOND WITH PURE JSON ONLY. NO MARKDOWN, NO CODE BLOCKS, NO EXPLANATIONS OUTSIDE JSON.
- DO NOT USE LaTeX, math symbols ($, \\times, \\frac, \\sqrt, etc.), or special formatting.
- DO NOT INCLUDE ANY TEXT BEFORE OR AFTER THE JSON OBJECT.
- KEEP LANGUAGE CLEAR, PRECISE, AND IN PLAIN ENGLISH.
- ALL OPTIONS MUST BE PLAUSIBLE; ONLY ONE CORRECT.
- JSON MUST START WITH { AND END WITH }.
`;

const QUESTION_FORMAT = {
    default: `{
    "question": "Your question here",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation in plain English."
  }`,
    reading: `{
    "passage": "Engaging 200-400 word academic passage.",
    "question": "Question about the passage.",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Explanation referencing the passage."
  }`
};

function buildQuestionPrompt({ testType, section, difficulty, topic, uniqueContext }) {
    const contextText = uniqueContext
        ? (typeof uniqueContext === 'string'
            ? uniqueContext
            : [uniqueContext.contextPrompt, uniqueContext.uniqueSeed]
                .filter(Boolean)
                .join(' \n'))
        : '';

    let format = QUESTION_FORMAT.default;
    let extra = '';

    if (section === 'reading') {
        format = QUESTION_FORMAT.reading;
        extra = `\nPASSAGE REQUIREMENTS:\n- Academic, substantive, 200-400 words\n- Topic: ${topic || 'varied'}\n- Include specific details/examples\n- No visual elements, text only`;
    } else if (section === 'quantitative') {
        extra = `\nMATH REQUIREMENTS:\n- Step-by-step reasoning in plain English\n- No math symbols or LaTeX\n- Realistic numbers/scenarios\n- Difficulty: ${difficulty}`;
    } else if (section === 'verbal') {
        extra = `\nVERBAL REQUIREMENTS:\n- Sentence/text completion, critical reasoning, vocabulary\n- Difficulty: ${difficulty}`;
    }

    const variety = `\nTOPIC VARIETY:\n- Avoid repeating prior topics and question styles.\n- Prefer a fresh scenario and domain (science, humanities, social issues, technology, business, arts).\n- If quantitative, avoid overused contexts like rectangular gardens.`;

    return `Generate a ${testType} ${section} question at ${difficulty} difficulty.${contextText ? `\nContext: ${contextText}` : ''}\n${PROMPT_RULES}\nEXACT JSON FORMAT REQUIRED:\n${format}\n${extra}${variety}`;
}

function buildRetryPrompt({ testType, section, difficulty }) {
    return `RETRY: PURE JSON ONLY. NO OTHER TEXT, NO MARKDOWN, NO MATH SYMBOLS.\n${PROMPT_RULES}\n{
    "question": "${testType} ${section} question (${difficulty} level)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct using plain English only"
}`;
}

function buildLearningQuestionPrompt({ topic, testType, section, difficulty, includePassage, moduleMeta }) {
    // Build dynamic meta context
    const metaParts = [];
    if (moduleMeta) {
        if (moduleMeta.description) metaParts.push(`Module Description: ${moduleMeta.description}`);
        if (Array.isArray(moduleMeta.prerequisites) && moduleMeta.prerequisites.length) {
            metaParts.push(`Prerequisites (assumed mastered): ${moduleMeta.prerequisites.join(', ')}`);
        }
        if (Array.isArray(moduleMeta.badges) && moduleMeta.badges.length) {
            metaParts.push(`Gamification Badges: ${moduleMeta.badges.join(', ')}`);
        }
        if (moduleMeta.duration) metaParts.push(`Estimated Study Duration: ${moduleMeta.duration} minutes`);
        if (moduleMeta.xpReward) metaParts.push(`XP Reward: ${moduleMeta.xpReward}`);
    }

    const metaContext = metaParts.length ? `\nMODULE CONTEXT:\n${metaParts.join('\n')}` : '';

    const difficultyDescriptor = {
        beginner: 'Introduce core concept with foundational reasoning steps',
        easy: 'Introduce core concept with foundational reasoning steps',
        intermediate: 'Require multi-step reasoning integrating two related ideas',
        medium: 'Require multi-step reasoning integrating two related ideas',
        advanced: 'Require deeper inference, abstraction, or quantitative estimation',
        hard: 'Require deeper inference, abstraction, or quantitative estimation',
        expert: 'Demand synthesis of multiple concepts, subtle distractor elimination, and strategic reasoning'
    }[difficulty] || 'Appropriate for target level';

    // Expanded JSON format specification
    const baseFormat = `{
  "question": "Clear, high-quality question stem focused on one precise assessable skill.",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "1-2 sentence high-level justification of the correct answer.",
  "reasoningSteps": ["Step-by-step reasoning in ordered logical progression"],
  "optionExplanations": [
    { "option": "Option A", "isCorrect": false, "rationale": "Why it is right or wrong (conceptual, not superficial)." }
  ],
  "concepts": ["Primary concept", "Secondary concept"],
  "skillFocus": "Specific micro-skill being tested (e.g., Rate Conversion, Inference, Strengthen Argument)",
  "strategyTip": "Actionable test-taking strategy relevant to this item type.",
  "difficultyRating": 3${includePassage ? ',\n  "passage": "(ONLY IF REQUIRED) 250-400 word academically toned passage with specific, concrete details and varied sentence structure."' : ''}
}`;

    const passageReq = includePassage || section === 'reading' ? `\nPASSAGE REQUIREMENTS:\n- 250-400 words, academically toned, information-dense\n- Concrete data, subtle nuance, NO fluff, NO meta commentary\n- Include 2-3 specific facts or contrasting viewpoints to anchor inference` : '';

    const sectionDirectives = {
        verbal: `VERBAL DIRECTIVES:\n- Avoid trivial vocabulary; target precise contextual meaning or logical structure\n- Distractors must each reflect a distinct, realistic misunderstanding\n- Stem should not be answerable by shallow clue matching`,
        quantitative: `QUANT DIRECTIVES:\n- Use realistic numbers that avoid computational grind yet require structured reasoning\n- Provide reasoningSteps that show conceptual framing before numeric manipulation\n- Distractors should reflect common conceptual mistakes (unit omission, inverse, rounding)`,
        writing: `WRITING / ANALYTICAL DIRECTIVES:\n- Focus on argument evaluation, logical flaw, evidence appraisal, or assumption analysis\n- Explanation must name the underlying argumentative principle`,
        integrated: `INTEGRATED / DATA REASONING DIRECTIVES:\n- Require cross-referencing of at least two implicit data points or ideas\n- Emphasize interpretation over recall`
    }[section] || '';

    const distractorRules = `DISTRACTOR QUALITY RULES:\n- Each incorrect option must be *plausible* yet wrong for a *different* conceptual reason\n- NO throwaway options (e.g., obviously unrelated)\n- Avoid repeating wording from question stem in the correct option more than distractors\n- Avoid ALL / NONE / ALWAYS / NEVER absolutes unless testing logic of extremes`;

    return `You are an expert ${testType} ${section} instructional designer. Generate ONE superior learning question for ${difficulty} level about: ${topic}.\n${PROMPT_RULES}${metaContext}\nDIFFICULTY PROFILE: ${difficultyDescriptor}\n${sectionDirectives}\n${passageReq}\n${distractorRules}\nOUTPUT REQUIREMENTS:\n- EXACTLY 4 OPTIONS\n- PURE JSON ONLY (see schema below)\n- All required keys must appear even if arrays have 1 value minimum.\nEXPANDED JSON SCHEMA (populate all fields):\n${baseFormat}\nQUALITY CRITERIA:\n- Cognitive depth > surface recall\n- Explanation integrates concept names where appropriate\n- reasoningSteps must be sequential and self-contained\n- optionExplanations array must have one entry per option in order\nRETURN ONLY THE JSON OBJECT.`;
}

function buildEvaluationPrompt({ stats, returnFormat }) {
    const { totalQuestions, accuracy, sectionPerformance, difficultyPerformance, recentTests } = stats;
    const strongest = Object.entries(sectionPerformance || {})
        .sort((a, b) => (b[1].accuracy || 0) - (a[1].accuracy || 0))[0]?.[0] || 'N/A';
    const weakest = Object.entries(sectionPerformance || {})
        .sort((a, b) => (a[1].accuracy || 0) - (b[1].accuracy || 0))[0]?.[0] || 'N/A';

    let base = `Analyze this student's test performance data and produce targeted, actionable guidance.\n` +
        `TOTAL QUESTIONS: ${totalQuestions}\n` +
        `OVERALL ACCURACY: ${accuracy}%\n` +
        `AVG QUESTION TIME (s): ${stats.averageQuestionTime || 0}\n` +
        `SECTION BREAKDOWN: ${Object.entries(sectionPerformance).map(([s, d]) => `${s}: ${d.accuracy}% (${d.correct}/${d.total}) avgTime=${d.avgTime}s`).join(' | ')}\n` +
        `DIFFICULTY BREAKDOWN: ${Object.entries(difficultyPerformance).map(([diff, d]) => `${diff}: ${Math.round((d.correct / d.total) * 100)}%`).join(' | ')}\n` +
        `RECENT TESTS: ${recentTests.map((t, i) => `T${i + 1}:${(t.questions || []).filter(q => q.isCorrect).length}/${(t.questions || []).length}`).join(' ')}\n` +
        `STRONGEST SECTION (raw): ${strongest}\nWEAKEST SECTION (raw): ${weakest}`;

    if (returnFormat === 'json') {
        base += `\n\nCRITICAL OUTPUT RULES:\n- RESPOND WITH *ONLY* VALID JSON. NO markdown, backticks, commentary, or surrounding text.\n- Use double quotes for all keys & strings.\n- Provide ALL required keys even if you must infer.\n- Keep language concise, specific, non-generic.\n- Do NOT invent statistics not provided; rely on given data.\n\nREQUIRED JSON SCHEMA EXACT KEYS:\n{\n  "keyInsights": { "title": "Key Insights", "content": "2-3 sentences: concrete strengths + weaknesses patterns.", "icon": "lightbulb", "severity": "info" },\n  "priorityActions": { "title": "Priority Actions", "content": "Top 2-3 highest ROI focus actions (imperative voice).", "icon": "flag", "severity": "warning" },\n  "studyPlan": { "title": "Study Plan", "items": ["Actionable step 1", "Actionable step 2", "Actionable step 3"], "icon": "book", "severity": "success" },\n  "testStrategy": { "title": "Test Strategy", "content": "1-2 timing / approach tactics tied to observed weaknesses.", "icon": "psychology", "severity": "info" },\n  "motivation": { "title": "Motivation & Goals", "content": "Specific encouragement + realistic improvement framing.", "icon": "trending_up", "severity": "success" },\n  "stats": { "overallScore": ${accuracy}, "strongestSection": "${strongest}", "weakestSection": "${weakest}", "totalQuestions": ${totalQuestions}, "testsCompleted": ${recentTests.length}, "averageQuestionTime": ${stats.averageQuestionTime} }\n}\n\nICON OPTIONS: lightbulb, flag, book, psychology, trending_up.\nSEVERITY OPTIONS: info, warning, success.\nOnly output the JSON object.`;
    }
    return base;
}

export const openrouterPrompts = {
    buildQuestionPrompt,
    buildRetryPrompt,
    buildLearningQuestionPrompt,
    buildEvaluationPrompt,
    PROMPT_RULES,
    QUESTION_FORMAT
};
