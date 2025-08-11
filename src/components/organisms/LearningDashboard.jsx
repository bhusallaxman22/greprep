import React from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  LinearProgress,
  Grid,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  EmojiEvents,
  LocalFireDepartment,
  Star,
} from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * Learning dashboard header organism showing user progress and stats
 */
const LearningDashboard = ({
  user,
  userStats = {
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    streak: 0,
    completedModules: 0,
    totalModules: 0,
    averageScore: 0,
  },
}) => {
  const {
    level,
    currentXP,
    nextLevelXP,
    streak,
    completedModules,
    totalModules,
    averageScore,
  } = userStats;

  const progressPercentage =
    nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 0;
  const completionRate =
    totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  const StatCard = ({ icon, value, label, color = "primary" }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: `${color}.50`,
        border: "1px solid",
        borderColor: `${color}.200`,
      }}
    >
      <Avatar
        sx={{
          bgcolor: `${color}.100`,
          color: `${color}.main`,
          width: 40,
          height: 40,
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, color: `${color}.dark` }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mb: 4,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "200px",
          height: "200px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          transform: "translate(50%, -50%)",
        }}
      />

      <Grid container spacing={3} alignItems="center">
        {/* User Info */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar
              src={user?.photoURL}
              sx={{
                width: 60,
                height: 60,
                border: "3px solid rgba(255,255,255,0.3)",
              }}
            >
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Welcome back!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {user?.displayName || "Learner"}
              </Typography>
              <Chip
                icon={<Star />}
                label={`Level ${level}`}
                sx={{
                  mt: 0.5,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "& .MuiChip-icon": { color: "#ffd700" },
                }}
              />
            </Box>
          </Box>

          {/* XP Progress */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Level Progress
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {currentXP} / {nextLevelXP} XP
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#ffd700",
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<LocalFireDepartment />}
                value={streak}
                label="Day Streak"
                color="warning"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<EmojiEvents />}
                value={completedModules}
                label="Completed"
                color="success"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<TrendingUp />}
                value={`${Math.round(completionRate)}%`}
                label="Progress"
                color="info"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<Star />}
                value={`${Math.round(averageScore)}%`}
                label="Avg Score"
                color="secondary"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

LearningDashboard.propTypes = {
  user: PropTypes.object,
  userStats: PropTypes.shape({
    level: PropTypes.number,
    currentXP: PropTypes.number,
    nextLevelXP: PropTypes.number,
    streak: PropTypes.number,
    completedModules: PropTypes.number,
    totalModules: PropTypes.number,
    averageScore: PropTypes.number,
  }),
};

export default LearningDashboard;
