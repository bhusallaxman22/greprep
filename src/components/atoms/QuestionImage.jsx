import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Alert,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorIcon,
} from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * QuestionImage Component
 * Displays images for questions with accessibility support, loading states, and zoom functionality
 */
const QuestionImage = ({
  src,
  alt,
  description,
  maxWidth = "100%",
  maxHeight = "400px",
  showZoom = true,
  showDescription = true,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleZoomOpen = () => {
    setZoomOpen(true);
  };

  const handleZoomClose = () => {
    setZoomOpen(false);
  };

  if (!src) {
    return null;
  }

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          backgroundColor: "background.paper",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ position: "relative" }}>
          {/* Loading skeleton */}
          {imageLoading && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={300}
              animation="wave"
              sx={{ borderRadius: 1 }}
            />
          )}

          {/* Error state */}
          {imageError && (
            <Alert severity="warning" icon={<ErrorIcon />} sx={{ mb: 2 }}>
              <Typography variant="body2">
                Unable to load image. Please check your internet connection.
              </Typography>
              {description && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                  Image description: {description}
                </Typography>
              )}
            </Alert>
          )}

          {/* Image */}
          {!imageError && (
            <Box
              sx={{
                position: "relative",
                display: imageLoading ? "none" : "block",
              }}
            >
              <img
                src={src}
                alt={alt || description || "Question image"}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  width: "100%",
                  maxWidth,
                  maxHeight,
                  objectFit: "contain",
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[1],
                }}
              />

              {/* Zoom button */}
              {showZoom && !imageLoading && !imageError && (
                <IconButton
                  onClick={handleZoomOpen}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                    },
                    zIndex: 1,
                  }}
                  size="small"
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        {/* Image description */}
        {showDescription && description && !imageError && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 1,
              display: "block",
              fontStyle: "italic",
              lineHeight: 1.4,
            }}
          >
            {description}
          </Typography>
        )}
      </Paper>

      {/* Zoom dialog */}
      <Dialog
        open={zoomOpen}
        onClose={handleZoomClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            backgroundColor: "background.default",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6">Image Zoom</Typography>
          <IconButton onClick={handleZoomClose} edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 2,
          }}
        >
          <img
            src={src}
            alt={alt || description || "Question image"}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: theme.shape.borderRadius,
            }}
          />
        </DialogContent>
        {description && (
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        )}
      </Dialog>
    </>
  );
};

QuestionImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  description: PropTypes.string,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showZoom: PropTypes.bool,
  showDescription: PropTypes.bool,
};

export default QuestionImage;
