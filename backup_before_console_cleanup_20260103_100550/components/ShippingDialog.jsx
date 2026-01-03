import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const ShippingDialog = ({ open, onClose, onSubmit, orderNumber }) => {
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = () => {
    if (courierName.trim() && trackingNumber.trim()) {
      onSubmit({
        courierName: courierName.trim(),
        trackingNumber: trackingNumber.trim()
      });
      // Reset fields
      setCourierName('');
      setTrackingNumber('');
    }
  };

  const handleClose = () => {
    setCourierName('');
    setTrackingNumber('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      sx={{ zIndex: 1500 }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LocalShippingIcon sx={{ color: '#00E676' }} />
          <Typography variant="h6">Mark Order as Shipped</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Order: <strong>{orderNumber}</strong>
          </Typography>
          
          <TextField
            label="Courier Name"
            placeholder="e.g., J&T Express, LBC, Ninjavan"
            fullWidth
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            autoFocus
            required
          />
          
          <TextField
            label="Tracking Number"
            placeholder="Enter tracking/waybill number"
            fullWidth
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!courierName.trim() || !trackingNumber.trim()}
          sx={{
            bgcolor: '#00E676',
            '&:hover': { bgcolor: '#00C767' }
          }}
        >
          Mark as Shipped
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShippingDialog;
