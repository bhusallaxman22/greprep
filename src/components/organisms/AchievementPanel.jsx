import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  Timer as TimerIcon,
  GpsFixed as TargetIcon,
} from "@mui/icons-material";
import { useState } from "react";
import PropTypes from "prop-types";
import AchievementBadge from "../molecules/AchievementBadge";

const AchievementPanel = ({
  completedModules = [],
  totalXP = 0,
  streakDays = 0,
  accuracy = 0,
  modulesCompleted = 0,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Calculate achievement progress
  const achievements = [
    {
      category: "Learning Milestones",
      badges: [
        {
          name: "Foundation Builder",
          earned: modulesCompleted >= 1,
          requirement: "Complete your first module",
        },
        {
          name: "Word Warrior",
          earned: completedModules.some((m) => m.includes("vocabulary")),
          requirement: "Complete vocabulary module",
        },
        {
          name: "Number Ninja",
          earned: completedModules.some((m) => m.includes("math")),
          requirement: "Complete math module",
        },
        {
          name: "Essay Architect",
          earned: completedModules.some((m) => m.includes("essay")),
          requirement: "Complete writing module",
        },
        {
          name: "Grand Master",
          earned: modulesCompleted >= 20,
          requirement: "Complete 20 modules",
        },
      ],
    },
    {
      category: "Performance Excellence",
      badges: [
        {
          name: "Accuracy Master",
          earned: accuracy >= 85,
          requirement: "Achieve 85% accuracy",
        },
        {
          name: "Speed Demon",
          earned: totalXP >= 1000,
          requirement: "Earn 1000+ XP",
        },
        {
          name: "Consistency King",
          earned: streakDays >= 7,
          requirement: "7-day learning streak",
        },
        {
          name: "Perfectionist",
          earned: accuracy >= 95,
          requirement: "Achieve 95% accuracy",
        },
        {
          name: "XP Champion",
          earned: totalXP >= 5000,
          requirement: "Earn 5000+ XP",
        },
      ],
    },
    {
      category: "Special Achievements",
      badges: [
        {
          name: "Marathon Runner",
          earned: modulesCompleted >= 10,
          requirement: "Complete 10 modules",
        },
        {
          name: "Boss Slayer",
          earned: completedModules.some((m) => m.includes("boss")),
          requirement: "Defeat a boss challenge",
        },
        {
          name: "Olympian",
          earned: completedModules.some((m) => m.includes("olympiad")),
          requirement: "Complete olympiad challenge",
        },
        {
          name: "Ultimate Fighter",
          earned: completedModules.some((m) => m.includes("martial")),
          requirement: "Complete mixed martial arts",
        },
        {
          name: "Crown Holder",
          earned: accuracy >= 90 && modulesCompleted >= 15,
          requirement: "90% accuracy + 15 modules",
        },
      ],
    },
  ];

  const earnedBadges = achievements.flatMap((cat) =>
    cat.badges.filter((b) => b.earned)
  );
  const totalBadges = achievements.flatMap((cat) => cat.badges).length;
  const achievementProgress = (earnedBadges.length / totalBadges) * 100;

  // XP Level Calculation
  const getLevel = (xp) => Math.floor(xp / 500) + 1;
  const currentLevel = getLevel(totalXP);
  const xpProgress = ((totalXP % 500) / 500) * 100;

  const stats = [
    {
      label: "Current Level",
      value: currentLevel,
      icon: TrendingUpIcon,
      color: "primary",
      subtitle: `${totalXP % 500}/500 XP to next level`,
    },
    {
      label: "Learning Streak",
      value: `${streakDays} days`,
      icon: LocalFireDepartmentIcon,
      color: "warning",
      subtitle: streakDays > 0 ? "Keep it up! 🔥" : "Start your streak today!",
    },
    {
      label: "Accuracy Rate",
      value: `${Math.round(accuracy)}%`,
      icon: TargetIcon,
      color: "success",
      subtitle: accuracy >= 85 ? "Excellent!" : "Keep improving!",
    },
    {
      label: "Badges Earned",
      value: `${earnedBadges.length}/${totalBadges}`,
      icon: EmojiEventsIcon,
      color: "secondary",
      subtitle: `${Math.round(achievementProgress)}% complete`,
    },
  ];

  return (
    <Card
      sx={{
        mb: 3,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <EmojiEventsIcon />
            Achievement Center
          </Typography>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{ color: "white" }}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Grid item xs={6} sm={3} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <IconComponent sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.7, display: "block" }}
                  >
                    {stat.subtitle}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* XP Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">
              Level {currentLevel} Progress
            </Typography>
            <Typography variant="body2">{totalXP % 500}/500 XP</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={xpProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(255,255,255,0.2)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #FFD700, #FFA500)",
              },
            }}
          />
        </Box>

        {/* Latest Badges */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Latest badges:
          </Typography>
          {earnedBadges.slice(-3).map((badge, index) => (
            <AchievementBadge
              key={index}
              badge={badge.name}
              earned={true}
              size="small"
              showDescription={false}
            />
          ))}
          {earnedBadges.length === 0 && (
            <Typography
              variant="body2"
              sx={{ opacity: 0.7, fontStyle: "italic" }}
            >
              Complete modules to earn badges!
            </Typography>
          )}
        </Box>

        {/* Expanded View */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />

          {achievements.map((category, categoryIndex) => (
            <Box key={categoryIndex} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                {category.category}
              </Typography>
              <Grid container spacing={2}>
                {category.badges.map((badge, badgeIndex) => (
                  <Grid item xs={12} sm={6} md={4} key={badgeIndex}>
                    <Box
                      sx={{
                        p: 2,
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 2,
                        backgroundColor: badge.earned
                          ? "rgba(255,215,0,0.1)"
                          : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <AchievementBadge
                          badge={badge.name}
                          earned={badge.earned}
                          size="small"
                          showDescription={false}
                        />
                        <Typography
                          variant="body2"
                          sx={{ opacity: badge.earned ? 1 : 0.7 }}
                        >
                          {badge.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ opacity: 0.8, display: "block" }}
                      >
                        {badge.requirement}
                      </Typography>
                      {badge.earned && (
                        <Chip
                          label="EARNED"
                          size="small"
                          sx={{
                            mt: 1,
                            backgroundColor: "#FFD700",
                            color: "#000",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Collapse>
      </CardContent>
    </Card>
  );
};

AchievementPanel.propTypes = {
  completedModules: PropTypes.array,
  totalXP: PropTypes.number,
  streakDays: PropTypes.number,
  accuracy: PropTypes.number,
  modulesCompleted: PropTypes.number,
};

export default AchievementPanel;
