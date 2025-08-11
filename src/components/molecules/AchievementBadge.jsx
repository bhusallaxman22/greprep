import { Box, Typography, Chip, Tooltip } from "@mui/material";
import {
  EmojiEvents as EmojiEventsIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  Star as StarIcon,
  MilitaryTech as MilitaryTechIcon,
  FlashOn as FlashOnIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Diamond as DiamondIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

const BADGE_ICONS = {
  "Word Warrior": LocalFireDepartmentIcon,
  "Foundation Builder": StarIcon,
  "Vocabulary Master": PsychologyIcon,
  "Word Ninja": FlashOnIcon,
  "Speed Reader": FlashOnIcon,
  "Comprehension King": EmojiEventsIcon,
  "Logic Detective": PsychologyIcon,
  "Argument Crusher": MilitaryTechIcon,
  "Sentence Artist": AutoAwesomeIcon,
  "Context Master": PsychologyIcon,
  "Number Ninja": FlashOnIcon,
  "Foundation Master": StarIcon,
  "Algebra Warrior": MilitaryTechIcon,
  "Equation Slayer": LocalFireDepartmentIcon,
  "Geometry Architect": AutoAwesomeIcon,
  "Shape Master": StarIcon,
  "Data Detective": PsychologyIcon,
  "Statistics Sage": DiamondIcon,
  "Problem Solver": MilitaryTechIcon,
  "Real-World Master": EmojiEventsIcon,
  "Essay Architect": AutoAwesomeIcon,
  "Structure Master": StarIcon,
  "Argument Judge": MilitaryTechIcon,
  "Critical Thinker": PsychologyIcon,
  "Persuasion Master": EmojiEventsIcon,
  "Rhetoric King": DiamondIcon,
  "Chart Wizard": AutoAwesomeIcon,
  "Visual Master": StarIcon,
  "Info Detective": PsychologyIcon,
  "Synthesis Master": DiamondIcon,
  "Logic Expert": MilitaryTechIcon,
  "Puzzle Master": AutoAwesomeIcon,
  "Speed Demon": FlashOnIcon,
  "Time Master": DiamondIcon,
  "Elimination Ninja": FlashOnIcon,
  "Strategy Master": MilitaryTechIcon,
  "Ultimate Fighter": EmojiEventsIcon,
  "Grand Master": DiamondIcon,
  "Verbal Boss": EmojiEventsIcon,
  "Crown Holder": DiamondIcon,
  "Math Olympian": EmojiEventsIcon,
  "Gold Medalist": DiamondIcon,
};

const BADGE_COLORS = {
  beginner: "success",
  intermediate: "primary",
  advanced: "secondary",
  expert: "warning",
};

const BADGE_DESCRIPTIONS = {
  "Word Warrior": "Mastered foundational vocabulary skills",
  "Foundation Builder": "Built strong learning foundations",
  "Vocabulary Master": "Conquered advanced vocabulary",
  "Word Ninja": "Lightning-fast word recognition",
  "Speed Reader": "Rapid reading with comprehension",
  "Comprehension King": "Master of reading analysis",
  "Logic Detective": "Expert at finding logical flaws",
  "Argument Crusher": "Destroys weak arguments",
  "Sentence Artist": "Creates perfect sentences",
  "Context Master": "Reads between the lines",
  "Number Ninja": "Mathematical foundations expert",
  "Foundation Master": "Solid mathematical base",
  "Algebra Warrior": "Conquers algebraic challenges",
  "Equation Slayer": "Solves equations effortlessly",
  "Geometry Architect": "Designs geometric solutions",
  "Shape Master": "Geometry expert",
  "Data Detective": "Uncovers data insights",
  "Statistics Sage": "Wisdom in data analysis",
  "Problem Solver": "Tackles complex problems",
  "Real-World Master": "Applies math to reality",
  "Essay Architect": "Builds perfect essays",
  "Structure Master": "Organizes thoughts clearly",
  "Argument Judge": "Evaluates arguments fairly",
  "Critical Thinker": "Thinks deeply and clearly",
  "Persuasion Master": "Convinces with words",
  "Rhetoric King": "Rules the art of persuasion",
  "Chart Wizard": "Magical chart interpretation",
  "Visual Master": "Sees data clearly",
  "Info Detective": "Synthesizes information",
  "Synthesis Master": "Combines knowledge expertly",
  "Logic Expert": "Master of logical reasoning",
  "Puzzle Master": "Solves complex puzzles",
  "Speed Demon": "Incredible speed and accuracy",
  "Time Master": "Controls time efficiently",
  "Elimination Ninja": "Eliminates wrong answers swiftly",
  "Strategy Master": "Plans perfect approaches",
  "Ultimate Fighter": "Faces any challenge",
  "Grand Master": "Achieved the highest level",
  "Verbal Boss": "Defeated the verbal challenge",
  "Crown Holder": "Royalty of verbal reasoning",
  "Math Olympian": "Olympic-level mathematics",
  "Gold Medalist": "First place in mathematics",
};

const AchievementBadge = ({
  badge,
  earned = false,
  size = "medium",
  showDescription = true,
  variant = "filled",
}) => {
  const IconComponent = BADGE_ICONS[badge] || EmojiEventsIcon;
  const description = BADGE_DESCRIPTIONS[badge] || "Achievement unlocked!";

  const sizes = {
    small: { width: 32, height: 32, fontSize: "0.75rem" },
    medium: { width: 40, height: 40, fontSize: "0.875rem" },
    large: { width: 48, height: 48, fontSize: "1rem" },
  };

  const badgeElement = (
    <Chip
      icon={
        <IconComponent
          sx={{
            fontSize: sizes[size].fontSize,
            color: earned ? "inherit" : "action.disabled",
          }}
        />
      }
      label={badge}
      variant={variant}
      color={earned ? "primary" : "default"}
      sx={{
        height: sizes[size].height,
        fontSize: sizes[size].fontSize,
        fontWeight: earned ? 600 : 400,
        opacity: earned ? 1 : 0.5,
        filter: earned ? "none" : "grayscale(1)",
        transform: earned ? "scale(1)" : "scale(0.95)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: earned ? "scale(1.05)" : "scale(1)",
          opacity: earned ? 1 : 0.7,
        },
        background: earned
          ? "linear-gradient(45deg, #FFD700 30%, #FFA500 90%)"
          : "transparent",
        color: earned ? "#000" : "text.secondary",
        border: earned ? "2px solid #FFD700" : "1px solid",
        borderColor: earned ? "#FFD700" : "divider",
      }}
    />
  );

  if (!showDescription) {
    return badgeElement;
  }

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {badge}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {description}
          </Typography>
          {!earned && (
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontStyle: "italic" }}
            >
              Not yet earned
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      {badgeElement}
    </Tooltip>
  );
};

AchievementBadge.propTypes = {
  badge: PropTypes.string.isRequired,
  earned: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  showDescription: PropTypes.bool,
  variant: PropTypes.oneOf(["filled", "outlined"]),
};

export default AchievementBadge;
