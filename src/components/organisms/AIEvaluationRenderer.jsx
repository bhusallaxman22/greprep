import React from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Card,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from "@mui/material";
import {
  Lightbulb,
  FlagOutlined,
  BookmarkBorder,
  Psychology,
  TipsAndUpdates,
} from "@mui/icons-material";

const AIEvaluationRenderer = ({ evaluation }) => {
  if (!evaluation) return null;

  // Simple insights format
  if (
    evaluation.includes("🎯") ||
    evaluation.includes("📈") ||
    evaluation.includes("🔄")
  ) {
    const insights = evaluation
      .split("\n\n")
      .filter((insight) => insight.trim());
    return (
      <Grid container spacing={2}>
        {insights.map((insight, index) => (
          <Grid item xs={12} md={6} key={`${index}-${insight.slice(0, 50)}`}>
            <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {insight.trim()}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  // Split the evaluation into sections based on common patterns
  const sections = evaluation.split(/(?=\*\*|📚|🎯|📖|⚡|\d+\.|##|###)/);

  return (
    <Box>
      {sections.map((section, index) => {
        const trimmedSection = section.trim();
        if (!trimmedSection) return null;

        const keyBase = `${trimmedSection.substring(0, 30)}-${index}`;

        if (
          trimmedSection.includes("Key Insights") ||
          trimmedSection.includes("insights")
        ) {
          return (
            <Box key={`insights-${keyBase}`} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Lightbulb color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Key Insights
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                {trimmedSection.replace(/\*\*Key Insights\*\*:?/i, "").trim()}
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>
          );
        }

        if (
          trimmedSection.includes("Priority Actions") ||
          trimmedSection.includes("focus")
        ) {
          return (
            <Box key={`priority-${keyBase}`} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FlagOutlined color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="secondary">
                  Priority Actions
                </Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  {trimmedSection
                    .replace(/\*\*Priority Actions\*\*:?/i, "")
                    .trim()}
                </Typography>
              </Alert>
              <Divider sx={{ mb: 2 }} />
            </Box>
          );
        }

        if (
          trimmedSection.includes("Study Plan") ||
          trimmedSection.includes("study")
        ) {
          const planItems = trimmedSection.split(/[-•]/);
          return (
            <Box key={`study-${keyBase}`} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BookmarkBorder color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Study Plan
                </Typography>
              </Box>
              <List dense>
                {planItems.slice(1).map((item, i) => (
                  <ListItem key={`${i}-${item.trim().slice(0, 30)}`}>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={item.trim()} />
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ mb: 2 }} />
            </Box>
          );
        }

        if (
          trimmedSection.includes("Strategy") ||
          trimmedSection.includes("test-taking")
        ) {
          return (
            <Box key={`strategy-${keyBase}`} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Psychology color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  Test-Taking Strategy
                </Typography>
              </Box>
              <Card variant="outlined" sx={{ bgcolor: "warning.50", p: 2 }}>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {trimmedSection.replace(/\*\*.*Strategy\*\*:?/i, "").trim()}
                </Typography>
              </Card>
              <Divider sx={{ mb: 2 }} />
            </Box>
          );
        }

        if (
          trimmedSection.includes("Motivation") ||
          trimmedSection.includes("encouraging")
        ) {
          return (
            <Box key={`motivation-${keyBase}`} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TipsAndUpdates color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary">
                  Motivation & Goals
                </Typography>
              </Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {trimmedSection.replace(/\*\*Motivation\*\*:?/i, "").trim()}
                </Typography>
              </Alert>
            </Box>
          );
        }

        if (trimmedSection.length > 20) {
          return (
            <Box key={`default-${keyBase}`} sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                {trimmedSection}
              </Typography>
            </Box>
          );
        }

        return null;
      })}
    </Box>
  );
};

AIEvaluationRenderer.propTypes = {
  evaluation: PropTypes.string,
};

export default AIEvaluationRenderer;
