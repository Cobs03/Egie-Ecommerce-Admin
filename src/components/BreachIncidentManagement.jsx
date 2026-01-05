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
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Send as SendIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import PolicyBreachNotificationService from '../../../EGIE-Ecommerce/src/services/PolicyBreachNotificationService';

export default function BreachIncidentManagement() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [notificationProgress, setNotificationProgress] = useState(null);
  const [formData, setFormData] = useState({
    incident_number: '',
    title: '',
    description: '',
    severity: 'medium',
    breach_date: new Date().toISOString().split('T')[0],
    discovered_date: new Date().toISOString().split('T')[0],
    contained_date: '',
    data_types_affected: [],
    affected_users_count: 0,
    mitigation_steps: '',
    user_actions_required: '',
    support_contact: '',
    status: 'investigating'
  });

  const dataTypes = [
    'Email addresses',
    'Names',
    'Phone numbers',
    'Addresses',
    'Payment information',
    'Order history',
    'IP addresses',
    'Browsing history',
    'Account credentials',
    'Personal preferences'
  ];

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('data_breach_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (incident = null) => {
    if (incident) {
      setFormData({
        incident_number: incident.incident_number,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        breach_date: incident.breach_date.split('T')[0],
        discovered_date: incident.discovered_date.split('T')[0],
        contained_date: incident.contained_date ? incident.contained_date.split('T')[0] : '',
        data_types_affected: incident.data_types_affected || [],
        affected_users_count: incident.affected_users_count || 0,
        mitigation_steps: incident.mitigation_steps || '',
        user_actions_required: incident.user_actions_required || '',
        support_contact: incident.support_contact || '',
        status: incident.status
      });
      setSelectedIncident(incident);
    } else {
      // Generate incident number
      const incidentNumber = `INC-${Date.now().toString().slice(-8)}`;
      setFormData({
        incident_number: incidentNumber,
        title: '',
        description: '',
        severity: 'medium',
        breach_date: new Date().toISOString().split('T')[0],
        discovered_date: new Date().toISOString().split('T')[0],
        contained_date: '',
        data_types_affected: [],
        affected_users_count: 0,
        mitigation_steps: '',
        user_actions_required: '',
        support_contact: '',
        status: 'investigating'
      });
      setSelectedIncident(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
  };

  const handleSaveIncident = async () => {
    try {
      setLoading(true);

      if (selectedIncident) {
        // Update existing
        const { error } = await supabase
          .from('data_breach_incidents')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedIncident.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('data_breach_incidents')
          .insert([formData]);

        if (error) throw error;
      }

      await fetchIncidents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving incident:', error);
      alert('Failed to save incident: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkContained = async (incidentId) => {
    try {
      const { error } = await supabase
        .from('data_breach_incidents')
        .update({
          status: 'contained',
          contained_date: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (error) throw error;
      await fetchIncidents();
    } catch (error) {
      console.error('Error marking incident as contained:', error);
      alert('Failed to update incident: ' + error.message);
    }
  };

  const handleOpenNotifyDialog = (incident) => {
    setSelectedIncident(incident);
    setNotifyDialogOpen(true);
  };

  const handleSendNotifications = async () => {
    try {
      setNotificationProgress({ status: 'sending', message: 'Sending breach notifications...' });

      const results = await PolicyBreachNotificationService.notifyDataBreach(selectedIncident.id);

      setNotificationProgress({
        status: 'complete',
        message: `✅ Breach notifications sent successfully!`,
        details: `Sent: ${results.sent}, Failed: ${results.failed}, Total: ${results.total}`,
        results
      });

      await fetchIncidents();
    } catch (error) {
      console.error('Error sending notifications:', error);
      setNotificationProgress({
        status: 'error',
        message: '❌ Failed to send notifications: ' + error.message
      });
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[severity] || 'default';
  };

  const getStatusChip = (incident) => {
    const statusConfig = {
      investigating: { label: 'Investigating', color: 'warning' },
      contained: { label: 'Contained', color: 'info' },
      resolved: { label: 'Resolved', color: 'success' }
    };
    const config = statusConfig[incident.status] || { label: incident.status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (loading && incidents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Data Breach Incident Management</Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Report New Incident
        </Button>
      </Box>

      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>⚠️ GDPR Article 34:</strong> Users must be notified within 72 hours of discovering a data breach that affects their rights and freedoms.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Incident #</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Breach Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Affected Users</TableCell>
              <TableCell>Notified</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell><strong>{incident.incident_number}</strong></TableCell>
                <TableCell>{incident.title}</TableCell>
                <TableCell>
                  <Chip
                    label={incident.severity.toUpperCase()}
                    color={getSeverityColor(incident.severity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(incident.breach_date).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusChip(incident)}</TableCell>
                <TableCell>{incident.affected_users_count || 'Unknown'}</TableCell>
                <TableCell>
                  {incident.notification_sent_at ? (
                    <Chip label="✓ Sent" color="success" size="small" />
                  ) : (
                    <Chip label="✗ Pending" color="error" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(incident)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {incident.status === 'investigating' && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkContained(incident.id)}
                      title="Mark as Contained"
                      color="success"
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  )}
                  {!incident.users_notified && (
                    <Button
                      size="small"
                      startIcon={<SendIcon />}
                      onClick={() => handleOpenNotifyDialog(incident)}
                      color="error"
                    >
                      Notify Users
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
          {selectedIncident ? 'Edit Incident' : 'Report New Security Incident'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Incident Number"
              value={formData.incident_number}
              disabled
            />

            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Unauthorized Access to User Database"
              required
            />

            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                label="Severity"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the incident"
              multiline
              rows={3}
              required
            />

            <TextField
              label="Breach Date"
              type="date"
              value={formData.breach_date}
              onChange={(e) => setFormData({ ...formData, breach_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Discovered Date"
              type="date"
              value={formData.discovered_date}
              onChange={(e) => setFormData({ ...formData, discovered_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Contained Date"
              type="date"
              value={formData.contained_date}
              onChange={(e) => setFormData({ ...formData, contained_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <Box>
              <Typography variant="body2" gutterBottom>Data Types Affected:</Typography>
              <FormGroup>
                {dataTypes.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={formData.data_types_affected.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...formData.data_types_affected, type]
                            : formData.data_types_affected.filter(t => t !== type);
                          setFormData({ ...formData, data_types_affected: newTypes });
                        }}
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </Box>

            <TextField
              label="Affected Users Count"
              type="number"
              value={formData.affected_users_count}
              onChange={(e) => setFormData({ ...formData, affected_users_count: parseInt(e.target.value) || 0 })}
            />

            <TextField
              label="Mitigation Steps Taken"
              value={formData.mitigation_steps}
              onChange={(e) => setFormData({ ...formData, mitigation_steps: e.target.value })}
              placeholder="What actions have been taken to mitigate the breach?"
              multiline
              rows={3}
            />

            <TextField
              label="Actions Required from Users"
              value={formData.user_actions_required}
              onChange={(e) => setFormData({ ...formData, user_actions_required: e.target.value })}
              placeholder="What should users do? (e.g., change password)"
              multiline
              rows={2}
            />

            <TextField
              label="Support Contact"
              value={formData.support_contact}
              onChange={(e) => setFormData({ ...formData, support_contact: e.target.value })}
              placeholder="support@example.com"
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="investigating">Investigating</MenuItem>
                <MenuItem value="contained">Contained</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveIncident} variant="contained" color="error" disabled={loading}>
            {selectedIncident ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Notifications Dialog */}
      <Dialog open={notifyDialogOpen} onClose={() => setNotifyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🚨 Send Breach Notifications</DialogTitle>
        <DialogContent>
          {!notificationProgress ? (
            <Box sx={{ py: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>URGENT:</strong> This will send immediate breach notifications to all affected users via email and in-app notifications.
              </Alert>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to notify users about this security incident?
              </Typography>
              {selectedIncident && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2"><strong>Incident:</strong> {selectedIncident.incident_number}</Typography>
                  <Typography variant="body2"><strong>Title:</strong> {selectedIncident.title}</Typography>
                  <Typography variant="body2"><strong>Severity:</strong> {selectedIncident.severity.toUpperCase()}</Typography>
                  <Typography variant="body2"><strong>Affected Users:</strong> {selectedIncident.affected_users_count || 'Unknown'}</Typography>
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
                color="error"
                startIcon={<SendIcon />}
              >
                Send Breach Notifications
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
