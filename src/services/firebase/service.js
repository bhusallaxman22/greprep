import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

class FirebaseService {
    constructor() {
        this.testResultsCollection = 'testResults';
        this.questionsCollection = 'questions';
        this.userStatsCollection = 'userStats';
    }

    async saveTestResult(testResult) {
        const docRef = await addDoc(collection(db, this.testResultsCollection), {
            ...testResult,
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString(),
        });
        return docRef.id;
    }

    async getUserTestResults(userId) {
        const q = query(collection(db, this.testResultsCollection), where('userId', '==', userId), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    async calculateUserStats(userId) {
        const testResults = await this.getUserTestResults(userId);
        if (testResults.length === 0) {
            return { totalTests: 0, totalQuestions: 0, overallAccuracy: 0, sectionBreakdown: {}, recentPerformance: [], improvementTrend: 0 };
        }
        const totalTests = testResults.length;
        const totalQuestions = testResults.reduce((sum, test) => sum + test.questions.length, 0);
        const correctAnswers = testResults.reduce((sum, test) => sum + test.questions.filter((q) => q.isCorrect).length, 0);
        const overallAccuracy = (correctAnswers / totalQuestions) * 100;

        const sectionBreakdown = {};
        testResults.forEach((test) => {
            test.questions.forEach((question) => {
                const section = question.section;
                if (!sectionBreakdown[section]) sectionBreakdown[section] = { correct: 0, total: 0 };
                sectionBreakdown[section].total++;
                if (question.isCorrect) sectionBreakdown[section].correct++;
            });
        });

        Object.keys(sectionBreakdown).forEach((section) => {
            const data = sectionBreakdown[section];
            sectionBreakdown[section].accuracy = (data.correct / data.total) * 100;
        });

        const recentPerformance = testResults.slice(0, 5).map((test) => {
            const correct = test.questions.filter((q) => q.isCorrect).length;
            const total = test.questions.length;
            return { date: test.createdAt, accuracy: (correct / total) * 100, testType: test.testType, section: test.section };
        });

        let improvementTrend = 0;
        if (recentPerformance.length >= 2) {
            const recent = recentPerformance[0].accuracy;
            const previous = recentPerformance[recentPerformance.length - 1].accuracy;
            improvementTrend = recent - previous;
        }

        return {
            totalTests,
            totalQuestions,
            overallAccuracy: Math.round(overallAccuracy * 100) / 100,
            sectionBreakdown,
            recentPerformance,
            improvementTrend: Math.round(improvementTrend * 100) / 100,
        };
    }

    async saveQuestionResponse(userId, question, userAnswer, isCorrect, timeSpent) {
        const questionData = {
            userId,
            question: question.question || '',
            options: question.options || [],
            correctAnswer: question.correctAnswer || 0,
            userAnswer,
            isCorrect,
            timeSpent,
            section: question.section || 'unknown',
            testType: question.testType || 'unknown',
            difficulty: question.difficulty || 'medium',
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, this.questionsCollection), questionData);
        return docRef.id;
    }

    async getWeakAreas(userId, testType = null) {
        let q = query(collection(db, this.questionsCollection), where('userId', '==', userId));
        if (testType) q = query(q, where('testType', '==', testType));

        const querySnapshot = await getDocs(q);
        const questions = querySnapshot.docs.map((doc) => doc.data());

        const sectionPerformance = {};
        questions.forEach((question) => {
            const section = question.section;
            if (!sectionPerformance[section]) sectionPerformance[section] = { correct: 0, total: 0 };
            sectionPerformance[section].total++;
            if (question.isCorrect) sectionPerformance[section].correct++;
        });

        const weakAreas = [];
        Object.keys(sectionPerformance).forEach((section) => {
            const accuracy = (sectionPerformance[section].correct / sectionPerformance[section].total) * 100;
            if (accuracy < 70) {
                weakAreas.push({ section, accuracy: Math.round(accuracy * 100) / 100, questionsAttempted: sectionPerformance[section].total });
            }
        });

        return weakAreas.sort((a, b) => a.accuracy - b.accuracy);
    }

    async getUserLearningProgress(userId) {
        const docRef = doc(db, 'learningProgress', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) return docSnap.data();

        const defaultProgress = { level: 1, xp: 0, streak: 0, completedLessons: 0, achievements: [], lastActivityDate: new Date().toISOString(), moduleProgress: {} };
        await setDoc(docRef, defaultProgress);
        return defaultProgress;
    }

    async updateLearningProgress(userId, progress) {
        const docRef = doc(db, 'learningProgress', userId);
        progress.lastActivityDate = new Date().toISOString();
        await setDoc(docRef, progress, { merge: true });
        return true;
    }

    async saveLessonCompletion(userId, lessonData) {
        const docRef = await addDoc(collection(db, 'completedLessons'), { userId, ...lessonData, completedAt: serverTimestamp(), createdAt: new Date().toISOString() });
        return docRef.id;
    }

    async getUserLessonHistory(userId, max = 10) {
        const q = query(collection(db, 'completedLessons'), where('userId', '==', userId), orderBy('completedAt', 'desc'), limit(max));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    async getCompletedModules(userId) {
        const q = query(collection(db, 'completedModules'), where('userId', '==', userId), orderBy('completedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    async getUserModuleScores(userId) {
        const q = query(collection(db, 'moduleScores'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const scores = {};
        querySnapshot.docs.forEach((docSnap) => { const data = docSnap.data(); scores[data.moduleId] = data; });
        return scores;
    }

    async getUserBookmarks(userId) {
        const docRef = doc(db, 'userBookmarks', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data().bookmarkedModules || [];
        return [];
    }

    async saveModuleCompletion(userId, moduleData) {
        const docRef = await addDoc(collection(db, 'completedModules'), { userId, ...moduleData, completedAt: serverTimestamp(), timestamp: new Date().toISOString() });
        return docRef.id;
    }

    async saveModuleScore(userId, moduleId, scoreData) {
        const docRef = doc(db, 'moduleScores', `${userId}_${moduleId}`);
        await setDoc(docRef, { userId, moduleId, ...scoreData, lastUpdated: serverTimestamp(), timestamp: new Date().toISOString() }, { merge: true });
    }

    async toggleModuleBookmark(userId, moduleId) {
        const docRef = doc(db, 'userBookmarks', userId);
        const docSnap = await getDoc(docRef);

        let bookmarkedModules = [];
        if (docSnap.exists()) bookmarkedModules = docSnap.data().bookmarkedModules || [];

        if (bookmarkedModules.includes(moduleId)) bookmarkedModules = bookmarkedModules.filter((id) => id !== moduleId);
        else bookmarkedModules.push(moduleId);

        await setDoc(docRef, { userId, bookmarkedModules, lastUpdated: serverTimestamp() });
        return bookmarkedModules;
    }

    async addBookmark(userId, moduleId) {
        const docRef = doc(db, 'userBookmarks', userId);
        const docSnap = await getDoc(docRef);

        let bookmarkedModules = [];
        if (docSnap.exists()) bookmarkedModules = docSnap.data().bookmarkedModules || [];

        if (!bookmarkedModules.includes(moduleId)) {
            bookmarkedModules.push(moduleId);
            await setDoc(docRef, { userId, bookmarkedModules, lastUpdated: serverTimestamp() });
        }
        return bookmarkedModules;
    }

    async removeBookmark(userId, moduleId) {
        const docRef = doc(db, 'userBookmarks', userId);
        const docSnap = await getDoc(docRef);

        let bookmarkedModules = [];
        if (docSnap.exists()) bookmarkedModules = docSnap.data().bookmarkedModules || [];

        bookmarkedModules = bookmarkedModules.filter((id) => id !== moduleId);
        await setDoc(docRef, { userId, bookmarkedModules, lastUpdated: serverTimestamp() });
        return bookmarkedModules;
    }

    async getBookmarkedModules(userId) {
        const docRef = doc(db, 'userBookmarks', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().bookmarkedModules || [];
        }
        return [];
    }

    async saveLearningSession(userId, sessionData) {
        const docRef = await addDoc(collection(db, 'learningSessions'), { userId, ...sessionData, startTime: serverTimestamp(), timestamp: new Date().toISOString() });
        return docRef.id;
    }

    async completeModule(userId, moduleData) {
        try {
            // Save learning session for the completed module
            await this.saveLearningSession(userId, {
                moduleId: moduleData.id,
                moduleName: moduleData.title,
                xpEarned: moduleData.xpReward || 0,
                accuracy: moduleData.accuracy || 0,
                timeSpent: moduleData.duration || 0,
                sessionType: 'module_completion',
                completedAt: new Date().toISOString()
            });

            // Update user stats
            const userStatsRef = doc(db, 'userStats', userId);
            const userStatsDoc = await getDoc(userStatsRef);

            let currentStats = {};
            if (userStatsDoc.exists()) {
                currentStats = userStatsDoc.data();
            }

            const completedModules = currentStats.completedModules || [];
            if (!completedModules.includes(moduleData.id)) {
                completedModules.push(moduleData.id);
            }

            const newTotalXP = (currentStats.totalXP || 0) + (moduleData.xpReward || 0);
            const accuracy = moduleData.accuracy || 0;
            const previousAccuracy = currentStats.accuracy || 0;
            const newAccuracy = completedModules.length === 1
                ? accuracy
                : Math.round(((previousAccuracy * (completedModules.length - 1)) + accuracy) / completedModules.length);

            // Update streak
            const today = new Date().toDateString();
            const lastActiveDate = currentStats.lastActiveDate;
            let streakDays = currentStats.streakDays || 0;

            if (lastActiveDate !== today) {
                if (lastActiveDate) {
                    const lastDate = new Date(lastActiveDate);
                    const todayDate = new Date(today);
                    const dayDifference = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

                    if (dayDifference === 1) {
                        streakDays += 1;
                    } else if (dayDifference > 1) {
                        streakDays = 1; // Reset streak but count today
                    }
                } else {
                    streakDays = 1; // First day
                }
            }

            const updatedStats = {
                ...currentStats,
                completedModules,
                totalXP: newTotalXP,
                accuracy: newAccuracy,
                streakDays,
                lastActiveDate: today,
                modulesCompleted: completedModules.length,
                lastModuleCompleted: moduleData.id,
                lastCompletedAt: new Date().toISOString(),
                lastUpdated: serverTimestamp()
            };

            await setDoc(userStatsRef, updatedStats);
            return updatedStats;
        } catch (error) {
            console.error("Error completing module:", error);
            throw error;
        }
    }

    async getUserStats(userId) {
        try {
            const userStatsRef = doc(db, 'userStats', userId);
            const userStatsDoc = await getDoc(userStatsRef);

            if (userStatsDoc.exists()) {
                return userStatsDoc.data();
            } else {
                // Return default stats for new users
                return {
                    completedModules: [],
                    totalXP: 0,
                    accuracy: 0,
                    streakDays: 0,
                    modulesCompleted: 0,
                    lastActiveDate: null,
                };
            }
        } catch (error) {
            console.error("Error getting user stats:", error);
            return {
                completedModules: [],
                totalXP: 0,
                accuracy: 0,
                streakDays: 0,
                modulesCompleted: 0,
                lastActiveDate: null,
            };
        }
    }

    async getUserAchievements(userId) {
        const q = query(collection(db, 'userAchievements'), where('userId', '==', userId), orderBy('earnedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    async awardAchievement(userId, achievementData) {
        // Check if achievement already exists
        const q = query(
            collection(db, 'userAchievements'),
            where('userId', '==', userId),
            where('badge', '==', achievementData.badge)
        );
        const existingAchievements = await getDocs(q);

        if (existingAchievements.empty) {
            const docRef = await addDoc(collection(db, 'userAchievements'), {
                userId,
                ...achievementData,
                earnedAt: serverTimestamp(),
                timestamp: new Date().toISOString()
            });
            return docRef.id;
        }
        return null; // Achievement already exists
    }
}

const firebaseService = new FirebaseService();
export default firebaseService;
