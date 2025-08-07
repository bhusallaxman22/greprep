// Firebase service for managing test data and user performance
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

class FirebaseService {
  constructor() {
    this.testResultsCollection = "testResults";
    this.questionsCollection = "questions";
    this.userStatsCollection = "userStats";
  }

  // Save test result to Firebase
  async saveTestResult(testResult) {
    try {
      const docRef = await addDoc(collection(db, this.testResultsCollection), {
        ...testResult,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error saving test result:", error);
      throw error;
    }
  }

  // Get all test results for a user
  async getUserTestResults(userId) {
    try {
      const q = query(
        collection(db, this.testResultsCollection),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching test results:", error);
      throw error;
    }
  }

  // Calculate user statistics
  async calculateUserStats(userId) {
    try {
      const testResults = await this.getUserTestResults(userId);

      if (testResults.length === 0) {
        return {
          totalTests: 0,
          totalQuestions: 0,
          overallAccuracy: 0,
          sectionBreakdown: {},
          recentPerformance: [],
          improvementTrend: 0,
        };
      }

      const totalTests = testResults.length;
      const totalQuestions = testResults.reduce(
        (sum, test) => sum + test.questions.length,
        0
      );
      const correctAnswers = testResults.reduce(
        (sum, test) => sum + test.questions.filter((q) => q.isCorrect).length,
        0
      );
      const overallAccuracy = (correctAnswers / totalQuestions) * 100;

      // Section breakdown
      const sectionBreakdown = {};
      testResults.forEach((test) => {
        test.questions.forEach((question) => {
          const section = question.section;
          if (!sectionBreakdown[section]) {
            sectionBreakdown[section] = { correct: 0, total: 0 };
          }
          sectionBreakdown[section].total++;
          if (question.isCorrect) {
            sectionBreakdown[section].correct++;
          }
        });
      });

      // Convert to percentages
      Object.keys(sectionBreakdown).forEach((section) => {
        const data = sectionBreakdown[section];
        sectionBreakdown[section].accuracy = (data.correct / data.total) * 100;
      });

      // Recent performance (last 5 tests)
      const recentPerformance = testResults.slice(0, 5).map((test) => {
        const correct = test.questions.filter((q) => q.isCorrect).length;
        const total = test.questions.length;
        return {
          date: test.createdAt,
          accuracy: (correct / total) * 100,
          testType: test.testType,
          section: test.section,
        };
      });

      // Calculate improvement trend
      let improvementTrend = 0;
      if (recentPerformance.length >= 2) {
        const recent = recentPerformance[0].accuracy;
        const previous =
          recentPerformance[recentPerformance.length - 1].accuracy;
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
    } catch (error) {
      console.error("Error calculating user stats:", error);
      throw error;
    }
  }

  // Save a question with user's answer
  async saveQuestionResponse(
    userId,
    question,
    userAnswer,
    isCorrect,
    timeSpent
  ) {
    try {
      // Ensure all required fields are present and not undefined
      const questionData = {
        userId,
        question: question.question || "",
        options: question.options || [],
        correctAnswer: question.correctAnswer || 0,
        userAnswer,
        isCorrect,
        timeSpent,
        section: question.section || "unknown",
        testType: question.testType || "unknown",
        difficulty: question.difficulty || "medium",
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      };

      // Validate that no fields are undefined
      for (const [key, value] of Object.entries(questionData)) {
        if (value === undefined) {
          console.warn(`Field ${key} is undefined, using default value`);
          if (key === "testType") questionData[key] = "unknown";
          if (key === "section") questionData[key] = "unknown";
          if (key === "difficulty") questionData[key] = "medium";
        }
      }

      const docRef = await addDoc(
        collection(db, this.questionsCollection),
        questionData
      );
      return docRef.id;
    } catch (error) {
      console.error("Error saving question response:", error);
      throw error;
    }
  }

  // Get weak areas for a user
  async getWeakAreas(userId, testType = null) {
    try {
      let q = query(
        collection(db, this.questionsCollection),
        where("userId", "==", userId)
      );

      if (testType) {
        q = query(q, where("testType", "==", testType));
      }

      const querySnapshot = await getDocs(q);
      const questions = querySnapshot.docs.map((doc) => doc.data());

      const sectionPerformance = {};
      questions.forEach((question) => {
        const section = question.section;
        if (!sectionPerformance[section]) {
          sectionPerformance[section] = { correct: 0, total: 0 };
        }
        sectionPerformance[section].total++;
        if (question.isCorrect) {
          sectionPerformance[section].correct++;
        }
      });

      // Return sections with accuracy below 70%
      const weakAreas = [];
      Object.keys(sectionPerformance).forEach((section) => {
        const accuracy =
          (sectionPerformance[section].correct /
            sectionPerformance[section].total) *
          100;
        if (accuracy < 70) {
          weakAreas.push({
            section,
            accuracy: Math.round(accuracy * 100) / 100,
            questionsAttempted: sectionPerformance[section].total,
          });
        }
      });

      return weakAreas.sort((a, b) => a.accuracy - b.accuracy);
    } catch (error) {
      console.error("Error getting weak areas:", error);
      throw error;
    }
  }

  // Learning Progress Methods
  async getUserLearningProgress(userId) {
    try {
      const docRef = doc(db, "learningProgress", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // Return default progress for new users
        const defaultProgress = {
          level: 1,
          xp: 0,
          streak: 0,
          completedLessons: 0,
          achievements: [],
          lastActivityDate: new Date().toISOString(),
          moduleProgress: {},
        };

        // Save default progress
        await setDoc(docRef, defaultProgress);
        return defaultProgress;
      }
    } catch (error) {
      console.error("Error getting learning progress:", error);
      throw error;
    }
  }

  async updateLearningProgress(userId, progress) {
    try {
      const docRef = doc(db, "learningProgress", userId);
      progress.lastActivityDate = new Date().toISOString();
      await setDoc(docRef, progress, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating learning progress:", error);
      throw error;
    }
  }

  async saveLessonCompletion(userId, lessonData) {
    try {
      const docRef = await addDoc(collection(db, "completedLessons"), {
        userId,
        ...lessonData,
        completedAt: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error saving lesson completion:", error);
      throw error;
    }
  }

  async getUserLessonHistory(userId, limit = 10) {
    try {
      const q = query(
        collection(db, "completedLessons"),
        where("userId", "==", userId),
        orderBy("completedAt", "desc"),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting lesson history:", error);
      throw error;
    }
  }
}

export default new FirebaseService();
