import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const SummaryCard = ({ title, value, icon: IconComponent, bgColor, borderColor, textColor }) => {
  return (
    <Card
      sx={{
        background: bgColor || "#fff",
        border: `1px solid ${borderColor || "#e0e0e0"}`,
        borderRadius: 3,
        boxShadow: 3,
        padding: 2,
        minWidth: 240,
        minHeight: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        margin: 1,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={500}
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color: textColor }}>
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
          color: textColor || "#f0f0f0",
          opacity: 0.15,
          zIndex: 0,
          transform: "rotate(-15deg)",
        }}
      >
        {IconComponent ? <IconComponent style={{ fontSize: 'inherit' }} /> : null}
      </Box>
    </Card>
  );
};

export default SummaryCard;
