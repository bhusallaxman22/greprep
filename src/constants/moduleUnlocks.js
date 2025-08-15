// Centralized module unlock thresholds by difficulty
// Difficulty -> minimum user level required
export const UNLOCK_LEVEL_BY_DIFFICULTY = {
    1: 1,
    2: 1,
    3: 3,
    4: 4,
    5: 5,
};

export const coerceLevel = (lvl) => {
    const n = Number(lvl);
    return Number.isFinite(n) && n > 0 ? n : 1;
};

export const getRequiredLevelForDifficulty = (difficulty) => {
    const diffNum = Number(difficulty);
    if (!Number.isFinite(diffNum)) return 1;
    return UNLOCK_LEVEL_BY_DIFFICULTY[diffNum] ?? 1;
};

export default { UNLOCK_LEVEL_BY_DIFFICULTY, getRequiredLevelForDifficulty, coerceLevel };
