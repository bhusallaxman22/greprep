import firebaseService from './firebase';

/**
 * User Progress Service
 * Handles user progress tracking, XP management, level progression, and module completion
 */
class UserProgressService {
    constructor() {
        this.xpPerLevel = 1000; // XP required per level
        this.baseXpReward = 50; // Base XP for completing a module
    }

    /**
     * Calculate user level based on XP
     */
    calculateLevel(xp) {
        return Math.floor(xp / this.xpPerLevel) + 1;
    }

    /**
     * Calculate XP needed for next level
     */
    getXpForNextLevel(currentXp) {
        const currentLevel = this.calculateLevel(currentXp);
        const nextLevelXp = currentLevel * this.xpPerLevel;
        return nextLevelXp - currentXp;
    }

    /**
     * Calculate XP reward based on performance
     */
    calculateXpReward(module, performance) {
        const { correct, total, timeSpent, difficulty } = performance;
        const accuracyPercent = (correct / total) * 100;

        let reward = this.baseXpReward;

        // Bonus for high accuracy
        if (accuracyPercent >= 90) reward *= 1.5;
        else if (accuracyPercent >= 80) reward *= 1.3;
        else if (accuracyPercent >= 70) reward *= 1.1;

        // Difficulty multiplier
        const difficultyMultiplier = {
            easy: 1.0,
            medium: 1.2,
            hard: 1.5,
            expert: 2.0
        };
        reward *= difficultyMultiplier[difficulty] || 1.0;

        // Module-specific bonus
        if (module.xpReward) {
            reward = Math.max(reward, module.xpReward);
        }

        // Time bonus (faster completion gets slight bonus)
        const expectedTimePerQuestion = 90; // 90 seconds per question
        const expectedTotalTime = total * expectedTimePerQuestion;
        if (timeSpent && timeSpent < expectedTotalTime * 0.8) {
            reward *= 1.1; // 10% bonus for quick completion
        }

        return Math.round(reward);
    }

    /**
     * Get user's current progress
     */
    async getUserProgress(userId) {
        try {
            return await firebaseService.getUserLearningProgress(userId);
        } catch (error) {
            console.error('Error getting user progress:', error);
            throw error;
        }
    }

    /**
     * Update user progress after module completion
     */
    async updateProgressAfterCompletion(userId, module, performance) {
        try {
            // Get current progress
            const currentProgress = await this.getUserProgress(userId);

            // Calculate XP reward
            const xpReward = this.calculateXpReward(module, performance);

            // Update progress data
            const newXp = currentProgress.xp + xpReward;
            const newLevel = this.calculateLevel(newXp);
            const leveledUp = newLevel > currentProgress.level;

            // Update module progress
            const moduleProgress = currentProgress.moduleProgress || {};
            moduleProgress[module.id] = {
                completed: true,
                completedAt: new Date().toISOString(),
                score: performance.correct,
                total: performance.total,
                accuracy: Math.round((performance.correct / performance.total) * 100),
                timeSpent: performance.timeSpent,
                xpEarned: xpReward,
                attempts: (moduleProgress[module.id]?.attempts || 0) + 1
            };

            // Update achievements
            const achievements = this.checkForNewAchievements(currentProgress, {
                newXp,
                newLevel,
                moduleProgress,
                performance
            });

            // Prepare updated progress
            const updatedProgress = {
                ...currentProgress,
                xp: newXp,
                level: newLevel,
                completedLessons: currentProgress.completedLessons + 1,
                moduleProgress,
                achievements: [...(currentProgress.achievements || []), ...achievements],
                lastActivityDate: new Date().toISOString(),
                totalQuestionsAnswered: (currentProgress.totalQuestionsAnswered || 0) + performance.total,
                totalCorrectAnswers: (currentProgress.totalCorrectAnswers || 0) + performance.correct,
                streak: this.updateStreak(currentProgress)
            };

            // Save to Firebase
            await Promise.all([
                firebaseService.updateLearningProgress(userId, updatedProgress),
                firebaseService.saveModuleCompletion(userId, {
                    moduleId: module.id,
                    moduleTitle: module.title,
                    category: module.category,
                    difficulty: module.difficulty,
                    score: performance.correct,
                    totalQuestions: performance.total,
                    accuracy: Math.round((performance.correct / performance.total) * 100),
                    timeSpent: performance.timeSpent,
                    xpEarned: xpReward
                }),
                firebaseService.saveModuleScore(userId, module.id, {
                    score: performance.correct,
                    totalQuestions: performance.total,
                    accuracy: Math.round((performance.correct / performance.total) * 100),
                    questionsAnswered: performance.total,
                    timeSpent: performance.timeSpent,
                    xpEarned: xpReward,
                    lastAttempt: new Date().toISOString()
                })
            ]);

            return {
                updatedProgress,
                xpReward,
                leveledUp,
                newAchievements: achievements
            };

        } catch (error) {
            console.error('Error updating progress after completion:', error);
            throw error;
        }
    }

    /**
     * Update user's daily streak
     */
    updateStreak(currentProgress) {
        const today = new Date().toDateString();
        const lastActivity = currentProgress.lastActivityDate
            ? new Date(currentProgress.lastActivityDate).toDateString()
            : null;

        if (!lastActivity) {
            return 1; // First day
        }

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

        if (lastActivity === today) {
            return currentProgress.streak || 1; // Same day, keep streak
        } else if (lastActivity === yesterday) {
            return (currentProgress.streak || 0) + 1; // Consecutive day
        } else {
            return 1; // Streak broken, start over
        }
    }

