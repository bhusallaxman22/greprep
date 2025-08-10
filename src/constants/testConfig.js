export const TEST_TYPES = [
    { value: 'GRE', label: 'GRE', description: 'Graduate Record Examination' },
    { value: 'GMAT', label: 'GMAT', description: 'Graduate Management Admission Test' }
];

export const SECTIONS = {
    GRE: [
        { value: 'verbal', label: 'Verbal Reasoning', icon: '📚' },
        { value: 'quantitative', label: 'Quantitative Reasoning', icon: '🔢' },
        { value: 'analytical-writing', label: 'Analytical Writing', icon: '✍️' }
    ],
    GMAT: [
        { value: 'verbal', label: 'Verbal', icon: '📚' },
        { value: 'quantitative', label: 'Quantitative', icon: '🔢' },
        { value: 'integrated-reasoning', label: 'Integrated Reasoning', icon: '🧩' },
        { value: 'analytical-writing', label: 'Analytical Writing Assessment', icon: '✍️' }
    ]
};

export const DIFFICULTIES = [
    { value: 'easy', label: 'Easy', color: 'success', description: 'Good for beginners' },
    { value: 'medium', label: 'Medium', color: 'warning', description: 'Standard difficulty' },
    { value: 'hard', label: 'Hard', color: 'error', description: 'Advanced level' }
];

export const QUESTION_COUNTS = [5, 10, 15, 20, 25];

export default { TEST_TYPES, SECTIONS, DIFFICULTIES, QUESTION_COUNTS };
