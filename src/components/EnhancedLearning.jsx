import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Divider,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Skeleton,
  Fade,
  Slide,
  Zoom,
  Grow,
  Collapse,
} from "@mui/material";
import {
  School,
  Star,
  LocalFireDepartment,
  EmojiEvents,
  PlayArrow,
  CheckCircle,
  AutoAwesome,
  Psychology,
  ArrowBack,
  Search,
  FilterList,
  BookmarkBorder,
  Bookmark,
  Timer,
  QuestionAnswer,
  MenuBook,
  Assessment,
  Visibility,
  Replay,
  Extension,
  Biotech,
  Calculate,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import firebaseService from "../services/firebase";
import openRouterService from "../services/openrouter";

const EnhancedLearning = ({ onBack, onStartModule }) => {
  const { user } = useAuth();

  // Enhanced State Management
  const [userProfile, setUserProfile] = useState({
    level: 1,
    xp: 0,
    totalXP: 0,
    streak: 0,
    completedModules: 0,
    totalTimeSpent: 0,
    achievements: [],
    preferences: {
      difficulty: "adaptive",
      studyTime: 30,
      reminderEnabled: true,
    },
  });

  const [learningModules, setLearningModules] = useState([]);
  const [completedModules, setCompletedModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleProgress, setModuleProgress] = useState({});
  const [userScores, setUserScores] = useState({});

  // UI State
  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedModules, setBookmarkedModules] = useState([]);

  // Dialog States
  const [instructionsDialog, setInstructionsDialog] = useState(false);
  const [moduleInstructions, setModuleInstructions] = useState("");

  // Enhanced Categories
  const categories = [
    { id: "all", label: "All Modules", icon: <MenuBook />, color: "primary" },
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
      icon: <Biotech />,
      color: "warning",
    },
    {
      id: "integrated",
      label: "Integrated Reasoning",
      icon: <Extension />,
      color: "secondary",
    },
  ];

  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner", color: "success" },
    { value: "intermediate", label: "Intermediate", color: "warning" },
    { value: "advanced", label: "Advanced", color: "error" },
    { value: "expert", label: "Expert", color: "secondary" },
  ];

  // Load Enhanced Learning Data
  const loadLearningData = useCallback(async () => {
    try {
      setLoading(true);

      // Load comprehensive user data
      const [progress, modules, completed, scores, bookmarks] =
        await Promise.all([
          firebaseService.getUserLearningProgress(user.uid),
          generateEnhancedModules(),
          firebaseService.getCompletedModules(user.uid),
          firebaseService.getUserModuleScores(user.uid),
          firebaseService.getUserBookmarks(user.uid),
        ]);

      setUserProfile(progress);
      setLearningModules(modules);
      setCompletedModules(completed);
      setUserScores(scores);
      setBookmarkedModules(bookmarks);

      // Calculate module progress
      const progressMap = {};
      modules.forEach((module) => {
        const moduleScore = scores[module.id];
        if (moduleScore) {
          progressMap[module.id] = {
            completed: moduleScore.questionsAnswered,
            total: module.totalQuestions,
            accuracy: moduleScore.accuracy,
            timeSpent: moduleScore.timeSpent,
          };
        }
      });
      setModuleProgress(progressMap);
    } catch (error) {
      console.error("Error loading learning data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Generate Enhanced Learning Modules
  const generateEnhancedModules = async () => {
    const modules = [
      // Verbal Reasoning Modules
      {
        id: "vocabulary-foundation",
        title: "Vocabulary Foundation",
        description:
          "Build your vocabulary foundation with essential words and strategies",
        category: "verbal",
        difficulty: "beginner",
        estimatedTime: 45,
        totalQuestions: 25,
        xpReward: 100,
        conceptsCount: 8,
        practiceProblems: 15,
        unlocked: true,
        featured: true,
        rating: 4.8,
        enrolledCount: 12543,
        completionRate: 87,
        tags: ["vocabulary", "fundamentals", "beginner-friendly"],
        prerequisite: null,
        learningObjectives: [
          "Master 200+ essential vocabulary words",
          "Learn root words and prefixes",
          "Practice context-based vocabulary questions",
          "Develop memory techniques for retention",
        ],
      },
      {
        id: "advanced-vocabulary",
        title: "Advanced Vocabulary Mastery",
        description:
          "Master sophisticated vocabulary for high-level test performance",
        category: "verbal",
        difficulty: "advanced",
        estimatedTime: 75,
        totalQuestions: 40,
        xpReward: 200,
        conceptsCount: 12,
        practiceProblems: 25,
        unlocked: true,
        featured: false,
        rating: 4.9,
        enrolledCount: 8392,
        completionRate: 78,
        tags: ["vocabulary", "advanced", "high-frequency"],
        prerequisite: "vocabulary-foundation",
        learningObjectives: [
          "Learn 500+ advanced vocabulary words",
          "Master nuanced word meanings",
          "Practice advanced sentence completion",
          "Develop sophisticated writing vocabulary",
        ],
      },
      {
        id: "reading-comprehension-basics",
        title: "Reading Comprehension Fundamentals",
        description:
          "Master the art of understanding and analyzing complex passages",
        category: "verbal",
        difficulty: "intermediate",
        estimatedTime: 60,
        totalQuestions: 30,
        xpReward: 150,
        conceptsCount: 10,
        practiceProblems: 20,
        unlocked: true,
        featured: true,
        rating: 4.7,
        enrolledCount: 15678,
        completionRate: 82,
        tags: ["reading", "comprehension", "analysis"],
        prerequisite: null,
        learningObjectives: [
          "Learn active reading strategies",
          "Practice identifying main ideas",
          "Master inference techniques",
          "Develop speed reading skills",
        ],
      },
      {
        id: "critical-reasoning",
        title: "Critical Reasoning Mastery",
        description: "Develop logical thinking and argument analysis skills",
        category: "verbal",
        difficulty: "advanced",
        estimatedTime: 90,
        totalQuestions: 35,
        xpReward: 250,
        conceptsCount: 15,
        practiceProblems: 30,
        unlocked: true,
        featured: false,
        rating: 4.6,
        enrolledCount: 7234,
        completionRate: 71,
        tags: ["logic", "reasoning", "arguments"],
        prerequisite: "reading-comprehension-basics",
        learningObjectives: [
          "Analyze logical arguments",
          "Identify assumptions and conclusions",
          "Practice strengthening/weakening arguments",
          "Master formal logic principles",
        ],
      },

      // Quantitative Modules
      {
        id: "arithmetic-fundamentals",
        title: "Arithmetic & Number Properties",
        description: "Master basic arithmetic and number theory concepts",
        category: "quantitative",
        difficulty: "beginner",
        estimatedTime: 50,
        totalQuestions: 35,
        xpReward: 120,
        conceptsCount: 12,
        practiceProblems: 25,
        unlocked: true,
        featured: true,
        rating: 4.8,
        enrolledCount: 18456,
        completionRate: 89,
        tags: ["arithmetic", "numbers", "basics"],
        prerequisite: null,
        learningObjectives: [
          "Master basic arithmetic operations",
          "Understand number properties",
          "Learn divisibility rules",
          "Practice mental math techniques",
        ],
      },
      {
        id: "algebra-mastery",
        title: "Algebra & Equations",
        description: "Solve complex algebraic equations and inequalities",
        category: "quantitative",
        difficulty: "intermediate",
        estimatedTime: 80,
        totalQuestions: 45,
        xpReward: 180,
        conceptsCount: 16,
        practiceProblems: 35,
        unlocked: true,
        featured: false,
        rating: 4.5,
        enrolledCount: 13287,
        completionRate: 76,
        tags: ["algebra", "equations", "functions"],
        prerequisite: "arithmetic-fundamentals",
        learningObjectives: [
          "Solve linear and quadratic equations",
          "Master systems of equations",
          "Understand function concepts",
          "Practice word problems",
        ],
      },
      {
        id: "geometry-coordinate",
        title: "Geometry & Coordinate Systems",
        description: "Master geometric concepts and coordinate geometry",
        category: "quantitative",
        difficulty: "intermediate",
        estimatedTime: 70,
        totalQuestions: 40,
        xpReward: 160,
        conceptsCount: 14,
        practiceProblems: 30,
        unlocked: true,
        featured: true,
        rating: 4.7,
        enrolledCount: 11543,
        completionRate: 80,
        tags: ["geometry", "coordinates", "shapes"],
        prerequisite: "arithmetic-fundamentals",
        learningObjectives: [
          "Calculate areas and perimeters",
          "Master coordinate geometry",
          "Understand geometric properties",
          "Practice 3D geometry",
        ],
      },
      {
        id: "data-analysis",
        title: "Data Analysis & Statistics",
        description:
          "Analyze data, interpret charts, and understand statistics",
        category: "quantitative",
        difficulty: "advanced",
        estimatedTime: 85,
        totalQuestions: 38,
        xpReward: 220,
        conceptsCount: 18,
        practiceProblems: 32,
        unlocked: true,
        featured: false,
        rating: 4.6,
        enrolledCount: 9876,
        completionRate: 73,
        tags: ["statistics", "data", "analysis"],
        prerequisite: "algebra-mastery",
        learningObjectives: [
          "Interpret statistical data",
          "Calculate probability",
          "Analyze charts and graphs",
          "Understand distributions",
        ],
      },

      // Analytical Writing Modules
      {
        id: "essay-structure",
        title: "Essay Structure & Organization",
        description: "Learn to write well-structured, compelling essays",
        category: "analytical",
        difficulty: "intermediate",
        estimatedTime: 60,
        totalQuestions: 20,
        xpReward: 140,
        conceptsCount: 8,
        practiceProblems: 12,
        unlocked: true,
        featured: true,
        rating: 4.7,
        enrolledCount: 14567,
        completionRate: 85,
        tags: ["writing", "essays", "structure"],
        prerequisite: null,
        learningObjectives: [
          "Master essay organization",
          "Learn effective introductions",
          "Practice body paragraph development",
          "Write strong conclusions",
        ],
      },
      {
        id: "argument-analysis",
        title: "Argument Analysis Writing",
        description: "Analyze and critique arguments in written form",
        category: "analytical",
        difficulty: "advanced",
        estimatedTime: 75,
        totalQuestions: 18,
        xpReward: 190,
        conceptsCount: 10,
        practiceProblems: 15,
        unlocked: true,
        featured: false,
        rating: 4.5,
        enrolledCount: 8934,
        completionRate: 72,
        tags: ["arguments", "analysis", "writing"],
        prerequisite: "essay-structure",
        learningObjectives: [
          "Analyze argument structure",
          "Identify logical flaws",
          "Write effective critiques",
          "Practice timed writing",
        ],
      },

      // Additional Verbal Modules
      {
        id: "sentence-equivalence",
        title: "Sentence Equivalence Mastery",
        description: "Master complex sentence equivalence questions with dual-answer strategies",
        category: "verbal",
        difficulty: "intermediate",
        estimatedTime: 50,
        totalQuestions: 35,
        xpReward: 150,
        conceptsCount: 8,
        practiceProblems: 20,
        unlocked: true,
        featured: false,
        rating: 4.7,
        enrolledCount: 7234,
        completionRate: 82,
        tags: ["sentence-equivalence", "strategy", "verbal"],
        prerequisite: "vocabulary-foundation",
        learningObjectives: [
          "Understand dual-answer requirements",
          "Master context analysis",
          "Practice elimination strategies",
          "Build synonymous word pairs"
        ],
      },
      {
        id: "text-completion-advanced",
        title: "Advanced Text Completion",
        description: "Tackle complex multi-blank text completion problems",
        category: "verbal",
        difficulty: "advanced",
        estimatedTime: 65,
        totalQuestions: 30,
        xpReward: 180,
        conceptsCount: 10,
        practiceProblems: 18,
        unlocked: true,
        featured: true,
        rating: 4.8,
        enrolledCount: 6892,
        completionRate: 75,
        tags: ["text-completion", "advanced", "strategy"],
        prerequisite: "advanced-vocabulary",
        learningObjectives: [
          "Master three-blank completions",
          "Develop logical flow analysis",
          "Practice complex reasoning",
          "Build sophisticated vocabulary"
        ],
      },
      {
        id: "literary-analysis",
        title: "Literary Analysis & Interpretation",
        description: "Analyze literary passages and complex prose",
        category: "verbal",
        difficulty: "advanced",
        estimatedTime: 70,
        totalQuestions: 25,
        xpReward: 190,
        conceptsCount: 12,
        practiceProblems: 15,
        unlocked: true,
        featured: false,
        rating: 4.6,
        enrolledCount: 5234,
        completionRate: 70,
        tags: ["literature", "analysis", "interpretation"],
        prerequisite: "reading-comprehension-basics",
        learningObjectives: [
          "Analyze literary devices",
          "Understand authorial intent",
          "Interpret complex themes",
          "Master close reading techniques"
        ],
      },

      // Additional Quantitative Modules
      {
        id: "advanced-algebra",
        title: "Advanced Algebraic Concepts",
        description: "Master complex algebraic manipulations and problem-solving",
        category: "quantitative",
        difficulty: "advanced",
        estimatedTime: 80,
        totalQuestions: 40,
        xpReward: 200,
        conceptsCount: 15,
        practiceProblems: 25,
        unlocked: true,
        featured: true,
        rating: 4.9,
        enrolledCount: 8456,
        completionRate: 73,
        tags: ["algebra", "advanced", "equations"],
        prerequisite: "algebra-mastery",
        learningObjectives: [
          "Solve complex polynomial equations",
          "Master systems of equations",
          "Work with radical expressions",
          "Apply algebraic modeling"
        ],
      },
      {
        id: "probability-statistics",
        title: "Probability & Statistics Mastery",
        description: "Master probability distributions and statistical analysis",
        category: "quantitative",
        difficulty: "intermediate",
        estimatedTime: 60,
        totalQuestions: 35,
        xpReward: 170,
        conceptsCount: 12,
        practiceProblems: 22,
        unlocked: true,
        featured: false,
        rating: 4.8,
        enrolledCount: 7123,
        completionRate: 78,
        tags: ["probability", "statistics", "data"],
        prerequisite: "data-analysis",
        learningObjectives: [
          "Calculate complex probabilities",
          "Understand statistical measures",
          "Work with distributions",
          "Analyze data trends"
        ],
      },
      {
        id: "number-theory",
        title: "Number Theory & Properties",
        description: "Explore advanced number properties and relationships",
        category: "quantitative",
        difficulty: "advanced",
        estimatedTime: 55,
        totalQuestions: 30,
        xpReward: 160,
        conceptsCount: 10,
        practiceProblems: 20,
        unlocked: true,
        featured: false,
        rating: 4.7,
        enrolledCount: 6234,
        completionRate: 74,
        tags: ["number-theory", "properties", "advanced"],
        prerequisite: "arithmetic-fundamentals",
        learningObjectives: [
          "Understand prime factorization",
          "Work with modular arithmetic",
          "Explore divisibility rules",
          "Master number sequences"
        ],
      },
      {
        id: "calculus-fundamentals",
        title: "Calculus Fundamentals",
        description: "Introduction to limits, derivatives, and basic calculus concepts",
        category: "quantitative",
        difficulty: "expert",
        estimatedTime: 90,
        totalQuestions: 45,
        xpReward: 250,
        conceptsCount: 18,
        practiceProblems: 30,
        unlocked: true,
        featured: true,
        rating: 4.9,
        enrolledCount: 4567,
        completionRate: 65,
        tags: ["calculus", "derivatives", "limits"],
        prerequisite: "advanced-algebra",
        learningObjectives: [
          "Understand limits and continuity",
          "Calculate basic derivatives",
          "Apply optimization techniques",
          "Solve related rates problems"
        ],
      },

      // Additional Analytical Writing Modules
      {
        id: "issue-essay-mastery",
        title: "Issue Essay Mastery",
        description: "Master the analytical writing task for issue essays",
        category: "analytical",
        difficulty: "intermediate",
        estimatedTime: 65,
        totalQuestions: 20,
        xpReward: 180,
        conceptsCount: 8,
        practiceProblems: 12,
        unlocked: true,
        featured: false,
        rating: 4.6,
        enrolledCount: 6789,
        completionRate: 76,
        tags: ["issue-essay", "writing", "analysis"],
        prerequisite: "essay-structure",
        learningObjectives: [
          "Analyze complex issues",
          "Develop strong thesis statements",
          "Structure persuasive arguments",
          "Master timed writing techniques"
        ],
      },
      {
        id: "research-methodology",
        title: "Research & Evidence Analysis",
        description: "Learn to analyze research studies and evaluate evidence",
        category: "analytical",
        difficulty: "advanced",
        estimatedTime: 70,
        totalQuestions: 25,
        xpReward: 190,
        conceptsCount: 12,
        practiceProblems: 15,
        unlocked: true,
        featured: false,
        rating: 4.7,
        enrolledCount: 5432,
        completionRate: 71,
        tags: ["research", "evidence", "methodology"],
        prerequisite: "argument-analysis",
        learningObjectives: [
          "Evaluate research validity",
          "Analyze statistical claims",
          "Identify bias in studies",
          "Critique methodology"
        ],
      },

      // Integrated Reasoning Modules
      {
        id: "multi-source-reasoning",
        title: "Multi-Source Reasoning",
        description: "Analyze information from multiple sources and formats",
        category: "integrated",
        difficulty: "advanced",
        estimatedTime: 75,
        totalQuestions: 20,
        xpReward: 200,
        conceptsCount: 10,
        practiceProblems: 15,
        unlocked: true,
        featured: true,
        rating: 4.8,
        enrolledCount: 5678,
        completionRate: 68,
        tags: ["multi-source", "reasoning", "integration"],
        prerequisite: "data-analysis",
        learningObjectives: [
          "Synthesize multiple data sources",
          "Identify relevant information",
          "Draw integrated conclusions",
          "Handle complex data formats"
        ],
      },
      {
        id: "table-analysis",
        title: "Table Analysis Mastery",
        description: "Master complex table analysis and data interpretation",
        category: "integrated",
        difficulty: "intermediate",
        estimatedTime: 50,
        totalQuestions: 25,
        xpReward: 160,
        conceptsCount: 8,
        practiceProblems: 18,
        unlocked: true,
        featured: false,
        rating: 4.7,
        enrolledCount: 6234,
        completionRate: 75,
        tags: ["tables", "analysis", "data"],
        prerequisite: "data-analysis",
        learningObjectives: [
          "Navigate complex tables",
          "Extract key information",
          "Perform calculations",
          "Compare data points"
        ],
      },
      {
        id: "graphics-interpretation",
        title: "Graphics Interpretation Skills",
        description: "Interpret charts, graphs, and visual data representations",
        category: "integrated",
        difficulty: "intermediate",
        estimatedTime: 45,
        totalQuestions: 30,
        xpReward: 150,
        conceptsCount: 9,
        practiceProblems: 20,
        unlocked: true,
        featured: false,
        rating: 4.6,
        enrolledCount: 7123,
        completionRate: 80,
        tags: ["graphics", "charts", "interpretation"],
        prerequisite: "data-analysis",
        learningObjectives: [
          "Read complex charts",
          "Interpret graph trends",
          "Understand data relationships",
          "Extract numerical values"
        ],
      },
      {
        id: "two-part-analysis",
        title: "Two-Part Analysis Reasoning",
        description: "Master complex two-part analysis questions with logical reasoning",
        category: "integrated",
        difficulty: "advanced",
        estimatedTime: 60,
        totalQuestions: 22,
        xpReward: 180,
        conceptsCount: 10,
        practiceProblems: 16,
        unlocked: true,
        featured: false,
        rating: 4.8,
        enrolledCount: 4892,
        completionRate: 72,
        tags: ["two-part", "analysis", "logic"],
        prerequisite: "critical-reasoning",
        learningObjectives: [
          "Understand two-part structure",
          "Apply logical reasoning",
          "Evaluate multiple scenarios",
          "Master constraint problems"
        ],
      },

      // Test Strategy Modules
      {
        id: "time-management-mastery",
        title: "Test Time Management",
        description: "Master time allocation and pacing strategies for test success",
        category: "strategy",
        difficulty: "intermediate",
        estimatedTime: 40,
        totalQuestions: 15,
        xpReward: 120,
        conceptsCount: 6,
        practiceProblems: 10,
        unlocked: true,
        featured: true,
        rating: 4.9,
        enrolledCount: 9876,
        completionRate: 88,
        tags: ["time-management", "strategy", "pacing"],
        prerequisite: null,
        learningObjectives: [
          "Develop optimal pacing strategies",
          "Learn when to skip questions",
          "Master time allocation",
          "Practice under time pressure"
        ],
      },
      {
        id: "elimination-strategies",
        title: "Advanced Elimination Techniques",
        description: "Master sophisticated answer elimination strategies",
        category: "strategy",
        difficulty: "intermediate",
        estimatedTime: 35,
        totalQuestions: 20,
        xpReward: 130,
        conceptsCount: 7,
        practiceProblems: 15,
        unlocked: true,
        featured: false,
        rating: 4.7,
        enrolledCount: 8234,
        completionRate: 85,
        tags: ["elimination", "strategy", "techniques"],
        prerequisite: null,
        learningObjectives: [
          "Identify obviously wrong answers",
          "Use logical elimination",
          "Apply strategic guessing",
          "Improve accuracy rates"
        ],
      },
      {
        id: "stress-management",
        title: "Test Anxiety & Stress Management",
        description: "Develop mental strategies to perform under pressure",
        category: "strategy",
        difficulty: "beginner",
        estimatedTime: 30,
        totalQuestions: 12,
        xpReward: 100,
        conceptsCount: 5,
        practiceProblems: 8,
        unlocked: true,
        featured: false,
        rating: 4.8,
        enrolledCount: 7892,
        completionRate: 90,
        tags: ["stress", "anxiety", "mental-prep"],
        prerequisite: null,
        learningObjectives: [
          "Learn relaxation techniques",
          "Manage test anxiety",
          "Develop confidence",
          "Practice mindfulness"
        ],
      },

      // Specialized Advanced Modules
      {
        id: "comparative-analysis",
        title: "Comparative Text Analysis",
        description: "Compare and contrast multiple texts and perspectives",
        category: "verbal",
        difficulty: "expert",
        estimatedTime: 85,
        totalQuestions: 20,
        xpReward: 220,
        conceptsCount: 12,
        practiceProblems: 12,
        unlocked: true,
        featured: true,
        rating: 4.9,
        enrolledCount: 3456,
        completionRate: 62,
        tags: ["comparative", "analysis", "expert"],
        prerequisite: "literary-analysis",
        learningObjectives: [
          "Compare multiple perspectives",
          "Analyze contrasting viewpoints",
          "Synthesize complex information",
          "Master advanced reasoning"
        ],
      },
      {
        id: "mathematical-modeling",
        title: "Mathematical Modeling & Applications",
        description: "Apply mathematical concepts to real-world scenarios",
        category: "quantitative",
        difficulty: "expert",
        estimatedTime: 95,
        totalQuestions: 35,
        xpReward: 240,
        conceptsCount: 16,
        practiceProblems: 25,
        unlocked: true,
        featured: false,
        rating: 4.8,
        enrolledCount: 3892,
        completionRate: 58,
        tags: ["modeling", "applications", "expert"],
        prerequisite: "calculus-fundamentals",
        learningObjectives: [
          "Create mathematical models",
          "Solve optimization problems",
          "Apply calculus to real scenarios",
          "Interpret model results"
        ],
      },
      {
        id: "cross-cultural-analysis",
        title: "Cross-Cultural Analysis & Global Perspectives",
        description: "Analyze texts from diverse cultural perspectives and global contexts",
        category: "analytical",
        difficulty: "expert",
        estimatedTime: 80,
        totalQuestions: 18,
        xpReward: 210,
        conceptsCount: 14,
        practiceProblems: 12,
        unlocked: true,
        featured: false,
        rating: 4.7,
        enrolledCount: 2987,
        completionRate: 64,
        tags: ["cross-cultural", "global", "perspectives"],
        prerequisite: "research-methodology",
        learningObjectives: [
          "Understand cultural contexts",
          "Analyze diverse perspectives",
          "Evaluate global issues",
          "Develop cultural sensitivity"
        ],
      },

      // Speed and Accuracy Training
      {
        id: "speed-reading-techniques",
        title: "Speed Reading & Comprehension",
        description: "Increase reading speed while maintaining comprehension",
        category: "strategy",
        difficulty: "intermediate",
        estimatedTime: 45,
        totalQuestions: 25,
        xpReward: 140,
        conceptsCount: 8,
        practiceProblems: 18,
        unlocked: true,
        featured: false,
        rating: 4.6,
        enrolledCount: 8765,
        completionRate: 83,
        tags: ["speed-reading", "comprehension", "efficiency"],
        prerequisite: "reading-comprehension-basics",
        learningObjectives: [
          "Increase reading speed",
          "Maintain comprehension",
          "Practice skimming techniques",
          "Improve efficiency"
        ],
      },
      {
        id: "mental-math-mastery",
        title: "Mental Math & Quick Calculations",
        description: "Master mental math techniques for faster problem solving",
        category: "quantitative",
        difficulty: "intermediate",
        estimatedTime: 50,
        totalQuestions: 40,
        xpReward: 150,
        conceptsCount: 10,
        practiceProblems: 30,
        unlocked: true,
        featured: true,
        rating: 4.8,
        enrolledCount: 9234,
        completionRate: 86,
        tags: ["mental-math", "calculations", "speed"],
        prerequisite: "arithmetic-fundamentals",
        learningObjectives: [
          "Master quick calculation techniques",
          "Learn estimation strategies",
          "Practice number shortcuts",
          "Improve calculation speed"
        ],
      },

      // Subject Integration Modules
      {
        id: "business-applications",
        title: "Business & Economics Applications",
        description: "Apply analytical skills to business and economic scenarios",
        category: "integrated",
        difficulty: "advanced",
        estimatedTime: 70,
        totalQuestions: 28,
        xpReward: 185,
        conceptsCount: 12,
        practiceProblems: 20,
        unlocked: true,
        featured: false,
        rating: 4.7,
        enrolledCount: 6543,
        completionRate: 74,
        tags: ["business", "economics", "applications"],
        prerequisite: "multi-source-reasoning",
        learningObjectives: [
          "Analyze business scenarios",
          "Understand economic principles",
          "Apply quantitative reasoning",
          "Make data-driven decisions"
        ],
      },
      {
        id: "science-reasoning",
        title: "Scientific Reasoning & Analysis",
        description: "Apply analytical thinking to scientific contexts and research",
        category: "analytical",
        difficulty: "advanced",
        estimatedTime: 65,
        totalQuestions: 24,
        xpReward: 175,
        conceptsCount: 11,
        practiceProblems: 16,
        unlocked: true,
        featured: false,
        rating: 4.6,
        enrolledCount: 5234,
        completionRate: 71,
        tags: ["science", "reasoning", "research"],
        prerequisite: "research-methodology",
        learningObjectives: [
          "Analyze scientific studies",
          "Understand research methods",
          "Evaluate evidence",
          "Apply logical reasoning"
        ],
      },

      // Assessment and Review Modules
      {
        id: "diagnostic-assessment",
        title: "Comprehensive Diagnostic Assessment",
        description: "Complete diagnostic test to identify strengths and weaknesses",
        category: "assessment",
        difficulty: "intermediate",
        estimatedTime: 120,
        totalQuestions: 60,
        xpReward: 300,
        conceptsCount: 20,
        practiceProblems: 60,
        unlocked: true,
        featured: true,
        rating: 4.8,
        enrolledCount: 8765,
        completionRate: 78,
        tags: ["diagnostic", "assessment", "comprehensive"],
        prerequisite: null,
        learningObjectives: [
          "Identify strength areas",
          "Discover improvement opportunities",
          "Get personalized recommendations",
          "Track overall progress"
        ],
      },
      {
        id: "final-review-intensive",
        title: "Final Review Intensive",
        description: "Comprehensive review of all topics before test day",
        category: "strategy",
        difficulty: "advanced",
        estimatedTime: 100,
        totalQuestions: 50,
        xpReward: 250,
        conceptsCount: 25,
        practiceProblems: 40,
        unlocked: true,
        featured: true,
        rating: 4.9,
        enrolledCount: 7654,
        completionRate: 81,
        tags: ["review", "intensive", "comprehensive"],
        prerequisite: "diagnostic-assessment",
        learningObjectives: [
          "Review all key concepts",
          "Practice mixed question types",
          "Reinforce weak areas",
          "Build test-day confidence"
        ],
      }
    ];

    return modules;
  };

  useEffect(() => {
    loadLearningData();
  }, [loadLearningData]);

  // Enhanced Module Filtering and Sorting
  const getFilteredModules = () => {
    let filtered = learningModules.filter((module) => {
      const matchesSearch =
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || module.category === selectedCategory;
      const matchesDifficulty =
        difficultyFilter === "all" || module.difficulty === difficultyFilter;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Apply sorting
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.enrolledCount - a.enrolledCount);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "difficulty": {
        const difficultyOrder = {
          beginner: 1,
          intermediate: 2,
          advanced: 3,
          expert: 4,
        };
        filtered.sort(
          (a, b) =>
            difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        );
        break;
      }
      case "time":
        filtered.sort((a, b) => a.estimatedTime - b.estimatedTime);
        break;
      default: // recommended
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        });
    }

    return filtered;
  };

  // Enhanced Module Launch with Instructions
  const launchModule = async (module) => {
    try {
      setModuleLoading(true);
      setCurrentModule(module);

      // Generate comprehensive instructions
      const instructions = await generateModuleInstructions(module);
      setModuleInstructions(instructions);
      setInstructionsDialog(true);
    } catch (error) {
      console.error("Error launching module:", error);
    } finally {
      setModuleLoading(false);
    }
  };

  // Handle dialog close with proper focus management
  const handleInstructionsClose = () => {
    setInstructionsDialog(false);
    setCurrentModule(null);
    setModuleInstructions("");
  };

  // Generate Rich Module Instructions
  const generateModuleInstructions = async (module) => {
    const prompt = `Create comprehensive learning instructions for the module "${module.title}".
    
    Category: ${module.category}
    Difficulty: ${module.difficulty}
    Estimated Time: ${module.estimatedTime} minutes
    
    Include:
    1. Learning objectives and goals
    2. Prerequisites and recommended preparation
    3. Study strategies and tips
    4. Common pitfalls to avoid
    5. Success criteria and assessment methods
    6. Additional resources and practice recommendations
    
    Format the response in a clear, engaging, and educational manner.`;

    try {
      const response = await openRouterService.generateContent(prompt);
      return response;
    } catch {
      return `Welcome to ${module.title}!
      
      This module will help you master ${module.category} concepts with ${
        module.totalQuestions
      } practice questions.
      
      Learning Objectives:
      ${
        module.learningObjectives
          ?.map((obj, index) => `${index + 1}. ${obj}`)
          .join("\n") || "Master key concepts in this area"
      }
      
      Study Tips:
      • Take your time to understand each concept
      • Practice regularly for best results
      • Review mistakes to learn from them
      • Use spaced repetition for retention
      
      Good luck with your learning journey!`;
    }
  };

  // Enhanced Progress Calculation
  // const calculateOverallProgress = () => {
  //   const totalModules = learningModules.length;
  //   const completed = completedModules.length;
  //   return totalModules > 0 ? Math.round((completed / totalModules) * 100) : 0;
  // };

  // Gamification Elements
  const getNextLevelXP = () => {
    return userProfile.level * 1000;
  };

  const getXPProgress = () => {
    const currentLevelXP = (userProfile.level - 1) * 1000;
    const nextLevelXP = getNextLevelXP();
    const progressXP = userProfile.totalXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    return Math.min((progressXP / requiredXP) * 100, 100);
  };

  // Render Enhanced Module Card
  const renderModuleCard = (module) => {
    const isCompleted = completedModules.some((c) => c.id === module.id);
    const progress = moduleProgress[module.id];
    const isBookmarked = bookmarkedModules.includes(module.id);
    const userScore = userScores[module.id];

    return (
      <Grow
        key={module.id}
        in
        timeout={600}
        style={{ transformOrigin: "0 0 0" }}
      >
        <Card
          elevation={module.featured ? 8 : 2}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            background: module.featured
              ? "linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(156, 39, 176, 0.05))"
              : "white",
            border: module.featured ? "2px solid" : "1px solid",
            borderColor: module.featured ? "primary.main" : "divider",
            "&:hover": {
              transform: "translateY(-8px)",
              boxShadow: 12,
              "& .module-actions": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          {/* Featured Badge */}
          {module.featured && (
            <Chip
              label="Featured"
              color="primary"
              size="small"
              icon={<Star />}
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                zIndex: 1,
                fontWeight: "bold",
              }}
            />
          )}

          {/* Bookmark Button */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(module.id);
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "background.default" },
            }}
          >
            {isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
          </IconButton>

          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            {/* Header */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {module.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {module.description}
              </Typography>

              {/* Metadata */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                <Chip
                  label={module.difficulty}
                  size="small"
                  color={
                    module.difficulty === "beginner"
                      ? "success"
                      : module.difficulty === "intermediate"
                      ? "warning"
                      : module.difficulty === "advanced"
                      ? "error"
                      : "secondary"
                  }
                  variant="outlined"
                />
                <Chip
                  label={`${module.estimatedTime}min`}
                  size="small"
                  icon={<Timer />}
                  variant="outlined"
                />
                <Chip
                  label={`${module.totalQuestions} questions`}
                  size="small"
                  icon={<QuestionAnswer />}
                  variant="outlined"
                />
              </Box>

              {/* Rating and Stats */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Rating
                    value={module.rating}
                    readOnly
                    size="small"
                    precision={0.1}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ({module.rating})
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {module.enrolledCount?.toLocaleString()} enrolled
                </Typography>
              </Box>
            </Box>

            {/* Progress Bar */}
            {progress && (
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption">Progress</Typography>
                  <Typography variant="caption">
                    {Math.round((progress.completed / progress.total) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(progress.completed / progress.total) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      background: isCompleted
                        ? "linear-gradient(90deg, #4caf50, #81c784)"
                        : "linear-gradient(90deg, #2196f3, #64b5f6)",
                    },
                  }}
                />
              </Box>
            )}

            {/* Score Display */}
            {userScore && (
              <Box sx={{ mb: 2 }}>
                <Alert
                  severity={
                    userScore.accuracy >= 80
                      ? "success"
                      : userScore.accuracy >= 60
                      ? "warning"
                      : "error"
                  }
                  variant="outlined"
                  sx={{ py: 0.5 }}
                >
                  <Typography variant="caption">
                    Last Score: {userScore.accuracy}% ({userScore.correct}/
                    {userScore.total})
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* Action Buttons */}
            <Box
              className="module-actions"
              sx={{
                opacity: 0,
                transform: "translateY(10px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                gap: 1,
                mt: "auto",
              }}
            >
              <Button
                variant={isCompleted ? "outlined" : "contained"}
                size="small"
                onClick={() => launchModule(module)}
                startIcon={isCompleted ? <Replay /> : <PlayArrow />}
                fullWidth
                disabled={!module.unlocked}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  transition: "all 0.2s ease",
                }}
              >
                {isCompleted ? "Review" : module.unlocked ? "Start" : "Locked"}
              </Button>

              <IconButton
                size="small"
                onClick={() => viewModuleDetails(module)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Visibility />
              </IconButton>
            </Box>
          </CardContent>

          {/* XP Reward Badge */}
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: "bold",
              boxShadow: 2,
            }}
          >
            +{module.xpReward}
          </Box>
        </Card>
      </Grow>
    );
  };

  // Helper Functions
  const toggleBookmark = (moduleId) => {
    setBookmarkedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const viewModuleDetails = (module) => {
    setCurrentModule(module);
    // setShowModuleDialog(true); // TODO: Implement module details dialog
  };

  const viewDetailedScore = (moduleId) => {
    // Show detailed score breakdown for the module
    console.log("Viewing detailed score for module:", moduleId);
    // This would open a detailed score dialog
  };

  const startModuleFromInstructions = () => {
    handleInstructionsClose();
    // Navigate to actual module content
    console.log("Starting module:", currentModule.title);

    if (onStartModule && currentModule) {
      onStartModule(currentModule);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Loading Skeletons */}
        <Box sx={{ mb: 4 }}>
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: 3, mb: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ borderRadius: 2, mb: 3 }}
          />
        </Box>

        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Enhanced Header with Gamification */}
      <Fade in timeout={600}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(156, 39, 176, 0.1))",
            border: "1px solid",
            borderColor: "primary.light",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <IconButton onClick={onBack} sx={{ mr: 2 }}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h3" sx={{ fontWeight: "bold", mr: 2 }}>
                  Learning Hub
                </Typography>
                <Chip
                  label={`Level ${userProfile.level}`}
                  color="primary"
                  icon={<EmojiEvents />}
                  sx={{ fontWeight: "bold" }}
                />
              </Box>

              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Master concepts through interactive learning modules
              </Typography>

              {/* Progress Stats */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <CircularProgress
                      variant="determinate"
                      value={getXPProgress()}
                      size={60}
                      thickness={6}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" display="block">
                      XP Progress
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {userProfile.xp}/{getNextLevelXP()}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <LocalFireDepartment
                        color="error"
                        sx={{ fontSize: 30 }}
                      />
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", ml: 1 }}
                      >
                        {userProfile.streak}
                      </Typography>
                    </Box>
                    <Typography variant="caption">Day Streak</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <CheckCircle color="success" sx={{ fontSize: 30 }} />
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", ml: 1 }}
                      >
                        {completedModules.length}
                      </Typography>
                    </Box>
                    <Typography variant="caption">Completed Modules</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <Timer color="primary" sx={{ fontSize: 30 }} />
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", ml: 1 }}
                      >
                        {Math.round(userProfile.totalTimeSpent / 60)}h
                      </Typography>
                    </Box>
                    <Typography variant="caption">Study Time</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Button
              variant="outlined"
              startIcon={<EmojiEvents />}
              onClick={() => {}} // TODO: Implement achievements dialog
              sx={{ borderRadius: 2 }}
            >
              Achievements
            </Button>
          </Box>
        </Paper>
      </Fade>

      {/* Enhanced Navigation Tabs */}
      <Slide direction="right" in timeout={800}>
        <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{ px: 2 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Modules" icon={<MenuBook />} />
            <Tab
              label={
                <Badge badgeContent={completedModules.length} color="success">
                  Completed
                </Badge>
              }
              icon={<CheckCircle />}
            />
            <Tab
              label={
                <Badge badgeContent={bookmarkedModules.length} color="primary">
                  Bookmarked
                </Badge>
              }
              icon={<Bookmark />}
            />
            <Tab label="Achievements" icon={<EmojiEvents />} />
          </Tabs>
        </Paper>
      </Slide>

      {/* Enhanced Filters and Search */}
      <Zoom in timeout={1000}>
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                  sx={{ borderRadius: 2 }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {cat.icon}
                        {cat.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  label="Difficulty"
                  sx={{ borderRadius: 2 }}
                >
                  {difficulties.map((diff) => (
                    <MenuItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="recommended">Recommended</MenuItem>
                  <MenuItem value="popular">Most Popular</MenuItem>
                  <MenuItem value="rating">Highest Rated</MenuItem>
                  <MenuItem value="difficulty">Difficulty</MenuItem>
                  <MenuItem value="time">Duration</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={() => setShowFilters(!showFilters)}
                  color={showFilters ? "primary" : "default"}
                >
                  <FilterList />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {/* Advanced Filters */}
          <Collapse in={showFilters}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Estimated Time (minutes)</Typography>
                <Slider
                  defaultValue={[0, 120]}
                  valueLabelDisplay="auto"
                  step={15}
                  marks
                  min={0}
                  max={120}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Minimum Rating</Typography>
                <Rating defaultValue={0} precision={0.5} size="large" />
              </Grid>
            </Grid>
          </Collapse>
        </Paper>
      </Zoom>

      {/* Module Content Based on Selected Tab */}
      {selectedTab === 0 && (
        <Fade in timeout={1200}>
          <Box>
            {/* Category Chips */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Categories
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.label}
                    icon={category.icon}
                    onClick={() => setSelectedCategory(category.id)}
                    color={
                      selectedCategory === category.id
                        ? category.color
                        : "default"
                    }
                    variant={
                      selectedCategory === category.id ? "filled" : "outlined"
                    }
                    sx={{
                      transition: "all 0.2s ease",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Modules Grid */}
            <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
              Available Modules ({getFilteredModules().length})
            </Typography>

            <Grid container spacing={3}>
              {getFilteredModules().map((module) => (
                <Grid item xs={12} sm={6} md={4} key={module.id}>
                  {renderModuleCard(module)}
                </Grid>
              ))}
            </Grid>

            {getFilteredModules().length === 0 && (
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                <School sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No modules found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters to see more results
                </Typography>
              </Paper>
            )}
          </Box>
        </Fade>
      )}

      {/* Completed Modules Tab */}
      {selectedTab === 1 && (
        <Fade in timeout={1200}>
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
              Completed Modules ({completedModules.length})
            </Typography>

            <Grid container spacing={3}>
              {completedModules.map((module) => {
                const originalModule = learningModules.find(
                  (m) => m.id === module.id
                );
                const userScore = userScores[module.id];

                return (
                  <Grid item xs={12} sm={6} md={4} key={module.id}>
                    <Card
                      elevation={3}
                      sx={{
                        position: "relative",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      {/* Completion Badge */}
                      <Chip
                        label="Completed"
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          zIndex: 1,
                          fontWeight: "bold",
                        }}
                      />

                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", mb: 1, mt: 2 }}
                        >
                          {originalModule?.title || module.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Completed on{" "}
                          {new Date(module.completedAt).toLocaleDateString()}
                        </Typography>

                        {userScore && (
                          <Box sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography variant="body2">
                                Final Score
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold" }}
                              >
                                {userScore.accuracy}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={userScore.accuracy}
                              color={
                                userScore.accuracy >= 80
                                  ? "success"
                                  : userScore.accuracy >= 60
                                  ? "warning"
                                  : "error"
                              }
                              sx={{ height: 8, borderRadius: 4 }}
                            />

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1, display: "block" }}
                            >
                              {userScore.correct}/{userScore.total} questions
                              correct
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Replay />}
                            onClick={() => launchModule(originalModule)}
                            fullWidth
                          >
                            Review
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Assessment />}
                            onClick={() => viewDetailedScore(module.id)}
                            fullWidth
                          >
                            Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {completedModules.length === 0 && (
              <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                <CheckCircle
                  sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No completed modules yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Start learning to see your progress here
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setSelectedTab(0)}
                  startIcon={<PlayArrow />}
                >
                  Browse Modules
                </Button>
              </Paper>
            )}
          </Box>
        </Fade>
      )}

      {/* Enhanced Module Instructions Dialog */}
      <Dialog
        open={instructionsDialog}
        onClose={handleInstructionsClose}
        maxWidth="md"
        fullWidth
        disableEnforceFocus={false}
        disableAutoFocus={false}
        disableRestoreFocus={false}
        keepMounted={false}
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: "90vh" },
        }}
        aria-labelledby="module-instructions-title"
        aria-describedby="module-instructions-content"
      >
        <DialogTitle
          id="module-instructions-title"
          sx={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          <AutoAwesome color="primary" />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {currentModule?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Learning Instructions & Guide
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers id="module-instructions-content">
          {moduleLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <Box>
              {/* Module Metadata */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                <Chip
                  label={`${currentModule?.estimatedTime} minutes`}
                  icon={<Timer />}
                  variant="outlined"
                />
                <Chip
                  label={`${currentModule?.totalQuestions} questions`}
                  icon={<QuestionAnswer />}
                  variant="outlined"
                />
                <Chip
                  label={`+${currentModule?.xpReward} XP`}
                  icon={<EmojiEvents />}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {/* Instructions Content */}
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  "& strong": { fontWeight: "bold" },
                  "& em": { fontStyle: "italic" },
                }}
              >
                {moduleInstructions}
              </Typography>

              {/* Learning Objectives */}
              {currentModule?.learningObjectives && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    Learning Objectives
                  </Typography>
                  {currentModule.learningObjectives.map((objective, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}
                    >
                      <CheckCircle
                        color="success"
                        sx={{ mr: 1, mt: 0.5, fontSize: 20 }}
                      />
                      <Typography variant="body2">{objective}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleInstructionsClose}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={startModuleFromInstructions}
            variant="contained"
            startIcon={<PlayArrow />}
            disabled={moduleLoading}
            sx={{ borderRadius: 2 }}
          >
            Start Learning
          </Button>
        </DialogActions>
      </Dialog>

      {/* Other dialogs can be added here... */}
    </Container>
  );
};

export default EnhancedLearning;
