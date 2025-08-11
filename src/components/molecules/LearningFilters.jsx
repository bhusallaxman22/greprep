import React from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Badge,
  Typography,
} from "@mui/material";
import { Search, FilterList, Clear } from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * Learning module filter controls molecule
 */
const LearningFilters = ({
  categories = [],
  selectedCategory = "all",
  onCategoryChange,
  searchQuery = "",
  onSearchChange,
  difficulty = "all",
  onDifficultyChange,
  sortBy = "recommended",
  onSortChange,
  showFilters = true,
  moduleCount = 0,
  filteredCount = 0,
}) => {
  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" },
  ];

  const sortOptions = [
    { value: "recommended", label: "Recommended" },
    { value: "difficulty", label: "Difficulty" },
    { value: "duration", label: "Duration" },
    { value: "title", label: "Title" },
    { value: "progress", label: "Progress" },
  ];

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    difficulty !== "all" ||
    sortBy !== "recommended";

  const clearAllFilters = () => {
    onSearchChange("");
    onCategoryChange("all");
    onDifficultyChange("all");
    onSortChange("recommended");
  };

  return (
    <Box>
      {/* Category Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, value) => onCategoryChange(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minHeight: 48,
            },
          }}
        >
          {categories.map((category) => (
            <Tab
              key={category.id}
              value={category.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {category.icon}
                  {category.label}
                  {category.count !== undefined && (
                    <Chip
                      label={category.count}
                      size="small"
                      color={category.color || "default"}
                      variant="outlined"
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Search and Filters */}
      {showFilters && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          {/* Search */}
          <TextField
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            sx={{
              flexGrow: 1,
              maxWidth: { xs: "100%", sm: 300 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange("")}
                    edge="end"
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Difficulty Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              label="Difficulty"
            >
              {difficulties.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sort Options */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              label="Sort by"
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Tooltip title="Clear all filters">
              <IconButton onClick={clearAllFilters} color="primary">
                <Badge
                  badgeContent="!"
                  color="error"
                  variant="dot"
                  invisible={!hasActiveFilters}
                >
                  <FilterList />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* Results Count */}
      {moduleCount > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredCount === moduleCount
              ? `Showing all ${moduleCount} modules`
              : `Showing ${filteredCount} of ${moduleCount} modules`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

LearningFilters.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      color: PropTypes.string,
      count: PropTypes.number,
    })
  ),
  selectedCategory: PropTypes.string,
  onCategoryChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  difficulty: PropTypes.string,
  onDifficultyChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string,
  onSortChange: PropTypes.func.isRequired,
  showFilters: PropTypes.bool,
  moduleCount: PropTypes.number,
  filteredCount: PropTypes.number,
};

export default LearningFilters;
