import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  School,
  Psychology,
  TrendingUp,
  Security,
  Speed,
  CloudQueue,
  CheckCircle,
  GitHub,
  LinkedIn,
  Email,
  ArrowBack,
} from "@mui/icons-material";

const About = ({ onBack }) => {
  const features = [
    {
      icon: <Psychology color="primary" />,
      title: "AI-Powered Questions",
      description:
        "Advanced AI generates realistic GRE and GMAT questions tailored to your skill level.",
    },
    {
      icon: <TrendingUp color="success" />,
      title: "Performance Analytics",
      description:
        "Detailed insights into your progress with personalized improvement recommendations.",
    },
    {
      icon: <Speed color="warning" />,
      title: "Adaptive Learning",
      description:
        "Questions adapt to your performance, ensuring optimal challenge and growth.",
    },
    {
      icon: <Security color="error" />,
      title: "Secure & Private",
      description:
        "Your data is protected with industry-standard security measures.",
    },
    {
      icon: <CloudQueue color="info" />,
      title: "Cloud Sync",
      description:
        "Access your progress from any device with automatic cloud synchronization.",
    },
    {
      icon: <School color="secondary" />,
      title: "Comprehensive Prep",
      description:
        "Complete test preparation covering all sections of GRE and GMAT exams.",
    },
  ];

  const technologies = [
    "React 18",
    "Material UI",
    "Firebase",
    "OpenRouter AI",
    "Vite",
    "JavaScript ES6+",
  ];

  const stats = [
    { label: "Questions Generated", value: "10,000+" },
    { label: "Students Helped", value: "500+" },
    { label: "Average Score Improvement", value: "15%" },
    { label: "Success Rate", value: "92%" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          About GRE/GMAT Prep
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800 }}>
          An intelligent test preparation platform that leverages AI to provide
          personalized learning experiences for GRE and GMAT candidates.
        </Typography>
      </Box>

      {/* Mission Statement */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Our Mission
        </Typography>
        <Typography variant="h6" sx={{ lineHeight: 1.6, opacity: 0.95 }}>
          To democratize test preparation by providing high-quality, AI-powered
          study tools that adapt to each student's unique learning style and
          pace, making standardized test success accessible to everyone.
        </Typography>
      </Paper>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={2}
              sx={{
                textAlign: "center",
                p: 3,
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                },
              }}
            >
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                {stat.value}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Features */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{ textAlign: "center", mb: 4 }}
        >
          Key Features
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                elevation={2}
                sx={{
                  h: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.50",
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Technology Stack */}
      <Paper elevation={2} sx={{ p: 4, mb: 5 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Technology Stack
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Built with modern web technologies for optimal performance and user
          experience.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {technologies.map((tech, index) => (
            <Chip
              key={index}
              label={tech}
              variant="outlined"
              color="primary"
              sx={{
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "primary.main",
                  color: "white",
                  transform: "scale(1.05)",
                },
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* How It Works */}
      <Paper elevation={2} sx={{ p: 4, mb: 5 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          How It Works
        </Typography>
        <List>
          <ListItem sx={{ pl: 0 }}>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Adaptive Question Generation"
              secondary="AI analyzes your performance and generates questions at the optimal difficulty level"
            />
          </ListItem>
          <ListItem sx={{ pl: 0 }}>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Real-time Performance Tracking"
              secondary="Monitor your progress with detailed analytics and personalized insights"
            />
          </ListItem>
          <ListItem sx={{ pl: 0 }}>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Personalized Study Plans"
              secondary="Receive AI-powered recommendations to focus on your areas of improvement"
            />
          </ListItem>
          <ListItem sx={{ pl: 0 }}>
            <ListItemIcon>
              <CheckCircle color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Comprehensive Results"
              secondary="Get detailed feedback on each question with explanations and learning strategies"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Contact/Developer Info */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Get In Touch
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 600, mx: "auto" }}
        >
          Have questions, suggestions, or feedback? We'd love to hear from you
          and continuously improve the platform based on your needs.
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<GitHub />}
            href="https://github.com/bhusallaxman22/greprep"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source
          </Button>
          <Button
            variant="outlined"
            startIcon={<Email />}
            href="mailto:support@greprep.com"
          >
            Contact Us
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
