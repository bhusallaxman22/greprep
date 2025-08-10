import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
import {
  AutoFixHigh as AIIcon,
  TrendingUp as ScoreIcon,
  Speed as AdaptiveIcon,
  Psychology as PersonalizedIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

const SEOLandingHero = ({ onStartPrep, onLearnMore }) => {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h1"
          variant="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            mb: 3,
          }}
        >
          AI-Powered GRE & GMAT Test Preparation
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: 4,
            opacity: 0.9,
            fontSize: { xs: "1.25rem", md: "1.5rem" },
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          Master GRE and GMAT exams with personalized AI preparation. Get
          adaptive practice tests, instant feedback, and score higher with our
          free platform.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={onStartPrep}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              px: 4,
              py: 1.5,
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            Start Free GRE GMAT Prep
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={onLearnMore}
            sx={{
              borderColor: "white",
              color: "white",
              px: 4,
              py: 1.5,
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Learn About AI Prep
          </Button>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          flexWrap="wrap"
        >
          <Chip
            label="Free GRE Practice Tests"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
          />
          <Chip
            label="Free GMAT Practice Tests"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
          />
          <Chip
            label="AI-Powered Learning"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
          />
          <Chip
            label="Adaptive Difficulty"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
          />
        </Stack>
      </Container>
    </Box>
  );
};

const SEOFeatureSection = () => {
  const features = [
    {
      icon: <AIIcon sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "AI-Powered GRE GMAT Preparation",
      description:
        "Advanced artificial intelligence analyzes your performance and creates personalized study plans for optimal GRE and GMAT preparation results.",
      keywords: [
        "AI GRE prep",
        "AI GMAT prep",
        "artificial intelligence test prep",
      ],
    },
    {
      icon: <AdaptiveIcon sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Adaptive Practice Tests",
      description:
        "Dynamic difficulty adjustment ensures you're always challenged at the right level for maximum GRE GMAT learning efficiency.",
      keywords: [
        "adaptive GRE tests",
        "adaptive GMAT tests",
        "personalized practice",
      ],
    },
    {
      icon: <ScoreIcon sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Score Improvement Guarantee",
      description:
        "Proven methods and AI insights help students improve their GRE and GMAT scores significantly with targeted preparation strategies.",
      keywords: [
        "GRE score improvement",
        "GMAT score improvement",
        "test score guarantee",
      ],
    },
    {
      icon: <PersonalizedIcon sx={{ fontSize: 48, color: "primary.main" }} />,
      title: "Personalized Learning Path",
      description:
        "Custom study plans based on your strengths and weaknesses ensure efficient GRE GMAT preparation tailored to your needs.",
      keywords: [
        "personalized GRE prep",
        "custom GMAT study plan",
        "tailored test prep",
      ],
    },
  ];

  return (
    <Box component="section" sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h3"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          Why Choose Our AI-Powered GRE GMAT Preparation?
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    transition: "transform 0.3s ease-in-out",
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    component="h3"
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {feature.description}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    {feature.keywords.map((keyword, idx) => (
                      <Chip
                        key={idx}
                        label={keyword}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const SEOTestTypesSection = () => {
  const testTypes = [
    {
      name: "GRE Preparation",
      description:
        "Comprehensive GRE test preparation with verbal reasoning, quantitative reasoning, and analytical writing practice.",
      sections: [
        "Verbal Reasoning",
        "Quantitative Reasoning",
        "Analytical Writing",
      ],
      keywords: "GRE prep, GRE practice test, GRE verbal, GRE quantitative",
    },
    {
      name: "GMAT Preparation",
      description:
        "Complete GMAT test preparation covering quantitative aptitude, verbal ability, and integrated reasoning.",
      sections: [
        "Quantitative Aptitude",
        "Verbal Ability",
        "Integrated Reasoning",
        "Analytical Writing",
      ],
      keywords: "GMAT prep, GMAT practice test, GMAT quantitative, GMAT verbal",
    },
  ];

  return (
    <Box component="section" sx={{ py: 8, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h3"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          Comprehensive GRE & GMAT Test Preparation
        </Typography>

        <Grid container spacing={4}>
          {testTypes.map((test, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    component="h3"
                    variant="h4"
                    gutterBottom
                    sx={{ fontWeight: 600, color: "primary.main" }}
                  >
                    {test.name}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {test.description}
                  </Typography>

                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Test Sections:
                  </Typography>
                  <Stack spacing={1}>
                    {test.sections.map((section, idx) => (
                      <Chip
                        key={idx}
                        label={section}
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Stack>

                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 2, fontStyle: "italic", color: "text.secondary" }}
                  >
                    Keywords: {test.keywords}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

SEOLandingHero.propTypes = {
  onStartPrep: PropTypes.func.isRequired,
  onLearnMore: PropTypes.func.isRequired,
};

export { SEOLandingHero, SEOFeatureSection, SEOTestTypesSection };
