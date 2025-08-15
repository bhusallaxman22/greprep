// Utilities for cleaning and parsing AI JSON responses into a strict question schema
// No React imports; pure functions only

import JSON5 from 'json5';

// Replace LaTeX and symbols with plain-English math to keep JSON safe
function sanitizeMathPlainEnglish(str) {
    if (typeof str !== 'string') return str;
    try {
        return str
            // Remove code fences and inline math wrappers first to avoid odd escapes
            .replace(/```[a-z]*\n?|```/gi, '')
            .replace(/\$([^$]*)\$/g, (_, inner) => inner)
            // Common LaTeX commands to plain text
            .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
            .replace(/\\sqrt\{([^}]*)\}/g, 'sqrt($1)')
            .replace(/\\times/g, ' times ')
            .replace(/\\cdot/g, ' dot ')
            .replace(/\\pm/g, ' plus/minus ')
            // Unicode math symbols
            .replace(/[×⋅÷±≈≤≥≠∑√π∞]/g, (m) => ({
                '×': ' times ', '⋅': ' dot ', '÷': ' divided by ', '±': ' plus/minus ',
                '≈': ' approximately ', '≤': ' less than or equal to ', '≥': ' greater than or equal to ',
                '≠': ' not equal to ', '∑': ' sum ', '√': ' sqrt ', 'π': ' pi ', '∞': ' infinity '
            })[m] || ' ')
            // Remove stray backslashes that are not valid JSON escapes
            .replace(/\\(?!["\\/bfnrtu])/g, '')
            // Normalize dashes and quotes
            .replace(/[\u2013\u2014]/g, '-')
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"');
    } catch {
        return str;
    }
}

function stripCodeFences(s) {
    if (typeof s !== 'string') return s;
    return s
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
}

function stripBOMAndZeroWidth(s) {
    if (typeof s !== 'string') return s;
    return s
        .replace(/^\uFEFF/, '') // BOM
        .replace(/[\u200B-\u200D\u2060]/g, ''); // zero-width chars
}

function normalizeQuotes(s) {
    if (typeof s !== 'string') return s;
    return s
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');
}

// Find best JSON candidate substring from a possibly chatty response
function extractJsonCandidate(content) {
    const s = content;
    const firstBrace = s.indexOf('{');
    const firstBracket = s.indexOf('[');

    const starts = [firstBrace, firstBracket].filter((i) => i !== -1).sort((a, b) => a - b);
    if (starts.length === 0) return null;

    // choose earliest JSON-like start
    const start = starts[0];
    const openChar = s[start];
    const closeChar = openChar === '{' ? '}' : ']';

    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < s.length; i++) {
        const ch = s[i];
        if (escape) {
            escape = false;
            continue;
        }
        if (ch === '\\') {
            escape = true;
            continue;
        }
        if (ch === '"') inString = !inString;
        if (inString) continue;
        if (ch === openChar) depth++;
        else if (ch === closeChar) depth--;
        if (depth === 0) {
            return s.slice(start, i + 1);
        }
    }
    // not balanced, try to salvage common pattern for a question object
    const fallback = s.match(/\{[^{}]*"question"[\s\S]*?\}/);
    return fallback ? fallback[0] : null;
}

// Convert options object {A: "..", B: ".."} to ordered array
function coerceOptionsArray(options) {
    if (Array.isArray(options)) {
        return options.map((o) => (typeof o === 'string' ? o : String(o))).filter((o) => o.trim().length > 0);
    }
    if (options && typeof options === 'object') {
        const order = ['A', 'B', 'C', 'D', 'E'];
        const arr = order
            .map((k) => options[k] || options[k.toLowerCase()] || options[k + '.'])
            .filter((v) => v !== undefined)
            .map((v) => (typeof v === 'string' ? v : String(v)));
        return arr;
    }
    return [];
}

// Normalize different answer encodings to index
function normalizeCorrectAnswer(correct, optionsArr) {
    if (typeof correct === 'number') return correct;
    if (typeof correct === 'string') {
        const trimmed = correct.trim();
        const letterIdx = 'ABCDE'.indexOf(trimmed.toUpperCase());
        if (letterIdx !== -1) return letterIdx;
        const byText = optionsArr.findIndex((opt) => opt.toLowerCase() === trimmed.toLowerCase());
        if (byText !== -1) return byText;
    }
    if (correct && typeof correct === 'object') {
        // cases like { index: 1 } or { letter: 'B' }
        if (typeof correct.index === 'number') return correct.index;
        if (typeof correct.letter === 'string') {
            const letterIdx = 'ABCDE'.indexOf(correct.letter.toUpperCase());
            if (letterIdx !== -1) return letterIdx;
        }
    }
    return 0; // default to first; validator will still check bounds
}

// Attempt to unwrap nested objects like { data: { question: ... } }
function unwrapResult(obj) {
    const keys = Object.keys(obj || {});
    const targetKeys = ['question', 'options', 'correctAnswer', 'explanation'];
    if (targetKeys.every((k) => k in obj)) return obj;
    for (const k of keys) {
        const v = obj[k];
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            const unwrapped = unwrapResult(v);
            if (unwrapped) return unwrapped;
        }
    }
    return obj;
}

