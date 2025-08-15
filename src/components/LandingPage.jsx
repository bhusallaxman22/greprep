import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Slide,
} from "@mui/material";
import {
  PlayArrow,
  Star,
  TrendingUp,
  Psychology,
  Speed,
  CheckCircle,
  School,
  EmojiEvents,
  AutoAwesome,
  Insights,
  Close,
} from "@mui/icons-material";
import useAuth from "../context/useAuth";
import AuthScreen from "./AuthScreen";

const LandingPage = () => {
  const theme = useTheme();
  const { signInAsGuest } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTryDemo = async () => {
    setIsLoading(true);
    try {
      await signInAsGuest();
    } catch (error) {
      console.error("Guest sign-in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  if (showAuth) {
    return (
      <Box sx={{ position: "relative", minHeight: "100vh" }}>
        <IconButton
          onClick={() => setShowAuth(false)}
          sx={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 1000,
            bgcolor: "background.paper",
            boxShadow: 2,
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <Close />
        </IconButton>
        <AuthScreen />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
        <Fade in timeout={1000}>
          <Box textAlign="center" mb={8}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem" },
                fontWeight: 800,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3,
              }}
            >
              Smart GRE & GMAT Test Prep
            </Typography>

            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 700, mx: "auto", lineHeight: 1.6 }}
            >
              Comprehensive test preparation with AI-generated questions,
              interactive learning modules, performance analytics, and
              personalized study recommendations. Practice all question types
              with instant feedback and detailed explanations.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={handleTryDemo}
                loading={isLoading}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  borderRadius: 3,
                  textTransform: "none",
                  boxShadow: 3,
                }}
              >
                Try Practice Questions
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<School />}
                onClick={handleGetStarted}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  borderRadius: 3,
                  textTransform: "none",
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                Start Learning Modules
              </Button>
            </Box>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Chip
                icon={<Star />}
                label="Free Forever"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<EmojiEvents />}
                label="25+ Learning Modules"
                color="secondary"
                variant="outlined"
              />
              <Chip
                icon={<TrendingUp />}
                label="AI-Generated Questions"
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>
        </Fade>

        {/* Key Features */}
        <Slide direction="up" in timeout={1200}>
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {[
              {
                icon: <Psychology />,
                title: "Interactive Learning Modules",
                description:
                  "25+ comprehensive modules covering Verbal, Quantitative, Analytical Writing, and test strategy with gamified learning",
                color: "primary",
              },
              {
                icon: <Speed />,
                title: "AI Question Generation",
                description:
                  "Unlimited practice questions generated by AI with multiple difficulty levels and detailed explanations",
                color: "secondary",
              },
              {
                icon: <Insights />,
                title: "Performance Dashboard",
                description:
                  "Track your progress with detailed analytics, accuracy rates, time spent, and AI-powered improvement suggestions",
                color: "success",
              },
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${feature.color}.main`,
                        width: 60,
                        height: 60,
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" lineHeight={1.6}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Slide>

        {/* Benefits Section */}
        <Box
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 4,
            p: 6,
            mb: 8,
          }}
        >
          <Typography
            variant="h3"
            textAlign="center"
            gutterBottom
            fontWeight="bold"
            color="primary.main"
          >
            Everything You Need for Test Success
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[
              "25+ structured learning modules with gamification",
              "AI-generated questions for unlimited practice",
              "Comprehensive coverage: Verbal, Quantitative, Writing",
              "Real-time performance tracking and analytics",
              "Detailed explanations for every question",
              "Time management and test-taking strategies",
              "Mobile-responsive design for studying anywhere",
              "Completely free with no hidden fees",
            ].map((benefit) => (
              <Grid item xs={12} sm={6} key={benefit}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CheckCircle color="success" />
                  <Typography variant="body1" fontWeight="medium">
                    {benefit}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Success Stories */}
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            color="text.primary"
          >
            What You'll Get with Our Platform
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                name: "Learning Modules",
                feature: "25+ Interactive Modules",
                description:
                  "Vocabulary, Reading Comprehension, Critical Reasoning, Math, Geometry, Data Analysis, and Writing modules with XP rewards",
                highlight: "Gamified Learning",
              },
              {
                name: "Practice Questions",
                feature: "AI-Generated Content",
                description:
                  "Unlimited practice questions with multiple difficulty levels, detailed explanations, and fallback question banks",
                highlight: "Always Fresh Content",
              },
              {
                name: "Progress Tracking",
                feature: "Advanced Analytics",
                description:
                  "Comprehensive dashboard showing accuracy rates, time spent, weak areas, and AI-powered study recommendations",
                highlight: "Data-Driven Insights",
              },
            ].map((story) => (
              <Grid item xs={12} md={4} key={story.name}>
                <Card sx={{ height: "100%", textAlign: "center" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 60,
                        height: 60,
                        mx: "auto",
                        mb: 2,
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      {story.name.slice(0, 2)}
                    </Avatar>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {story.name}
                    </Typography>
                    <Chip
                      label={story.feature}
                      color="primary"
                      sx={{ mb: 2, fontWeight: "bold" }}
                    />
                    <Chip
                      label={story.highlight}
                      color="success"
                      variant="outlined"
                      sx={{ mb: 2, ml: 1, fontWeight: "bold" }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {story.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box
          textAlign="center"
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "white",
            p: 6,
            borderRadius: 4,
            boxShadow: 6,
          }}
        >
          <AutoAwesome sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Start Your Free Test Preparation Today
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Access all learning modules, practice questions, and analytics
            completely free. No credit card required, no time limits.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                borderRadius: 3,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              Access Learning Modules
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleTryDemo}
              loading={isLoading}
              sx={{
                borderColor: "white",
                color: "white",
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                borderRadius: 3,
                textTransform: "none",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: alpha("#ffffff", 0.1),
                },
              }}
            >
              Try Practice Questions
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            100% Free • No Registration Required • Instant Access
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
