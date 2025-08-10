import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

function StatCard({ icon, title, value, loading, valueColor = "primary" }) {
  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": { transform: "translateY(-8px)", boxShadow: 6 },
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Typography variant="h3" color={valueColor} sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  value: PropTypes.node,
  loading: PropTypes.bool,
  valueColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default StatCard;