function normalizeQuestionSchema(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    const obj = unwrapResult(raw);

    // Map alternate field names
    const question = obj.question || obj.prompt || obj.stem || '';
    let options = obj.options ?? obj.choices ?? obj.answers ?? [];
    options = coerceOptionsArray(options);

    // Explanation aliases
    const explanation = obj.explanation || obj.rationale || obj.solution || obj.reason || '';

    // Correct answer normalization
    let correct = obj.correctAnswer ?? obj.answer ?? obj.correct ?? obj.correctIndex ?? 0;
    const correctAnswer = normalizeCorrectAnswer(correct, options);

    // Optional fields
    const passage = obj.passage || obj.context || obj.reading || undefined;
    const image = obj.image || obj.imageUrl || obj.diagram || undefined;
    const imageDescription = obj.imageDescription || obj.alt || obj.caption || undefined;

    const result = {
        question: typeof question === 'string' ? question.trim() : String(question || '').trim(),
        options: options.slice(0, 5),
        correctAnswer,
        explanation: typeof explanation === 'string' ? explanation.trim() : String(explanation || '').trim(),
    };

    if (passage && typeof passage === 'string' && passage.trim()) result.passage = passage.trim();
    if (image && typeof image === 'string' && image.trim()) result.image = image.trim();
    if (imageDescription && typeof imageDescription === 'string' && imageDescription.trim()) result.imageDescription = imageDescription.trim();

    // Sanitize math-heavy fields
    result.question = sanitizeMathPlainEnglish(result.question);
    if (result.passage) result.passage = sanitizeMathPlainEnglish(result.passage);
    result.explanation = sanitizeMathPlainEnglish(result.explanation);
    result.options = result.options.map((o) => sanitizeMathPlainEnglish(o));

    return result;
}

export function cleanAndParseQuestionJSON(content) {
    if (!content || typeof content !== 'string') {
        throw new Error('Invalid content provided');
    }

    // 1) Normalize surface noise
    let s = stripBOMAndZeroWidth(content.trim());
    s = normalizeQuotes(s);
    s = stripCodeFences(s);

    // 2) Extract best JSON candidate
    let candidate = extractJsonCandidate(s);
    if (!candidate) {
        // Try last resort: locate block with question/options keywords
        const match = s.match(/\{[\s\S]*?\}/);
        candidate = match ? match[0] : s;
    }

    // Balance braces / brackets if obviously truncated
    try {
        const openBraces = (candidate.match(/\{/g) || []).length;
        const closeBraces = (candidate.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
            candidate = candidate + '}'.repeat(openBraces - closeBraces);
        }
        const openBrackets = (candidate.match(/\[/g) || []).length;
        const closeBrackets = (candidate.match(/\]/g) || []).length;
        if (openBrackets > closeBrackets) {
            candidate = candidate + ']'.repeat(openBrackets - closeBrackets);
        }
    } catch { /* noop */ }

    // 3) Sanitize math and problematic characters pre-parse
    candidate = sanitizeMathPlainEnglish(candidate);
    candidate = Array.from(candidate)
        .map((ch) => {
            const code = ch.charCodeAt(0);
            if ((code <= 31 && ch !== '\r' && ch !== '\n' && ch !== '\t') || code === 127) return ' ';
            return ch;
        })
        .join('')
        .replace(/,(\s*[}\]])/g, '$1');

    // 4) Try strict JSON first
    try {
        const obj = JSON.parse(candidate);
        return normalizeQuestionSchema(obj);
    } catch { /* continue */ }

    // 5) Try JSON5
    try {
        const obj = JSON5.parse(candidate);
        return normalizeQuestionSchema(obj);
    } catch { /* continue */ }

    // 6) Heuristic fixes (quote keys, swap single quotes)
    try {
        let fixed = candidate
            .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:\s*)/g, '$1"$2"$3');
        if (!/"[^"]*"/.test(fixed) && /'[^']*'/.test(fixed)) {
            fixed = fixed.replace(/'([^']*)'/g, '"$1"');
        }
        const obj = JSON5.parse(fixed);
        return normalizeQuestionSchema(obj);
    } catch { /* continue */ }

    // 7) Inner object extraction
    try {
        const lastChance = candidate.match(/\{[^{}]*"question"[^{}]*"options"[^{}]*\}/);
        if (lastChance) {
            const obj = JSON5.parse(lastChance[0]);
            return normalizeQuestionSchema(obj);
        }
    } catch { /* continue */ }

    // 8) LENIENT REGEX FALLBACK (best-effort). Build minimal object if fields detectable.
    try {
        const minimal = {};
        const qMatch = candidate.match(/"question"\s*:\s*"([\s\S]*?)"\s*,\s*"options"/);
        const optsMatch = candidate.match(/"options"\s*:\s*\[([\s\S]*?)\]/);
        const corrMatch = candidate.match(/"correctAnswer"\s*:\s*([0-4])/);
        const explMatch = candidate.match(/"explanation"\s*:\s*"([\s\S]*?)"[\s,}]/);
        if (qMatch && optsMatch) {
            const rawOptionsSection = optsMatch[1];
            const optionStrings = rawOptionsSection
                .split(/"\s*,\s*"/)
                .map((s) => s.replace(/^"|"$/g, ''))
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 5);
            minimal.question = qMatch[1].trim();
            minimal.options = optionStrings;
            minimal.correctAnswer = corrMatch ? Number(corrMatch[1]) : 0;
            minimal.explanation = explMatch ? explMatch[1].trim() : '';
            return normalizeQuestionSchema(minimal);
        }
    } catch { /* continue */ }

    // 9) Give up
    throw new Error('All JSON parsing strategies failed. Unable to extract a valid question object.');
}

export default {
    cleanAndParseQuestionJSON,
};
