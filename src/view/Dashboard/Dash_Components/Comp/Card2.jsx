import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
// You might need to install Material Icons if not already installed
// npm install @mui/icons-material
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"; // Example icon, you can replace with another if preferred

const BaseCard2 = ({
  title,
  value,
  iconComponent: IconComponent, // Renamed prop for clarity
}) => {
  return (
    <Card
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        padding: 2,
        minWidth: 240,
        minHeight: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        margin: 1, // Use margin from the parent grid for spacing
        overflow: "hidden", // Hide overflow for background icon
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 1 }}>
        {" "}
        {/* Use sx for padding */}
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
      </CardContent>

      {/* Background Icon */}
      <Box
        sx={{
          position: "absolute",
          bottom: -10,
          right: -10,
          fontSize: "100px",
          color: "#f0f0f0",
          zIndex: 0,
          transform: "rotate(-15deg)",
        }}
      >
        {IconComponent ? <IconComponent sx={{ fontSize: "inherit" }} /> : null}
      </Box>
    </Card>
  );
};

export default BaseCard2;
