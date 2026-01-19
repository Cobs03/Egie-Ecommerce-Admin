import React, { useState } from "react";
import { Card, CardContent, Typography, Box, Tooltip } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

const BaseCard2 = ({
  title,
  value,
  iconComponent: IconComponent,
  onClick,
  tooltipText,
  displayValue,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format value to show 99+ if exceeds 99
  const numericValue = parseInt(value);
  const shouldShowPlus = !isNaN(numericValue) && numericValue > 99;
  const displayText = displayValue || (shouldShowPlus ? "99+" : value);
  
  const cardContent = (
    <Card
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.15)" : 3,
        padding: 2,
        minWidth: 240,
        minHeight: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        margin: 1,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: isHovered ? "1px solid #e0e0e0" : "1px solid transparent",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 1, zIndex: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>
        {shouldShowPlus ? (
          <Tooltip title={`Actual count: ${value}`} arrow placement="top">
            <Typography variant="h4" fontWeight={700} sx={{ cursor: "help" }}>
              {displayText}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="h4" fontWeight={700}>
            {displayText}
          </Typography>
        )}
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
  
  return tooltipText ? (
    <Tooltip title={tooltipText} arrow placement="top">
      {cardContent}
    </Tooltip>
  ) : (
    cardContent
  );
};

export default BaseCard2;
