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
import useAuth from "../context/useAuth";
import firebaseService from "../services/firebase";
import openRouterService from "../services/openrouter";
import { modulesCatalog, getDifficultyRank } from "../constants/modulesCatalog";
import {
  getRequiredLevelForDifficulty,
  coerceLevel,
} from "../constants/moduleUnlocks";

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

  // Compute unlocked status for modules based on user profile and completed modules
  const computeUnlockedModules = useCallback((catalog, profile, completed) => {
    const userLevel = coerceLevel(profile.level);
    const completedSet = new Set(completed.map((m) => m.id));
    return catalog.map((mod) => {
      const difficultyRank = getDifficultyRank(mod.difficulty);
      const requiredLevel = getRequiredLevelForDifficulty(difficultyRank);
      const prereqOk = !mod.prerequisite || completedSet.has(mod.prerequisite);
      const unlocked = userLevel >= requiredLevel && prereqOk;
      return { ...mod, unlocked, requiredLevel, prereqOk };
    });
  }, []);

  // Load Enhanced Learning Data
  const loadLearningData = useCallback(async () => {
    try {
      setLoading(true);

      // Load comprehensive user data
      const [progress, completed, scores, bookmarks] = await Promise.all([
        firebaseService.getUserLearningProgress(user.uid),
        firebaseService.getCompletedModules(user.uid),
        firebaseService.getUserModuleScores(user.uid),
        firebaseService.getUserBookmarks(user.uid),
      ]);

      setUserProfile(progress);
      setCompletedModules(completed);
      setUserScores(scores);
      setBookmarkedModules(bookmarks);

      // Compute unlocked modules from centralized catalog
      const computed = computeUnlockedModules(
        modulesCatalog,
        progress,
        completed
      );
      setLearningModules(computed);

      // Calculate module progress
      const progressMap = {};
      computed.forEach((module) => {
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
  }, [user?.uid, computeUnlockedModules]);

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
