import React from 'react';
import { Box } from '@mui/material';

const LoadingSpinner = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </Box>
  );
};

export default LoadingSpinner;
