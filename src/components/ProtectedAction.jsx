import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, getPermissionLabel } from '../utils/permissions';
import { Alert, Box, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

/**
 * ProtectedAction Component
 * Wraps actions that require specific permissions
 * Shows error message if user lacks permission
 * 
 * @param {string} permission - Required permission
 * @param {React.ReactNode} children - Content to render if authorized
 * @param {React.ReactNode} fallback - Content to render if not authorized (optional)
 * @param {boolean} showError - Whether to show error message (default: true)
 * @param {string} action - Action name for error message (default: derived from permission)
 */
const ProtectedAction = ({ 
  permission, 
  children, 
  fallback = null, 
  showError = true,
  action = null
}) => {
  const { user } = useAuth();
  const userRole = user?.role || 'employee';
  
  // Check if user has the required permission
  const authorized = hasPermission(userRole, permission);
  
  // If authorized, render children
  if (authorized) {
    return <>{children}</>;
  }
  
  // If not authorized and no error should be shown, return fallback or null
  if (!showError) {
    return fallback;
  }
  
  // Show error message
  const actionName = action || getPermissionLabel(permission);
  
  return (
    <Box sx={{ p: 2 }}>
      <Alert 
        severity="error" 
        icon={<BlockIcon />}
        sx={{
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body2">
          You do not have permission to <strong>{actionName}</strong>.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Your role: <strong>{userRole.toUpperCase()}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Contact an administrator if you need access to this feature.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ProtectedAction;