    /**
     * Check for new achievements
     */
    checkForNewAchievements(currentProgress, newData) {
        const achievements = [];
        const existingAchievements = currentProgress.achievements || [];

        // Level-based achievements
        if (newData.newLevel >= 5 && !this.hasAchievement(existingAchievements, 'level_5')) {
            achievements.push({
                id: 'level_5',
                title: 'Rising Scholar',
                description: 'Reached level 5',
                type: 'level',
                earnedAt: new Date().toISOString(),
                xpBonus: 100
            });
        }

        if (newData.newLevel >= 10 && !this.hasAchievement(existingAchievements, 'level_10')) {
            achievements.push({
                id: 'level_10',
                title: 'Academic Excellence',
                description: 'Reached level 10',
                type: 'level',
                earnedAt: new Date().toISOString(),
                xpBonus: 200
            });
        }

        // Completion-based achievements
        const completedModules = Object.values(newData.moduleProgress).filter(m => m.completed).length;

        if (completedModules >= 5 && !this.hasAchievement(existingAchievements, 'modules_5')) {
            achievements.push({
                id: 'modules_5',
                title: 'Module Master',
                description: 'Completed 5 modules',
                type: 'completion',
                earnedAt: new Date().toISOString(),
                xpBonus: 150
            });
        }

        if (completedModules >= 10 && !this.hasAchievement(existingAchievements, 'modules_10')) {
            achievements.push({
                id: 'modules_10',
                title: 'Learning Champion',
                description: 'Completed 10 modules',
                type: 'completion',
                earnedAt: new Date().toISOString(),
                xpBonus: 300
            });
        }

        // Accuracy-based achievements
        if (newData.performance.correct === newData.performance.total &&
            !this.hasAchievement(existingAchievements, 'perfect_score')) {
            achievements.push({
                id: 'perfect_score',
                title: 'Perfectionist',
                description: 'Achieved 100% accuracy on a module',
                type: 'accuracy',
                earnedAt: new Date().toISOString(),
                xpBonus: 100
            });
        }

        // Streak achievements
        const newStreak = this.updateStreak(currentProgress);
        if (newStreak >= 7 && !this.hasAchievement(existingAchievements, 'streak_7')) {
            achievements.push({
                id: 'streak_7',
                title: 'Week Warrior',
                description: '7-day learning streak',
                type: 'streak',
                earnedAt: new Date().toISOString(),
                xpBonus: 200
            });
        }

        return achievements;
    }

    /**
     * Check if user has a specific achievement
     */
    hasAchievement(achievements, achievementId) {
        return achievements.some(achievement => achievement.id === achievementId);
    }

    /**
     * Get user's completed modules
     */
    async getCompletedModules(userId) {
        try {
            return await firebaseService.getCompletedModules(userId);
        } catch (error) {
            console.error('Error getting completed modules:', error);
            return [];
        }
    }

    /**
     * Get user's module scores
     */
    async getModuleScores(userId) {
        try {
            return await firebaseService.getUserModuleScores(userId);
        } catch (error) {
            console.error('Error getting module scores:', error);
            return {};
        }
    }

    /**
     * Get user's learning statistics
     */
    async getLearningStats(userId) {
        try {
            const [progress, completedModules] = await Promise.all([
                this.getUserProgress(userId),
                this.getCompletedModules(userId)
            ]);

            const totalModulesCompleted = completedModules.length;
            const totalQuestionsAnswered = progress.totalQuestionsAnswered || 0;
            const totalCorrectAnswers = progress.totalCorrectAnswers || 0;
            const overallAccuracy = totalQuestionsAnswered > 0
                ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
                : 0;

            // Calculate category-wise performance
            const categoryStats = {};
            completedModules.forEach(module => {
                const category = module.category || 'general';
                if (!categoryStats[category]) {
                    categoryStats[category] = {
                        modulesCompleted: 0,
                        totalQuestions: 0,
                        correctAnswers: 0,
                        averageAccuracy: 0
                    };
                }
                categoryStats[category].modulesCompleted++;
                categoryStats[category].totalQuestions += module.totalQuestions || 0;
                categoryStats[category].correctAnswers += module.score || 0;
            });

            // Calculate average accuracy per category
            Object.keys(categoryStats).forEach(category => {
                const stats = categoryStats[category];
                stats.averageAccuracy = stats.totalQuestions > 0
                    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
                    : 0;
            });

            return {
                level: progress.level,
                xp: progress.xp,
                xpForNextLevel: this.getXpForNextLevel(progress.xp),
                streak: progress.streak || 0,
                totalModulesCompleted,
                totalQuestionsAnswered,
                totalCorrectAnswers,
                overallAccuracy,
                achievements: progress.achievements || [],
                categoryStats,
                recentActivity: completedModules.slice(0, 5) // Last 5 completed modules
            };
        } catch (error) {
            console.error('Error getting learning stats:', error);
            throw error;
        }
    }

    /**
     * Reset user progress (for testing or admin purposes)
     */
    async resetUserProgress(userId) {
        try {
            const defaultProgress = {
                level: 1,
                xp: 0,
                streak: 0,
                completedLessons: 0,
                achievements: [],
                lastActivityDate: new Date().toISOString(),
                moduleProgress: {},
                totalQuestionsAnswered: 0,
                totalCorrectAnswers: 0
            };

            await firebaseService.updateLearningProgress(userId, defaultProgress);
            return defaultProgress;
        } catch (error) {
            console.error('Error resetting user progress:', error);
            throw error;
        }
    }
}

export default new UserProgressService();
