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
import { useAuth } from "../context/AuthContext";
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
              Master GRE & GMAT with AI
            </Typography>

            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 600, mx: "auto", lineHeight: 1.6 }}
            >
              Revolutionary AI-powered preparation that adapts to your learning
              style. Score higher with personalized practice and instant
              feedback.
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
                Try Free Demo
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
                Get Started Free
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
                label="4.9/5 Rating"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<EmojiEvents />}
                label="50K+ Students"
                color="secondary"
                variant="outlined"
              />
              <Chip
                icon={<TrendingUp />}
                label="Average 40+ Point Increase"
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
                title: "AI-Powered Learning",
                description:
                  "Advanced algorithms create personalized study paths that adapt to your strengths and weaknesses",
                color: "primary",
              },
              {
                icon: <Speed />,
                title: "Instant Feedback",
                description:
                  "Get real-time explanations and detailed analysis for every question you attempt",
                color: "secondary",
              },
              {
                icon: <Insights />,
                title: "Performance Analytics",
                description:
                  "Track your progress with detailed insights and predictive score estimates",
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
            Why Choose Our AI Platform?
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {[
              "Unlimited practice questions generated by AI",
              "Adaptive difficulty based on your performance",
              "Comprehensive coverage of all GRE & GMAT topics",
              "Mobile-friendly for studying anywhere",
              "Detailed progress tracking and analytics",
              "Expert-designed curriculum with AI enhancement",
            ].map((benefit, index) => (
              <Grid item xs={12} sm={6} key={index}>
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
            Join Thousands of Successful Students
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                name: "Sarah Chen",
                score: "GRE: 335/340",
                quote:
                  "The AI feedback helped me identify exactly where I was making mistakes. Increased my score by 45 points!",
                avatar: "SC",
              },
              {
                name: "Michael Rodriguez",
                score: "GMAT: 750/800",
                quote:
                  "Adaptive learning made studying so much more efficient. Got into my dream MBA program!",
                avatar: "MR",
              },
              {
                name: "Priya Patel",
                score: "GRE: 328/340",
                quote:
                  "The personalized study plan kept me motivated and on track. Best test prep investment I made.",
                avatar: "PP",
              },
            ].map((story, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: "100%", textAlign: "center" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: "secondary.main",
                        width: 60,
                        height: 60,
                        mx: "auto",
                        mb: 2,
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                      }}
                    >
                      {story.avatar}
                    </Avatar>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {story.name}
                    </Typography>
                    <Chip
                      label={story.score}
                      color="success"
                      sx={{ mb: 2, fontWeight: "bold" }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic", lineHeight: 1.6 }}
                    >
                      "{story.quote}"
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
            Ready to Achieve Your Target Score?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of students who've improved their scores with our
            AI-powered platform
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
              Start Free Trial
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
              Try Demo Now
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            No credit card required • Free forever plan available
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
