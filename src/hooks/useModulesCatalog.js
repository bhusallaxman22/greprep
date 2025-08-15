import { useMemo } from 'react';
import MODULES from '../constants/modulesCatalog';
import { getRequiredLevelForDifficulty } from '../constants/moduleUnlocks';

const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };

export function useModulesCatalog(userLevel = 1, { category = 'all', search = '', difficulty = 'all' } = {}) {
    return useMemo(() => {
        const lvl = Number(userLevel) || 1;
        let list = MODULES.map(m => {
            const diffNum = difficultyMap[m.difficulty] || 1;
            return { ...m, unlocked: lvl >= getRequiredLevelForDifficulty(diffNum) };
        });
        if (category !== 'all') list = list.filter(m => m.category === category);
        if (difficulty !== 'all') list = list.filter(m => m.difficulty === difficulty);
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(m => m.title.toLowerCase().includes(q));
        }
        return list;
    }, [userLevel, category, search, difficulty]);
}

export default useModulesCatalog;