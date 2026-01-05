import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import PolicyBreachNotificationService from '../../../EGIE-Ecommerce/src/services/PolicyBreachNotificationService';

export default function PolicyVersionManagement() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [notificationProgress, setNotificationProgress] = useState(null);
  const [formData, setFormData] = useState({
    policy_type: 'privacy_policy',
    version: '',
    title: '',
    summary: '',
    content: '',
    changes_from_previous: '',
    effective_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_versions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (policy = null) => {
    if (policy) {
      setFormData({
        policy_type: policy.policy_type,
        version: policy.version,
        title: policy.title,
        summary: policy.summary || '',
        content: policy.content,
        changes_from_previous: policy.changes_from_previous || '',
        effective_date: policy.effective_date.split('T')[0]
      });
      setSelectedPolicy(policy);
    } else {
      setFormData({
        policy_type: 'privacy_policy',
        version: '',
        title: '',
        summary: '',
        content: '',
        changes_from_previous: '',
        effective_date: new Date().toISOString().split('T')[0]
      });
      setSelectedPolicy(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPolicy(null);
  };

  const handleSavePolicy = async () => {
    try {
      setLoading(true);

      if (selectedPolicy) {
        // Update existing
        const { error } = await supabase
          .from('policy_versions')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedPolicy.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('policy_versions')
          .insert([formData]);

        if (error) throw error;
      }

      await fetchPolicies();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving policy:', error);
      alert('Failed to save policy: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishPolicy = async (policyId) => {
    try {
      const { error } = await supabase
        .from('policy_versions')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', policyId);

      if (error) throw error;
      await fetchPolicies();
    } catch (error) {
      console.error('Error publishing policy:', error);
      alert('Failed to publish policy: ' + error.message);
    }
  };

  const handleOpenNotifyDialog = (policy) => {
    setSelectedPolicy(policy);
    setNotifyDialogOpen(true);
  };

  const handleSendNotifications = async () => {
    try {
      setNotificationProgress({ status: 'sending', message: 'Sending notifications...' });

      const results = await PolicyBreachNotificationService.notifyPolicyChange(selectedPolicy.id);

      setNotificationProgress({
        status: 'complete',
        message: `✅ Notifications sent successfully!`,
        details: `Sent: ${results.sent}, Failed: ${results.failed}, Total: ${results.total}`,
        results
      });

      await fetchPolicies();
    } catch (error) {
      console.error('Error sending notifications:', error);
      setNotificationProgress({
        status: 'error',
        message: '❌ Failed to send notifications: ' + error.message
      });
    }
  };

  const getStatusChip = (policy) => {
    if (policy.notification_sent) {
      return <Chip label="Notified" color="success" size="small" />;
    } else if (policy.status === 'published') {
      return <Chip label="Published" color="primary" size="small" />;
    } else {
      return <Chip label="Draft" color="default" size="small" />;
    }
  };

  if (loading && policies.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Policy Version Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create New Version
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage privacy policy and terms of service versions. Users will be notified of changes via email and in-app notifications.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Effective Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notification Sent</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>
                  <Chip
                    label={policy.policy_type === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service'}
                    color={policy.policy_type === 'privacy_policy' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{policy.version}</TableCell>
                <TableCell>{policy.title}</TableCell>
                <TableCell>{new Date(policy.effective_date).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusChip(policy)}</TableCell>
                <TableCell>
                  {policy.notification_sent_at 
                    ? new Date(policy.notification_sent_at).toLocaleString()
                    : '-'}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(policy)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {policy.status !== 'published' && (
                    <Button
                      size="small"
                      onClick={() => handlePublishPolicy(policy.id)}
                    >
                      Publish
                    </Button>
                  )}
                  {policy.status === 'published' && !policy.notification_sent && (
                    <Button
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={() => handleOpenNotifyDialog(policy)}
                      color="primary"
                    >
                      Send Notifications
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPolicy ? 'Edit Policy Version' : 'Create New Policy Version'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Policy Type</InputLabel>
              <Select
                value={formData.policy_type}
                onChange={(e) => setFormData({ ...formData, policy_type: e.target.value })}
                label="Policy Type"
              >
                <MenuItem value="privacy_policy">Privacy Policy</MenuItem>
                <MenuItem value="terms_of_service">Terms of Service</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g., 2.0"
              required
            />

            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Updated Data Processing Terms"
              required
            />

            <TextField
              label="Summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief summary of changes"
              multiline
              rows={2}
            />

            <TextField
              label="Changes from Previous Version"
              value={formData.changes_from_previous}
              onChange={(e) => setFormData({ ...formData, changes_from_previous: e.target.value })}
              placeholder="List of changes"
              multiline
              rows={3}
            />

            <TextField
              label="Full Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Full policy content (HTML or Markdown)"
              multiline
              rows={10}
              required
            />

            <TextField
              label="Effective Date"
              type="date"
              value={formData.effective_date}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePolicy} variant="contained" disabled={loading}>
            {selectedPolicy ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Notifications Dialog */}
      <Dialog open={notifyDialogOpen} onClose={() => setNotifyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Policy Change Notifications</DialogTitle>
        <DialogContent>
          {!notificationProgress ? (
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" gutterBottom>
                Send notifications to all users who haven't accepted this policy version yet?
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                This will send both email and in-app notifications. This action cannot be undone.
              </Alert>
              {selectedPolicy && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Policy:</strong> {selectedPolicy.policy_type === 'privacy_policy' ? 'Privacy Policy' : 'Terms of Service'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Version:</strong> {selectedPolicy.version}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Title:</strong> {selectedPolicy.title}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ py: 2 }}>
              {notificationProgress.status === 'sending' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={24} />
                  <Typography>{notificationProgress.message}</Typography>
                </Box>
              )}
              {notificationProgress.status === 'complete' && (
                <>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {notificationProgress.message}
                  </Alert>
                  <Typography variant="body2">
                    {notificationProgress.details}
                  </Typography>
                  {notificationProgress.results?.errors?.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Some notifications failed. Check console for details.
                    </Alert>
                  )}
                </>
              )}
              {notificationProgress.status === 'error' && (
                <Alert severity="error">
                  {notificationProgress.message}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!notificationProgress && (
            <>
              <Button onClick={() => setNotifyDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSendNotifications}
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
              >
                Send Notifications
              </Button>
            </>
          )}
          {notificationProgress && (
            <Button onClick={() => {
              setNotifyDialogOpen(false);
              setNotificationProgress(null);
            }}>
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
