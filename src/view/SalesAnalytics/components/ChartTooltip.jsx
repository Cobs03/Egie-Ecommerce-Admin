import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * ChartTooltip Component
 * Reusable custom tooltip for Recharts visualizations
 * 
 * @param {Object} props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Chart data payload
 * @param {string} props.label - Label for the tooltip
 * @param {Function} props.formatCurrency - Function to format currency values
 */
const ChartTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'white',
          p: 2,
          border: '1px solid #ccc',
          borderRadius: 1,
          boxShadow: 2
        }}
      >
        <Typography variant="body2" fontWeight={600} mb={1}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default ChartTooltip;
