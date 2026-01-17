import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PhotoCamera,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const AdminProfile = () => {
  const { user, loadUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    position: '',
    department: '',
    avatar: null,
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailLowStock: true,
    emailNewUsers: false,
    pushNotifications: true,
  });

  // Load profile data only once
  useEffect(() => {
    if (user && !initialLoad) {
      loadProfile();
    }
  }, [user, initialLoad]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Query from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
        // If profile doesn't exist, initialize with defaults
        setProfileData(prev => ({
          ...prev,
          email: user.email || '',
        }));
        setLoading(false);
        return;
      }

      if (data) {
        // Split full_name into first and last name
        const nameParts = (data.full_name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Auto-fill position based on role
        const roleToPosition = {
          'admin': 'Admin',
          'manager': 'Manager',
          'employee': 'Employee'
        };
        const position = roleToPosition[data.role] || data.role || 'Employee';
        
        setProfileData({
          firstName: firstName,
          lastName: lastName,
          email: data.email || user.email || '',
          phone: data.phone || data.phone_number || '',
          position: position,
          department: data.department || '',
          avatar: data.avatar_url || null,
        });

        // Load notification preferences if they exist
        if (data.notification_preferences) {
          setNotifications(data.notification_preferences);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
      setInitialLoad(true);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setSnackbarMessage('First name and last name are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setSubmitting(true);

      // Update profile - first_name and last_name (full_name is auto-generated)
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName.trim(),
          last_name: profileData.lastName.trim(),
          phone: profileData.phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Reload profile in AuthContext to update navbar
      await loadUserProfile(user.id);
      
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbarMessage('Failed to update profile');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!passwordData.newPassword) {
      setSnackbarMessage('Please enter a new password');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSnackbarMessage('Password must be at least 6 characters');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbarMessage('Passwords do not match');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setSnackbarMessage('Password updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setSnackbarMessage('Failed to update password');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSnackbarMessage('Please upload an image file');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSnackbarMessage('Image size must be less than 2MB');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setUploadingImage(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state with timestamp to force refresh
      const avatarUrlWithTimestamp = `${avatarUrl}?t=${Date.now()}`;
      setProfileData((prev) => ({ ...prev, avatar: avatarUrlWithTimestamp }));
      
      // Reload profile in AuthContext to update navbar avatar
      await loadUserProfile(user.id);
      
      setSnackbarMessage('Avatar updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setSnackbarMessage('Failed to upload avatar');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: notifications,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setSnackbarMessage('Notification preferences updated!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating notifications:', error);
      setSnackbarMessage('Failed to update preferences');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading only on initial load, not on subsequent visits
  if (!initialLoad && loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header with Avatar */}
        <Box display="flex" alignItems="center" mb={4}>
          <Box position="relative" mr={3}>
            <Avatar
              src={profileData.avatar || undefined}
              sx={{ 
                width: 80, 
                height: 80,
                objectFit: 'cover',
                '& img': {
                  objectFit: 'cover'
                }
              }}
            >
              {profileData.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarUpload}
              disabled={uploadingImage}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  width: 32,
                  height: 32,
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
                disabled={uploadingImage}
              >
                {uploadingImage ? <CircularProgress size={16} color="inherit" /> : <PhotoCamera sx={{ fontSize: 16 }} />}
              </IconButton>
            </label>
          </Box>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: "Bruno Ace SC" }}>
                PROFILE SETTINGS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.firstName && profileData.lastName
                  ? `${profileData.firstName} ${profileData.lastName}`
                  : profileData.email}
              </Typography>
            </Box>
          </motion.div>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Profile Information" />
          <Tab label="Security" />
          <Tab label="Notifications" />
        </Tabs>

        {/* Tab Content */}
        <Box>
          {/* Profile Tab */}
          {activeTab === 0 && (
              <Box component="form" onSubmit={handleProfileUpdate}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Profile Information
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Update your personal information and contact details
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      required
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      required
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, lastName: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      disabled
                      value={profileData.email}
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      placeholder="+63 912 345 6789"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={profileData.position}
                      disabled
                      helperText="Position is based on your role"
                    />
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting && <CircularProgress size={20} />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}

            {/* Security Tab */}
            {activeTab === 1 && (
              <Box component="form" onSubmit={handlePasswordUpdate}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Security Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Change your password to keep your account secure
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      helperText="Minimum 6 characters"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting && <CircularProgress size={20} />}
                  >
                    Update Password
                  </Button>
                </Box>
              </Box>
            )}

            {/* Notifications Tab */}
            {activeTab === 2 && (
              <>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Notification Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Manage how you receive notifications
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailOrderUpdates}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            emailOrderUpdates: e.target.checked,
                          })
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          Email Order Updates
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Receive emails when new orders are placed
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailLowStock}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            emailLowStock: e.target.checked,
                          })
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          Low Stock Alerts
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Get notified when products are running low
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.emailNewUsers}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            emailNewUsers: e.target.checked,
                          })
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          New User Registrations
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Receive emails when new users register
                        </Typography>
                      </Box>
                    }
                  />
                  <Divider />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifications.pushNotifications}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            pushNotifications: e.target.checked,
                          })
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          Push Notifications
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Enable browser push notifications
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                <Box mt={3} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    onClick={handleNotificationUpdate}
                    disabled={submitting}
                    startIcon={submitting && <CircularProgress size={20} />}
                  >
                    Save Preferences
                  </Button>
                </Box>
              </>
            )}
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminProfile;
