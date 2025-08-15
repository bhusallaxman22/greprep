import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  IconButton,
  Fade,
  Alert,
  Fab,
} from "@mui/material";
import {
  ArrowBack,
  MenuBook,
  Psychology,
  Calculate,
  Create,
  Assessment,
  KeyboardArrowUp,
} from "@mui/icons-material";
import PropTypes from "prop-types";

import useAuth from "../../context/useAuth";
import firebaseService from "../../services/firebase";
import LoadingSpinner from "../atoms/LoadingSpinner";
import LearningDashboard from "../organisms/LearningDashboard";
import LearningFilters from "../molecules/LearningFilters";
import LearningModuleCard from "../molecules/LearningModuleCard";
import AchievementPanel from "../organisms/AchievementPanel";
import {
  getRequiredLevelForDifficulty,
  coerceLevel,
} from "../../constants/moduleUnlocks";

/**
 * Streamlined learning page with improved UX and organization
 */
const StreamlinedLearning = ({ onBack, onStartModule }) => {
  const { user } = useAuth();

  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [userProgress, setUserProgress] = useState({});
  const [bookmarkedModules, setBookmarkedModules] = useState([]);
  const baseModulesRef = useRef([]);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  // UI state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Categories configuration
  const categories = useMemo(
    () => [
      {
        id: "all",
        label: "All Modules",
        icon: <MenuBook />,
        color: "primary",
      },
      {
        id: "verbal",
        label: "Verbal Reasoning",
        icon: <Psychology />,
        color: "success",
      },
      {
        id: "quantitative",
        label: "Quantitative",
        icon: <Calculate />,
        color: "info",
      },
      {
        id: "analytical",
        label: "Analytical Writing",
        icon: <Create />,
        color: "warning",
      },
      {
        id: "integrated",
        label: "Integrated Reasoning",
        icon: <Assessment />,
        color: "secondary",
      },
    ],
    []
  );

  // Generate learning modules
  const generateModules = useCallback(() => {
    // Return static base catalog (no unlock computation here)
    return [
      // 🎯 VERBAL REASONING PATH
      {
        id: "vocabulary-foundations",
        title: "🎯 Vocabulary Foundations",
        description:
          "Master essential high-frequency words with smart mnemonics and context clues. Build your word power foundation!",
        category: "verbal",
        difficulty: "beginner",
        duration: 25,
        questionCount: 20,
        xpReward: 100,
        prerequisites: [],
        badges: ["Word Warrior", "Foundation Builder"],
        streak: true,
        gamified: { type: "flash_cards", points: 5, combo_multiplier: 2 },
      },
      {
        id: "advanced-vocabulary",
        title: "🔥 Advanced Vocabulary Arsenal",
        description:
          "Conquer sophisticated vocabulary with Latin roots, academic terms, and nuanced meanings. Become unstoppable!",
        category: "verbal",
        difficulty: "intermediate",
        duration: 35,
        questionCount: 25,
        xpReward: 180,
        prerequisites: ["vocabulary-foundations"],
        badges: ["Vocabulary Master", "Word Ninja"],
        streak: true,
        gamified: { type: "boss_battle", points: 8, combo_multiplier: 3 },
      },
      {
        id: "reading-comprehension-sprint",
        title: "⚡ Reading Comprehension Sprint",
        description:
          "Speed through complex passages while maintaining accuracy. Master skimming, scanning, and deep analysis!",
        category: "verbal",
        difficulty: "intermediate",
        duration: 40,
        questionCount: 15,
        xpReward: 200,
        prerequisites: ["vocabulary-foundations"],
        badges: ["Speed Reader", "Comprehension King"],
        streak: true,
        gamified: { type: "time_challenge", points: 10, combo_multiplier: 2.5 },
      },
      {
        id: "critical-reasoning-detective",
        title: "🔍 Critical Reasoning Detective",
        description:
          "Become a logic detective! Strengthen arguments, find flaws, and master assumption identification.",
        category: "verbal",
        difficulty: "advanced",
        duration: 50,
        questionCount: 18,
        xpReward: 250,
        prerequisites: ["reading-comprehension-sprint"],
        badges: ["Logic Detective", "Argument Crusher"],
        streak: true,
        gamified: { type: "mystery_solving", points: 12, combo_multiplier: 4 },
      },
      {
        id: "sentence-completion-master",
        title: "🎨 Sentence Completion Master",
        description:
          "Paint perfect sentences! Master context clues, tone, and logical flow for flawless completions.",
        category: "verbal",
        difficulty: "intermediate",
        duration: 30,
        questionCount: 22,
        xpReward: 170,
        prerequisites: ["vocabulary-foundations"],
        badges: ["Sentence Artist", "Context Master"],
        streak: true,
        gamified: { type: "puzzle_solve", points: 7, combo_multiplier: 2.5 },
      },

      // 🔢 QUANTITATIVE REASONING PATH
      {
        id: "math-foundations-bootcamp",
        title: "🔢 Math Foundations Bootcamp",
        description:
          "Transform your number sense! Master arithmetic, fractions, percentages, and basic algebra with confidence.",
        category: "quantitative",
        difficulty: "beginner",
        duration: 35,
        questionCount: 30,
        xpReward: 120,
        prerequisites: [],
        badges: ["Number Ninja", "Foundation Master"],
        streak: true,
        gamified: { type: "training_camp", points: 6, combo_multiplier: 2 },
      },
      {
        id: "algebra-warrior",
        title: "⚔️ Algebra Warrior",
        description:
          "Conquer equations, inequalities, and functions! Become an algebra champion with systematic problem-solving.",
        category: "quantitative",
        difficulty: "intermediate",
        duration: 45,
        questionCount: 25,
        xpReward: 180,
        prerequisites: ["math-foundations-bootcamp"],
        badges: ["Algebra Warrior", "Equation Slayer"],
        streak: true,
        gamified: { type: "boss_battle", points: 9, combo_multiplier: 3 },
      },
      {
        id: "geometry-architect",
        title: "📐 Geometry Architect",
        description:
          "Build geometric mastery! Design solutions for areas, volumes, coordinate geometry, and spatial reasoning.",
        category: "quantitative",
        difficulty: "intermediate",
        duration: 40,
        questionCount: 22,
        xpReward: 160,
        prerequisites: ["math-foundations-bootcamp"],
        badges: ["Geometry Architect", "Shape Master"],
        streak: true,
        gamified: { type: "building_game", points: 8, combo_multiplier: 2.5 },
      },
      {
        id: "data-science-explorer",
        title: "📊 Data Science Explorer",
        description:
          "Decode data mysteries! Master statistics, probability, graphs, and data interpretation like a pro analyst.",
        category: "quantitative",
        difficulty: "advanced",
        duration: 50,
        questionCount: 28,
        xpReward: 220,
        prerequisites: ["algebra-warrior", "geometry-architect"],
        badges: ["Data Detective", "Statistics Sage"],
        streak: true,
        gamified: { type: "exploration", points: 11, combo_multiplier: 3.5 },
      },
      {
        id: "word-problems-champion",
        title: "🏆 Word Problems Champion",
        description:
          "Translate real-world scenarios into mathematical victories! Master complex multi-step problem solving.",
        category: "quantitative",
        difficulty: "advanced",
        duration: 45,
        questionCount: 20,
        xpReward: 200,
        prerequisites: ["algebra-warrior"],
        badges: ["Problem Solver", "Real-World Master"],
        streak: true,
        gamified: { type: "championship", points: 10, combo_multiplier: 3 },
      },

      // ✍️ ANALYTICAL WRITING PATH
      {
        id: "essay-structure-architect",
        title: "✍️ Essay Structure Architect",
        description:
          "Build bulletproof essays! Master introductions, body paragraphs, conclusions, and logical flow.",
        category: "analytical",
        difficulty: "beginner",
        duration: 30,
        questionCount: 12,
        xpReward: 130,
        prerequisites: [],
        badges: ["Essay Architect", "Structure Master"],
        streak: true,
        gamified: { type: "building_game", points: 7, combo_multiplier: 2 },
      },
      {
        id: "argument-analysis-judge",
        title: "⚖️ Argument Analysis Judge",
        description:
          "Become a critical thinking judge! Evaluate evidence, identify flaws, and craft persuasive counterarguments.",
        category: "analytical",
        difficulty: "intermediate",
        duration: 40,
        questionCount: 10,
        xpReward: 170,
        prerequisites: ["essay-structure-architect"],
        badges: ["Argument Judge", "Critical Thinker"],
        streak: true,
        gamified: { type: "courtroom_drama", points: 9, combo_multiplier: 3 },
      },
      {
        id: "persuasive-writing-master",
        title: "🎯 Persuasive Writing Master",
        description:
          "Craft compelling arguments that convince! Master rhetoric, evidence selection, and persuasive techniques.",
        category: "analytical",
        difficulty: "advanced",
        duration: 45,
        questionCount: 8,
        xpReward: 190,
        prerequisites: ["argument-analysis-judge"],
        badges: ["Persuasion Master", "Rhetoric King"],
        streak: true,
        gamified: { type: "influence_game", points: 10, combo_multiplier: 3.5 },
      },

      // 🧩 INTEGRATED REASONING PATH (GMAT)
      {
        id: "graphics-interpretation-wizard",
        title: "📊 Graphics Wizard",
        description:
          "Decode visual data like a wizard! Master charts, graphs, and data visualization interpretation.",
        category: "integrated",
        difficulty: "intermediate",
        duration: 35,
        questionCount: 15,
        xpReward: 160,
        prerequisites: [],
        badges: ["Chart Wizard", "Visual Master"],
        streak: true,
        gamified: { type: "puzzle_solve", points: 8, combo_multiplier: 2.5 },
      },
      {
        id: "multi-source-detective",
        title: "🔍 Multi-Source Detective",
        description:
          "Synthesize information from multiple sources like a master detective! Connect clues across documents.",
        category: "integrated",
        difficulty: "advanced",
        duration: 50,
        questionCount: 18,
        xpReward: 210,
        prerequisites: ["graphics-interpretation-wizard"],
        badges: ["Info Detective", "Synthesis Master"],
        streak: true,
        gamified: { type: "mystery_solving", points: 11, combo_multiplier: 4 },
      },
      {
        id: "two-part-analysis-expert",
        title: "🧩 Two-Part Analysis Expert",
        description:
          "Master complex two-part logical puzzles! Develop systematic approaches to multi-component problems.",
        category: "integrated",
        difficulty: "advanced",
        duration: 40,
        questionCount: 12,
        xpReward: 180,
        prerequisites: ["graphics-interpretation-wizard"],
        badges: ["Logic Expert", "Puzzle Master"],
        streak: true,
        gamified: { type: "puzzle_challenge", points: 9, combo_multiplier: 3 },
      },

      // 🏃‍♂️ SPEED & STRATEGY MODULES
      {
        id: "speed-demon-training",
        title: "🏃‍♂️ Speed Demon Training",
        description:
          "Become lightning fast! Master time management, quick calculations, and strategic elimination.",
        category: "verbal",
        difficulty: "intermediate",
        duration: 25,
        questionCount: 30,
        xpReward: 150,
        prerequisites: ["vocabulary-foundations"],
        badges: ["Speed Demon", "Time Master"],
        streak: true,
        gamified: { type: "racing", points: 8, combo_multiplier: 3 },
      },
      {
        id: "elimination-ninja",
        title: "🥷 Elimination Ninja",
        description:
          "Master the art of strategic elimination! Learn to spot wrong answers instantly and boost accuracy.",
        category: "verbal",
        difficulty: "intermediate",
        duration: 30,
        questionCount: 20,
        xpReward: 140,
        prerequisites: ["vocabulary-foundations"],
        badges: ["Elimination Ninja", "Strategy Master"],
        streak: true,
        gamified: { type: "stealth_mission", points: 7, combo_multiplier: 2.5 },
      },

      // 🎖️ CHALLENGE MODULES
      {
        id: "mixed-martial-arts",
        title: "🥊 Mixed Question Martial Arts",
        description:
          "Ultimate challenge! Face mixed question types in rapid succession. Only for the brave!",
        category: "verbal",
        difficulty: "expert",
        duration: 60,
        questionCount: 35,
        xpReward: 300,
        prerequisites: ["critical-reasoning-detective", "algebra-warrior"],
        badges: ["Ultimate Fighter", "Grand Master"],
        streak: true,
        gamified: { type: "tournament", points: 15, combo_multiplier: 5 },
      },
      {
        id: "boss-battle-verbal",
        title: "👑 Verbal Boss Battle",
        description:
          "Face the ultimate verbal challenge! Defeat the most difficult questions to claim your crown.",
        category: "verbal",
        difficulty: "expert",
        duration: 45,
        questionCount: 20,
        xpReward: 280,
        prerequisites: ["critical-reasoning-detective", "advanced-vocabulary"],
        badges: ["Verbal Boss", "Crown Holder"],
        streak: true,
        gamified: { type: "boss_battle", points: 14, combo_multiplier: 4.5 },
      },
      {
        id: "quant-olympiad",
        title: "🏅 Quantitative Olympiad",
        description:
          "Compete in the math olympics! Solve the most challenging quantitative problems for eternal glory.",
        category: "quantitative",
        difficulty: "expert",
        duration: 55,
        questionCount: 25,
        xpReward: 320,
        prerequisites: ["data-science-explorer", "word-problems-champion"],
        badges: ["Math Olympian", "Gold Medalist"],
        streak: true,
        gamified: { type: "olympics", points: 16, combo_multiplier: 5 },
      },
    ];
  }, []);

  const applyUnlockLogic = useCallback((catalog, stats, progress) => {
    const level = coerceLevel(stats.level || 1);
    const completedSet = new Set(
      Object.entries(progress)
        .filter(([, v]) => v.completed)
        .map(([id]) => id)
    );
    const diffRankMap = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };
    const enriched = catalog.map((m) => {
      const diffRank = diffRankMap[m.difficulty] || 1;
      const requiredLevel = getRequiredLevelForDifficulty(diffRank);
      const prereqOk =
        !m.prerequisites?.length ||
        m.prerequisites.every((p) => completedSet.has(p));
      // Soft unlock: only level gate; prerequisites become recommendations
      const unlocked = level >= requiredLevel;
      const pendingPrereqs = (m.prerequisites || []).filter(
        (p) => !completedSet.has(p)
      );
      return { ...m, unlocked, requiredLevel, prereqOk, pendingPrereqs };
    });
    return enriched;
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch base remote data once
        const [stats, moduleScores, bookmarks] = await Promise.all([
          firebaseService.getUserStats(user.uid).catch(() => ({
            completedModules: [],
            totalXP: 0,
            accuracy: 0,
            streakDays: 0,
            modulesCompleted: 0,
          })),
          firebaseService.getUserModuleScores(user.uid).catch(() => ({})),
          firebaseService.getBookmarkedModules(user.uid).catch(() => []),
        ]);

        const transformedStats = {
          level: Math.floor((stats.totalXP || 0) / 500) + 1,
          currentXP: stats.totalXP || 0,
          nextLevelXP: (Math.floor((stats.totalXP || 0) / 500) + 1) * 500,
          streak: stats.streakDays || 0,
          completedModules: stats.modulesCompleted || 0,
          totalModules: baseModulesRef.current.length || 0,
          averageScore: stats.accuracy || 0,
          ...stats,
        };

        const transformedProgress = {};
        Object.entries(moduleScores).forEach(([moduleId, scoreData]) => {
          transformedProgress[moduleId] = {
            completed: scoreData.accuracy >= 80,
            completion: scoreData.accuracy || 0,
          };
        });

        // Initialize base catalog only once
        if (baseModulesRef.current.length === 0) {
          baseModulesRef.current = generateModules();
        }

        setUserStats(transformedStats);
        setUserProgress(transformedProgress);
        setBookmarkedModules(bookmarks);

        // Initial unlock computation
        const enriched = applyUnlockLogic(
          baseModulesRef.current,
          transformedStats,
          transformedProgress
        );
        setModules(enriched);
      } catch (err) {
        console.error("Error loading learning data:", err);
        setError("Failed to load learning modules. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadData();
    }
  }, [user?.uid, generateModules, applyUnlockLogic]);

  // Recompute unlocks when level/progress changes (without refetching)
  useEffect(() => {
    if (!baseModulesRef.current.length) return;
    setModules(
      applyUnlockLogic(baseModulesRef.current, userStats, userProgress)
    );
  }, [userStats, userProgress, applyUnlockLogic]);

  // Get recommendation score for sorting
  const getRecommendationScore = useCallback(
    (module) => {
      let score = 0;
      const prerequisitesMet =
        module.prerequisites?.every(
          (prereq) => userProgress[prereq]?.completed
        ) ?? true;
      if (prerequisitesMet) score += 100;
      const progress = userProgress[module.id]?.completion || 0;
      if (progress > 0 && progress < 100) score += 50;
      if (bookmarkedModules.includes(module.id)) score += 30;
      if (module.difficulty === "beginner") score += 10;
      return score;
    },
    [userProgress, bookmarkedModules]
  );

  // Filter and sort modules
  const filteredModules = useMemo(() => {
    let filtered = modules.slice();

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (module) => module.category === selectedCategory
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (module) =>
          module.title.toLowerCase().includes(query) ||
          module.description.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    if (difficulty !== "all") {
      filtered = filtered.filter((module) => module.difficulty === difficulty);
    }

    // Sort modules
    filtered.sort((a, b) => {
      // Always show unlocked before locked
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "difficulty": {
          const difficultyOrder = {
            beginner: 1,
            intermediate: 2,
            advanced: 3,
            expert: 4,
          };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }
        case "duration":
          return a.duration - b.duration;
        case "progress": {
          const progressA = userProgress[a.id]?.completion || 0;
          const progressB = userProgress[b.id]?.completion || 0;
          return progressB - progressA;
        }
        case "recommended":
        default: {
          const scoreA = getRecommendationScore(a);
          const scoreB = getRecommendationScore(b);
          return scoreB - scoreA;
        }
      }
    });

    return filtered;
  }, [
    modules,
    selectedCategory,
    searchQuery,
    difficulty,
    sortBy,
    userProgress,
    getRecommendationScore,
  ]);

  // Add categories count
  const categoriesWithCount = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      count:
        category.id === "all"
          ? modules.length
          : modules.filter((m) => m.category === category.id).length,
    }));
  }, [categories, modules]);

  // Check if module is locked
  const isModuleLocked = useCallback((module) => {
    return !module.unlocked; // only level-based
  }, []);

  // Handle module start
  const handleStartModule = (module) => {
    if (onStartModule) {
      onStartModule(module);
    }
  };

  // Handle bookmark toggle
  const handleToggleBookmark = async (moduleId) => {
    try {
      const isBookmarked = bookmarkedModules.includes(moduleId);
      if (isBookmarked) {
        await firebaseService.removeBookmark(user.uid, moduleId);
        setBookmarkedModules((prev) => prev.filter((id) => id !== moduleId));
      } else {
        await firebaseService.addBookmark(user.uid, moduleId);
        setBookmarkedModules((prev) => [...prev, moduleId]);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  // Scroll handlers
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <LoadingSpinner size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600, flexGrow: 1 }}>
          Learning Center
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Dashboard */}
      <LearningDashboard user={user} userStats={userStats} />

      {/* Achievement Panel */}
      <AchievementPanel
        completedModules={userStats.completedModules || []}
        totalXP={userStats.totalXP || 0}
        streakDays={userStats.streakDays || 0}
        accuracy={userStats.accuracy || 0}
        modulesCompleted={userStats.completedModules?.length || 0}
      />

      {/* Filters */}
      <LearningFilters
        categories={categoriesWithCount}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        sortBy={sortBy}
        onSortChange={setSortBy}
        moduleCount={modules.length}
        filteredCount={filteredModules.length}
      />

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No modules found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or search query.
          </Typography>
        </Box>
      ) : (
        <Fade in timeout={300}>
          <Grid container spacing={3}>
            {filteredModules.map((module) => (
              <Grid item xs={12} sm={6} lg={4} key={module.id}>
                <LearningModuleCard
                  module={module}
                  isCompleted={userProgress[module.id]?.completed || false}
                  isLocked={isModuleLocked(module)}
                  isBookmarked={bookmarkedModules.includes(module.id)}
                  progress={userProgress[module.id]?.completion || 0}
                  onStart={handleStartModule}
                  onToggleBookmark={handleToggleBookmark}
                />
                {module.unlocked && module.pendingPrereqs?.length > 0 && (
                  <Box
                    sx={{ mt: 1, fontSize: "0.7rem", color: "warning.main" }}
                  >
                    Suggested to complete first:{" "}
                    {module.pendingPrereqs.join(", ")}
                  </Box>
                )}
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}

      {/* Scroll to Top FAB */}
      <Fade in={showScrollTop}>
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Fade>
    </Container>
  );
};

StreamlinedLearning.propTypes = {
  onBack: PropTypes.func.isRequired,
  onStartModule: PropTypes.func,
};

export default StreamlinedLearning;
