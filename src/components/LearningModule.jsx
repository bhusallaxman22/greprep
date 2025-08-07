import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  School,
  Star,
  LocalFireDepartment,
  EmojiEvents,
  PlayArrow,
  Lock,
  CheckCircle,
  AutoAwesome,
  Psychology,
  TrendingUp,
  Close,
  Lightbulb,
  ArrowBack,
  Search
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import firebaseService from '../services/firebase';
import openRouterService from '../services/openrouter';

const LearningModule = ({ onBack }) => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState({
    level: 1,
    xp: 0,
    streak: 0,
    completedLessons: 0,
    achievements: []
  });
  const [learningPath, setLearningPath] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLearningData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load user progress from Firebase
      const progress = await firebaseService.getUserLearningProgress(user.uid);
      setUserProgress(progress);

      // Generate personalized learning path based on user's test performance
      const testResults = await firebaseService.getUserTestResults(user.uid);
      const weakAreas = analyzeWeakAreas(testResults);
      const path = await generateLearningPath(weakAreas, progress.level);
      setLearningPath(path);
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const analyzeWeakAreas = (testResults) => {
    if (!testResults.length) return ['vocabulary', 'reading-comprehension'];
    
    const sectionPerformance = {};
    testResults.forEach(result => {
      if (!sectionPerformance[result.section]) {
        sectionPerformance[result.section] = { correct: 0, total: 0 };
      }
      sectionPerformance[result.section].total++;
      if (result.isCorrect) sectionPerformance[result.section].correct++;
    });

    // Identify sections with accuracy < 70%
    const weakAreas = [];
    Object.entries(sectionPerformance).forEach(([section, data]) => {
      const accuracy = (data.correct / data.total) * 100;
      if (accuracy < 70) {
        weakAreas.push(section);
      }
    });

    return weakAreas.length ? weakAreas : ['vocabulary', 'reading-comprehension'];
  };

  const generateLearningPath = async (weakAreas, currentLevel) => {
    // Create structured learning modules with much more variety
    const modules = [
      // Vocabulary Modules
      {
        id: 'vocabulary-basics',
        title: 'Vocabulary Fundamentals',
        description: 'Master essential vocabulary for test success',
        difficulty: 1,
        xpReward: 50,
        lessons: 8,
        unlocked: true,
        category: 'verbal'
      },
      {
        id: 'advanced-vocabulary',
        title: 'Advanced Vocabulary Mastery',
        description: 'Tackle high-level vocabulary with sophisticated words',
        difficulty: 3,
        xpReward: 80,
        lessons: 12,
        unlocked: currentLevel >= 3,
        category: 'verbal'
      },
      {
        id: 'vocabulary-context',
        title: 'Vocabulary in Context',
        description: 'Learn to understand words through context clues',
        difficulty: 2,
        xpReward: 60,
        lessons: 10,
        unlocked: currentLevel >= 2,
        category: 'verbal'
      },
      {
        id: 'word-roots-prefixes',
        title: 'Word Roots & Prefixes',
        description: 'Decode unfamiliar words using roots and prefixes',
        difficulty: 2,
        xpReward: 70,
        lessons: 15,
        unlocked: currentLevel >= 2,
        category: 'verbal'
      },
      {
        id: 'synonyms-antonyms',
        title: 'Synonyms & Antonyms Mastery',
        description: 'Master word relationships and nuances',
        difficulty: 2,
        xpReward: 55,
        lessons: 8,
        unlocked: currentLevel >= 2,
        category: 'verbal'
      },

      // Reading Comprehension Modules
      {
        id: 'reading-strategies',
        title: 'Reading Comprehension Strategies',
        description: 'Learn proven techniques for reading passages',
        difficulty: 2,
        xpReward: 75,
        lessons: 6,
        unlocked: currentLevel >= 2,
        category: 'verbal'
      },
      {
        id: 'passage-analysis',
        title: 'Passage Analysis Techniques',
        description: 'Break down complex passages effectively',
        difficulty: 3,
        xpReward: 85,
        lessons: 10,
        unlocked: currentLevel >= 3,
        category: 'verbal'
      },
      {
        id: 'main-idea-details',
        title: 'Main Ideas & Supporting Details',
        description: 'Identify key concepts and supporting evidence',
        difficulty: 1,
        xpReward: 45,
        lessons: 7,
        unlocked: true,
        category: 'verbal'
      },
      {
        id: 'inference-reasoning',
        title: 'Inference & Reasoning Skills',
        description: 'Draw logical conclusions from text',
        difficulty: 3,
        xpReward: 90,
        lessons: 12,
        unlocked: currentLevel >= 3,
        category: 'verbal'
      },
      {
        id: 'tone-attitude',
        title: 'Author Tone & Attitude',
        description: 'Understand author perspectives and bias',
        difficulty: 2,
        xpReward: 65,
        lessons: 8,
        unlocked: currentLevel >= 2,
        category: 'verbal'
      },

      // Critical Reasoning Modules
      {
        id: 'critical-reasoning',
        title: 'Critical Reasoning Fundamentals',
        description: 'Develop logical thinking skills',
        difficulty: 2,
        xpReward: 80,
        lessons: 5,
        unlocked: currentLevel >= 2,
        category: 'verbal'
      },
      {
        id: 'argument-structure',
        title: 'Argument Structure Analysis',
        description: 'Break down logical arguments effectively',
        difficulty: 3,
        xpReward: 95,
        lessons: 10,
        unlocked: currentLevel >= 3,
        category: 'verbal'
      },
      {
        id: 'strengthen-weaken',
        title: 'Strengthen & Weaken Arguments',
        description: 'Master argument evaluation techniques',
        difficulty: 3,
        xpReward: 100,
        lessons: 12,
        unlocked: currentLevel >= 3,
        category: 'verbal'
      },
      {
        id: 'assumptions-flaws',
        title: 'Identifying Assumptions & Flaws',
        description: 'Spot hidden assumptions and logical errors',
        difficulty: 4,
        xpReward: 110,
        lessons: 15,
        unlocked: currentLevel >= 4,
        category: 'verbal'
      },

      // Math Fundamentals
      {
        id: 'math-foundations',
        title: 'Mathematical Foundations',
        description: 'Build strong quantitative reasoning skills',
        difficulty: 1,
        xpReward: 60,
        lessons: 10,
        unlocked: true,
        category: 'quantitative'
      },
      {
        id: 'arithmetic-basics',
        title: 'Arithmetic Essentials',
        description: 'Master basic arithmetic operations and concepts',
        difficulty: 1,
        xpReward: 40,
        lessons: 8,
        unlocked: true,
        category: 'quantitative'
      },
      {
        id: 'fractions-decimals',
        title: 'Fractions & Decimals',
        description: 'Work confidently with fractions and decimals',
        difficulty: 1,
        xpReward: 50,
        lessons: 10,
        unlocked: true,
        category: 'quantitative'
      },
      {
        id: 'percentages-ratios',
        title: 'Percentages & Ratios',
        description: 'Master percentage calculations and ratio problems',
        difficulty: 2,
        xpReward: 65,
        lessons: 12,
        unlocked: currentLevel >= 2,
        category: 'quantitative'
      },

      // Algebra Modules
      {
        id: 'basic-algebra',
        title: 'Basic Algebraic Concepts',
        description: 'Master fundamental algebraic operations',
        difficulty: 2,
        xpReward: 70,
        lessons: 10,
        unlocked: currentLevel >= 2,
        category: 'quantitative'
      },
      {
        id: 'advanced-algebra',
        title: 'Advanced Algebraic Concepts',
        description: 'Master complex algebraic problems',
        difficulty: 3,
        xpReward: 100,
        lessons: 7,
        unlocked: currentLevel >= 3,
        category: 'quantitative'
      },
      {
        id: 'linear-equations',
        title: 'Linear Equations & Inequalities',
        description: 'Solve linear equations and inequalities',
        difficulty: 2,
        xpReward: 75,
        lessons: 12,
        unlocked: currentLevel >= 2,
        category: 'quantitative'
      },
      {
        id: 'quadratic-equations',
        title: 'Quadratic Equations & Functions',
        description: 'Master quadratic equations and their applications',
        difficulty: 3,
        xpReward: 90,
        lessons: 10,
        unlocked: currentLevel >= 3,
        category: 'quantitative'
      },
      {
        id: 'systems-equations',
        title: 'Systems of Equations',
        description: 'Solve multiple equations simultaneously',
        difficulty: 3,
        xpReward: 85,
        lessons: 8,
        unlocked: currentLevel >= 3,
        category: 'quantitative'
      },

      // Geometry Modules
      {
        id: 'geometry-basics',
        title: 'Geometry Fundamentals',
        description: 'Master basic geometric concepts and formulas',
        difficulty: 2,
        xpReward: 70,
        lessons: 12,
        unlocked: currentLevel >= 2,
        category: 'quantitative'
      },
      {
        id: 'coordinate-geometry',
        title: 'Coordinate Geometry',
        description: 'Work with points, lines, and shapes on coordinate plane',
        difficulty: 3,
        xpReward: 85,
        lessons: 10,
        unlocked: currentLevel >= 3,
        category: 'quantitative'
      },
      {
        id: 'triangles-polygons',
        title: 'Triangles & Polygons',
        description: 'Master properties of triangles and polygons',
        difficulty: 2,
        xpReward: 75,
        lessons: 15,
        unlocked: currentLevel >= 2,
        category: 'quantitative'
      },
      {
        id: 'circles-arcs',
        title: 'Circles & Arc Measurements',
        description: 'Understand circle properties and calculations',
        difficulty: 3,
        xpReward: 80,
        lessons: 8,
        unlocked: currentLevel >= 3,
        category: 'quantitative'
      },
      {
        id: 'solid-geometry',
        title: '3D Geometry & Volume',
        description: 'Calculate volumes and surface areas of 3D shapes',
        difficulty: 3,
        xpReward: 95,
        lessons: 10,
        unlocked: currentLevel >= 3,
        category: 'quantitative'
      },

      // Data Analysis & Statistics
      {
        id: 'data-interpretation',
        title: 'Data Interpretation',
        description: 'Analyze charts, graphs, and tables effectively',
        difficulty: 2,
        xpReward: 70,
        lessons: 12,
        unlocked: currentLevel >= 2,
        category: 'quantitative'
      },
      {
        id: 'statistics-basics',
        title: 'Statistics Fundamentals',
        description: 'Understand mean, median, mode, and range',
        difficulty: 2,
        xpReward: 65,
        lessons: 10,
        unlocked: currentLevel >= 2,
        category: 'quantitative'
      },
      {
        id: 'probability-basics',
        title: 'Probability Concepts',
        description: 'Calculate probabilities and understand chance',
        difficulty: 3,
        xpReward: 85,
        lessons: 12,
        unlocked: currentLevel >= 3,
        category: 'quantitative'
      },
      {
        id: 'advanced-statistics',
        title: 'Advanced Statistical Analysis',
        description: 'Standard deviation, correlation, and distributions',
        difficulty: 4,
        xpReward: 110,
        lessons: 15,
        unlocked: currentLevel >= 4,
        category: 'quantitative'
      },

      // Problem Solving Strategies
      {
        id: 'problem-solving-strategies',
        title: 'Problem Solving Techniques',
        description: 'Learn systematic approaches to complex problems',
        difficulty: 2,
        xpReward: 80,
        lessons: 10,
        unlocked: currentLevel >= 2,
        category: 'strategy'
      },
      {
        id: 'estimation-techniques',
        title: 'Estimation & Approximation',
        description: 'Quick calculation and estimation methods',
        difficulty: 2,
        xpReward: 60,
        lessons: 8,
        unlocked: currentLevel >= 2,
        category: 'strategy'
      },
      {
        id: 'time-management',
        title: 'Test Time Management',
        description: 'Optimize your time during the actual test',
        difficulty: 1,
        xpReward: 45,
        lessons: 6,
        unlocked: true,
        category: 'strategy'
      },
      {
        id: 'elimination-strategies',
        title: 'Answer Elimination Techniques',
        description: 'Increase accuracy through strategic elimination',
        difficulty: 1,
        xpReward: 40,
        lessons: 5,
        unlocked: true,
        category: 'strategy'
      },

      // Advanced Topics
      {
        id: 'exponentials-logarithms',
        title: 'Exponentials & Logarithms',
        description: 'Master exponential and logarithmic functions',
        difficulty: 4,
        xpReward: 120,
        lessons: 12,
        unlocked: currentLevel >= 4,
        category: 'quantitative'
      },
      {
        id: 'sequences-series',
        title: 'Sequences & Series',
        description: 'Understand arithmetic and geometric progressions',
        difficulty: 4,
        xpReward: 105,
        lessons: 10,
        unlocked: currentLevel >= 4,
        category: 'quantitative'
      },
      {
        id: 'combinatorics',
        title: 'Combinatorics & Counting',
        description: 'Master permutations and combinations',
        difficulty: 4,
        xpReward: 115,
        lessons: 8,
        unlocked: currentLevel >= 4,
        category: 'quantitative'
      },
      {
        id: 'complex-word-problems',
        title: 'Complex Word Problems',
        description: 'Tackle multi-step real-world applications',
        difficulty: 4,
        xpReward: 125,
        lessons: 15,
        unlocked: currentLevel >= 4,
        category: 'quantitative'
      },

      // Writing & Grammar (for tests that include writing)
      {
        id: 'grammar-essentials',
        title: 'Grammar Essentials',
        description: 'Master fundamental grammar rules',
        difficulty: 1,
        xpReward: 50,
        lessons: 12,
        unlocked: true,
        category: 'writing'
      },
      {
        id: 'sentence-structure',
        title: 'Sentence Structure & Style',
        description: 'Build clear and effective sentences',
        difficulty: 2,
        xpReward: 65,
        lessons: 10,
        unlocked: currentLevel >= 2,
        category: 'writing'
      },
      {
        id: 'essay-writing',
        title: 'Essay Writing Strategies',
        description: 'Structure compelling and coherent essays',
        difficulty: 3,
        xpReward: 90,
        lessons: 8,
        unlocked: currentLevel >= 3,
        category: 'writing'
      },
      {
        id: 'rhetorical-analysis',
        title: 'Rhetorical Analysis',
        description: 'Analyze rhetorical devices and effectiveness',
        difficulty: 4,
        xpReward: 100,
        lessons: 12,
        unlocked: currentLevel >= 4,
        category: 'writing'
      },

      // Test-Specific Modules
      {
        id: 'gre-specific-strategies',
        title: 'GRE-Specific Strategies',
        description: 'Targeted techniques for GRE success',
        difficulty: 2,
        xpReward: 75,
        lessons: 8,
        unlocked: currentLevel >= 2,
        category: 'strategy'
      },
      {
        id: 'gmat-specific-strategies',
        title: 'GMAT-Specific Strategies',
        description: 'Targeted techniques for GMAT success',
        difficulty: 2,
        xpReward: 75,
        lessons: 8,
        unlocked: currentLevel >= 2,
        category: 'strategy'
      },
      {
        id: 'test-anxiety-management',
        title: 'Test Anxiety Management',
        description: 'Overcome test anxiety and perform your best',
        difficulty: 1,
        xpReward: 35,
        lessons: 5,
        unlocked: true,
        category: 'strategy'
      },
      {
        id: 'final-review-strategies',
        title: 'Final Review & Test Day',
        description: 'Last-minute preparation and test day strategies',
        difficulty: 2,
        xpReward: 55,
        lessons: 6,
        unlocked: currentLevel >= 2,
        category: 'strategy'
      }
    ];

    // Prioritize modules based on weak areas
    return modules.sort((a, b) => {
      const aIsWeak = weakAreas.some(area => a.category.includes(area) || a.id.includes(area));
      const bIsWeak = weakAreas.some(area => b.category.includes(area) || b.id.includes(area));
      
      if (aIsWeak && !bIsWeak) return -1;
      if (!aIsWeak && bIsWeak) return 1;
      return a.difficulty - b.difficulty;
    });
  };

  // Load learning data when component mounts
  useEffect(() => {
    if (user) {
      loadLearningData();
    }
  }, [user, loadLearningData]);

  const startLesson = async (moduleId) => {
    try {
      setLessonLoading(true);
      
      // Generate AI-powered lesson content
      const lesson = await openRouterService.generateLesson(moduleId, userProgress.level);
      setCurrentLesson(lesson);
      setLessonDialog(true);
    } catch (error) {
      console.error('Error generating lesson:', error);
    } finally {
      setLessonLoading(false);
    }
  };

  const completeLesson = async (lessonId, score) => {
    try {
      const xpGained = Math.round(score * 10); // 10 XP per percentage point
      const newProgress = {
        ...userProgress,
        xp: userProgress.xp + xpGained,
        completedLessons: userProgress.completedLessons + 1,
        streak: userProgress.streak + 1
      };

      // Level up logic
      const xpForNextLevel = newProgress.level * 200;
      if (newProgress.xp >= xpForNextLevel) {
        newProgress.level += 1;
        newProgress.achievements.push({
          id: `level-${newProgress.level}`,
          title: `Level ${newProgress.level} Achieved!`,
          description: `You've reached level ${newProgress.level}`,
          date: new Date().toISOString()
        });
      }

      await firebaseService.updateLearningProgress(user.uid, newProgress);
      setUserProgress(newProgress);
      setLessonDialog(false);
      
      // Reload learning path to unlock new modules
      loadLearningData();
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const getXPProgress = () => {
    const xpForCurrentLevel = (userProgress.level - 1) * 200;
    const xpForNextLevel = userProgress.level * 200;
    const currentLevelXP = userProgress.xp - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return (currentLevelXP / xpNeeded) * 100;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button 
        startIcon={<ArrowBack />} 
        onClick={onBack}
        sx={{ mb: 2 }}
        variant="outlined"
      >
        Back to Dashboard
      </Button>

      {/* Header with User Progress */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.dark' }}>
              <School sx={{ fontSize: 40 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              Learning Dashboard
            </Typography>
            <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
              Level {userProgress.level} Scholar
            </Typography>
            <Box sx={{ mt: 2, mb: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={getXPProgress()} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'warning.main'
                  }
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {userProgress.xp} XP • {userProgress.completedLessons} lessons completed
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalFireDepartment sx={{ color: 'orange', mr: 1 }} />
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {userProgress.streak}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'white' }}>
                Day Streak
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Achievements */}
      {userProgress.achievements.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiEvents sx={{ mr: 1, color: 'gold' }} />
            Recent Achievements
          </Typography>
          <Grid container spacing={2}>
            {userProgress.achievements.slice(-3).map((achievement, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Star sx={{ color: 'gold', mr: 1 }} />
                      <Typography variant="h6">{achievement.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Learning Path */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoAwesome sx={{ mr: 1, color: 'primary.main' }} />
          Your Personalized Learning Path
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`${learningPath.filter(m => m.unlocked).length}/${learningPath.length} unlocked`}
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={`Level ${userProgress.level}`}
            color="secondary"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </Box>

      {/* Search and Category Filter */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search learning modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Browse by Category
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['all', 'verbal', 'quantitative', 'strategy', 'writing'].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory(category)}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            >
              {category === 'all' ? 'All Modules' : category}
              {category !== 'all' && (
                <Chip 
                  label={learningPath.filter(m => m.category === category).length}
                  size="small"
                  sx={{ ml: 1, height: 16, fontSize: '0.7rem' }}
                />
              )}
            </Button>
          ))}
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {learningPath
          .filter(module => {
            const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
            const matchesSearch = searchQuery === '' || 
              module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              module.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
          })
          .map((module) => (
          <Grid item xs={12} sm={6} md={4} key={module.id}>
            <Card 
              elevation={module.unlocked ? 2 : 1}
              sx={{ 
                position: 'relative',
                opacity: module.unlocked ? 1 : 0.6,
                border: module.unlocked ? '2px solid transparent' : '2px solid',
                borderColor: module.unlocked ? 'transparent' : 'grey.300',
                '&:hover': module.unlocked ? {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                } : {}
              }}
            >
              <CardContent>
                {!module.unlocked && (
                  <Lock sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    color: 'grey.400' 
                  }} />
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {module.category === 'verbal' && <Psychology sx={{ color: 'primary.main', mr: 1 }} />}
                  {module.category === 'quantitative' && <TrendingUp sx={{ color: 'success.main', mr: 1 }} />}
                  {module.category === 'strategy' && <Lightbulb sx={{ color: 'warning.main', mr: 1 }} />}
                  {module.category === 'writing' && <School sx={{ color: 'info.main', mr: 1 }} />}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={module.category}
                      size="small" 
                      color={
                        module.category === 'verbal' ? 'primary' :
                        module.category === 'quantitative' ? 'success' :
                        module.category === 'strategy' ? 'warning' : 'info'
                      }
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                    <Chip 
                      label={`Level ${module.difficulty}`} 
                      size="small" 
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {module.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {module.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <School sx={{ fontSize: 16, mr: 0.5 }} />
                    {module.lessons} lessons
                  </Typography>
                  <Chip 
                    label={`+${module.xpReward} XP`} 
                    size="small" 
                    color="warning" 
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <Button
                  variant={module.unlocked ? "contained" : "outlined"}
                  fullWidth
                  disabled={!module.unlocked || lessonLoading}
                  onClick={() => startLesson(module.id)}
                  startIcon={module.unlocked ? <PlayArrow /> : <Lock />}
                >
                  {module.unlocked ? 'Start Learning' : 'Locked'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Lesson Dialog */}
      <Dialog 
        open={lessonDialog} 
        onClose={() => setLessonDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {currentLesson?.title || 'Interactive Lesson'}
          </Typography>
          <IconButton onClick={() => setLessonDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {currentLesson && (
            <LessonContent 
              lesson={currentLesson}
              onComplete={completeLesson}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

// Interactive Lesson Component
const LessonContent = ({ lesson, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  const handleAnswer = (questionId, selectedAnswer) => {
    const newAnswers = { ...answers, [questionId]: selectedAnswer };
    setAnswers(newAnswers);
    
    // Calculate score
    const correct = lesson.questions.filter((q, index) => 
      newAnswers[index] === q.correctAnswer
    ).length;
    setScore((correct / lesson.questions.length) * 100);
  };

  const nextStep = () => {
    if (currentStep < lesson.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(lesson.id, score);
    }
  };

  const currentQuestion = lesson.questions[currentStep];

  return (
    <Box>
      <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
        {lesson.questions.map((_, index) => (
          <Step key={index}>
            <StepLabel />
          </Step>
        ))}
      </Stepper>

      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Question {currentStep + 1} of {lesson.questions.length}
          </Typography>
          <Chip 
            label={`${Math.round(score)}% correct`} 
            color={score >= 80 ? "success" : score >= 60 ? "warning" : "default"}
            variant="outlined"
          />
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={(currentStep / lesson.questions.length) * 100} 
          sx={{ mb: 3, height: 8, borderRadius: 1 }}
        />
        
        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            {currentQuestion.question}
          </Typography>
        </Paper>

        <Grid container spacing={2}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentStep] === index;
            const isAnswered = answers[currentStep] !== undefined;
            const isCorrect = index === currentQuestion.correctAnswer;
            
            let buttonColor = "outlined";
            let buttonSx = { 
              textAlign: 'left', 
              justifyContent: 'flex-start',
              p: 2,
              border: '2px solid',
              borderColor: 'grey.300',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50'
              }
            };

            if (isAnswered) {
              if (isSelected) {
                if (isCorrect) {
                  buttonColor = "contained";
                  buttonSx.bgcolor = 'success.main';
                  buttonSx.color = 'white';
                  buttonSx.borderColor = 'success.main';
                  buttonSx['&:hover'] = {
                    bgcolor: 'success.dark',
                    borderColor: 'success.dark'
                  };
                } else {
                  buttonSx.bgcolor = 'error.50';
                  buttonSx.borderColor = 'error.main';
                  buttonSx.color = 'error.dark';
                }
              } else if (isCorrect) {
                buttonSx.bgcolor = 'success.50';
                buttonSx.borderColor = 'success.main';
                buttonSx.color = 'success.dark';
              }
            } else if (isSelected) {
              buttonColor = "contained";
            }

            return (
              <Grid item xs={12} key={index}>
                <Button
                  variant={buttonColor}
                  fullWidth
                  disabled={isAnswered}
                  onClick={() => handleAnswer(currentStep, index)}
                  sx={buttonSx}
                  startIcon={
                    isAnswered && isCorrect ? (
                      <CheckCircle sx={{ color: isSelected ? 'white' : 'success.main' }} />
                    ) : isAnswered && isSelected && !isCorrect ? (
                      <Close sx={{ color: 'error.main' }} />
                    ) : null
                  }
                >
                  <Box sx={{ textAlign: 'left', width: '100%' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {String.fromCharCode(65 + index)}. {option}
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            );
          })}
        </Grid>

        {answers[currentStep] !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Alert 
              severity={answers[currentStep] === currentQuestion.correctAnswer ? "success" : "error"}
              sx={{ mb: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {answers[currentStep] === currentQuestion.correctAnswer ? (
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20, mt: 0.2 }} />
                ) : (
                  <Close sx={{ color: 'error.main', fontSize: 20, mt: 0.2 }} />
                )}
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {answers[currentStep] === currentQuestion.correctAnswer 
                      ? "🎉 Excellent!" 
                      : "Not quite right"}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                    {answers[currentStep] !== currentQuestion.correctAnswer && (
                      <>
                        <strong>Correct answer:</strong> {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                        <br /><br />
                      </>
                    )}
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </Typography>
                </Box>
              </Box>
            </Alert>

            {/* Learning Tips */}
            {lesson.tips && lesson.tips.length > 0 && (
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'primary.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Lightbulb sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Quick Tip
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'primary.dark' }}>
                  {lesson.tips[Math.min(currentStep, lesson.tips.length - 1)]}
                </Typography>
              </Card>
            )}
          </Box>
        )}
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Progress: {Math.round(score)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Object.keys(answers).length} of {lesson.questions.length} answered
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={nextStep}
          disabled={answers[currentStep] === undefined}
          endIcon={currentStep === lesson.questions.length - 1 ? <CheckCircle /> : <PlayArrow />}
          sx={{ px: 3, py: 1.5 }}
        >
          {currentStep === lesson.questions.length - 1 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {score >= 80 ? '🎉' : score >= 60 ? '👍' : '💪'}
              Complete Lesson
            </Box>
          ) : (
            'Next Question'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default LearningModule;
