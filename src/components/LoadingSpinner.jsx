import React from 'react';
import { Box, keyframes } from '@mui/material';

// Pulse animation for the logo
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
`;

// Glow effect animation
const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 230, 118, 0.3),
                0 0 40px rgba(0, 230, 118, 0.2),
                0 0 60px rgba(0, 230, 118, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 230, 118, 0.5),
                0 0 60px rgba(0, 230, 118, 0.3),
                0 0 90px rgba(0, 230, 118, 0.2);
  }
`;

// Spinner rotation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        width: '100%',
        p: 3,
      }}
    >
      {/* Logo with pulse and glow effect */}
      <Box
        sx={{
          position: 'relative',
          width: '120px',
          height: '80px',
          mb: 3,
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      >
        {/* Glow background */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '140px',
            height: '100px',
            borderRadius: '20px',
            animation: `${glow} 2s ease-in-out infinite`,
            zIndex: 0,
          }}
        />
        
        {/* Logo image */}
        <img
          src="https://i.ibb.co/Cpx2BBt5"
          alt="EGIE Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </Box>

      {/* Spinning border/ring */}
      <Box
        sx={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(0, 230, 118, 0.1)',
          borderTop: '4px solid #00E676',
          borderRadius: '50%',
          animation: `${spin} 1s linear infinite`,
          mb: 2,
        }}
      />

      {/* Loading text */}
      <Box
        sx={{
          color: '#00E676',
          fontSize: '16px',
          fontWeight: 500,
          letterSpacing: '0.5px',
        }}
      >
        {message}
      </Box>

      {/* Animated dots */}
      <Box
        sx={{
          display: 'flex',
          gap: '8px',
          mt: 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#00E676',
              animation: `${pulse} 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LoadingSpinner;
