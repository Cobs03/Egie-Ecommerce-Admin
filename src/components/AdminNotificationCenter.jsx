import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Notifications,
  Security,
  Warning,
  Error,
  Info,
  CheckCircle,
  Close,
  Done,
  NotificationsActive
} from '@mui/icons-material';
import { supabase } from '../../../config/supabaseClient';

export default function AdminNotificationCenter() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [playSound, setPlaySound] = useState(true);

  useEffect(() => {
    loadNotifications();
    subscribeToNotifications();
    
    // Check for new notifications every 30 seconds as backup
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get unread notifications for this admin
      const { data: unread } = await supabase
        .from('admin_notifications')
        .select(`
          *,
          notification_delivery_log!inner(recipient_id)
        `)
        .eq('notification_delivery_log.recipient_id', user.id)
        .eq('notification_delivery_log.channel', 'in_app')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (unread) {
        const previousCount = unreadCount;
        setNotifications(unread);
        setUnreadCount(unread.length);

        // Play sound if new notification arrived
        if (unread.length > previousCount && playSound) {
          playNotificationSound();
        }
      }

      // Also get count using the function
      const { data: count } = await supabase
        .rpc('get_unread_notification_count', { p_admin_user_id: user.id });

      if (count !== null) {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    // Subscribe to real-time changes on admin_notifications table
    const subscription = supabase
      .channel('admin_notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications'
        },
        (payload) => {
          console.log('New notification received:', payload);
          loadNotifications(); // Reload all notifications
          
          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/logo.png',
              badge: '/logo.png',
              tag: payload.new.id
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Could not play sound:', err));
    } catch (error) {
      console.log('Notification sound not available');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    requestNotificationPermission();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('mark_notification_read', {
        p_notification_id: notificationId,
        p_admin_user_id: user.id
      });

      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markActionTaken = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('mark_notification_action_taken', {
        p_notification_id: selectedNotification.id,
        p_admin_user_id: user.id,
        p_action_notes: actionNotes
      });

      setActionDialog(false);
      setActionNotes('');
      setSelectedNotification(null);
      loadNotifications();
    } catch (error) {
      console.error('Error marking action taken:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <Error color="error" />;
      case 'high':
        return <Warning color="error" />;
      case 'medium':
        return <Warning color="warning" />;
      case 'low':
        return <Info color="info" />;
      default:
        return <Notifications />;
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'error',
      medium: 'warning',
      low: 'info'
    };
    return colors[severity] || 'default';
  };

  const getNotificationTypeLabel = (type) => {
    return type.replace(/_/g, ' ').toUpperCase();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <NotificationsActive sx={{ animation: 'pulse 2s infinite' }} />
          ) : (
            <Notifications />
          )}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 450, maxHeight: 600 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Typography>
            <IconButton size="small" onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No new notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 450, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <ListItemIcon sx={{ mt: 1 }}>
                    {getSeverityIcon(notification.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.severity}
                          size="small"
                          color={getSeverityColor(notification.severity)}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={getNotificationTypeLabel(notification.notification_type)}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                        {notification.requires_action && !notification.action_taken && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Done />}
                            sx={{ mt: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNotification(notification);
                              setActionDialog(true);
                            }}
                          >
                            Mark Action Taken
                          </Button>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Button size="small" onClick={() => {
              handleClose();
              window.location.href = '/admin/notifications';
            }}>
              View All Notifications
            </Button>
          </Box>
        )}
      </Popover>

      {/* Action Taken Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Action Taken</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <>
              <Alert severity={getSeverityColor(selectedNotification.severity)} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{selectedNotification.title}</Typography>
                <Typography variant="body2">{selectedNotification.message}</Typography>
              </Alert>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Action Notes (optional)"
                placeholder="Describe what action was taken to resolve this notification..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancel</Button>
          <Button onClick={markActionTaken} variant="contained">
            Confirm Action Taken
          </Button>
        </DialogActions>
      </Dialog>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </>
  );
}
