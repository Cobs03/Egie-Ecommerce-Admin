import React from 'react';
import { Chip } from '@mui/material';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CancelIcon from '@mui/icons-material/Cancel';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'New',
      color: '#fff',
      bgcolor: '#FFA726',
      icon: <PendingIcon />
    },
    confirmed: {
      label: 'Confirmed',
      color: '#fff',
      bgcolor: '#42A5F5',
      icon: <CheckCircleIcon />
    },
    processing: {
      label: 'Processing',
      color: '#fff',
      bgcolor: '#FF9800',
      icon: <HourglassTopIcon />
    },
    shipped: {
      label: 'Shipped',
      color: '#fff',
      bgcolor: '#AB47BC',
      icon: <LocalShippingIcon />
    },
    ready_for_pickup: {
      label: 'Ready for Pickup',
      color: '#fff',
      bgcolor: '#00BCD4',
      icon: <CheckCircleIcon />
    },
    delivered: {
      label: 'Delivered',
      color: '#fff',
      bgcolor: '#4CAF50',
      icon: <TaskAltIcon />
    },
    cancelled: {
      label: 'Cancelled',
      color: '#fff',
      bgcolor: '#F44336',
      icon: <CancelIcon />
    },
    completed: {
      label: 'Completed',
      color: '#fff',
      bgcolor: '#4CAF50',
      icon: <TaskAltIcon />
    }
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      sx={{
        color: config.color,
        bgcolor: config.bgcolor,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: config.color
        }
      }}
    />
  );
};

export default StatusBadge;
