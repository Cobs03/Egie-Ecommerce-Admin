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
  Tabs,
  Tab,
  Grid,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

export default function DataProcessingRegistry() {
  const [activities, setActivities] = useState([]);
  const [dataFields, setDataFields] = useState([]);
  const [thirdParties, setThirdParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);

  const [formData, setFormData] = useState({
    activity_name: '',
    description: '',
    department: '',
    processing_purpose: '',
    legal_basis: 'contract',
    legitimate_interest_details: '',
    data_categories: [],
    data_fields: {},
    data_subject_categories: [],
    recipients: [],
    third_party_transfers: false,
    retention_period: '',
    retention_justification: '',
    security_measures: [],
    encryption_used: false,
    pseudonymization_used: false,
    risk_level: 'low',
    dpia_required: false,
    responsible_person: ''
  });

  const legalBasisOptions = [
    { value: 'consent', label: 'Consent', description: 'User has given clear consent' },
    { value: 'contract', label: 'Contract', description: 'Necessary for contract performance' },
    { value: 'legal_obligation', label: 'Legal Obligation', description: 'Required by law' },
    { value: 'vital_interests', label: 'Vital Interests', description: 'Protect vital interests' },
    { value: 'public_task', label: 'Public Task', description: 'Public interest task' },
    { value: 'legitimate_interests', label: 'Legitimate Interests', description: 'Legitimate business interests' }
  ];

  const dataCategoryOptions = [
    'Personal data',
    'Contact information',
    'Financial data',
    'Transaction data',
    'Behavioral data',
    'Usage data',
    'Technical data',
    'Location data',
    'User-generated content',
    'Communication data'
  ];

  const securityMeasureOptions = [
    'Encryption at rest',
    'Encryption in transit',
    'Access controls',
    'Password hashing',
    'Two-factor authentication',
    'Audit logging',
    'Data minimization',
    'Pseudonymization',
    'RLS policies',
    'Regular backups',
    'Incident response plan'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [activitiesRes, fieldsRes, thirdPartiesRes] = await Promise.all([
        supabase.from('data_processing_activities').select('*').order('created_at', { ascending: false }),
        supabase.from('data_fields_catalog').select('*').order('category'),
        supabase.from('third_party_processor_registry').select('*').order('processor_name')
      ]);

      if (activitiesRes.error) throw activitiesRes.error;
      if (fieldsRes.error) throw fieldsRes.error;
      if (thirdPartiesRes.error) throw thirdPartiesRes.error;

      setActivities(activitiesRes.data || []);
      setDataFields(fieldsRes.data || []);
      setThirdParties(thirdPartiesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (activity = null) => {
    if (activity) {
      setFormData({
        activity_name: activity.activity_name,
        description: activity.description,
        department: activity.department || '',
        processing_purpose: activity.processing_purpose,
        legal_basis: activity.legal_basis,
        legitimate_interest_details: activity.legitimate_interest_details || '',
        data_categories: activity.data_categories || [],
        data_fields: activity.data_fields || {},
        data_subject_categories: activity.data_subject_categories || [],
        recipients: activity.recipients || [],
        third_party_transfers: activity.third_party_transfers || false,
        retention_period: activity.retention_period,
        retention_justification: activity.retention_justification,
        security_measures: activity.security_measures || [],
        encryption_used: activity.encryption_used || false,
        pseudonymization_used: activity.pseudonymization_used || false,
        risk_level: activity.risk_level || 'low',
        dpia_required: activity.dpia_required || false,
        responsible_person: activity.responsible_person || ''
      });
      setSelectedActivity(activity);
    } else {
      setFormData({
        activity_name: '',
        description: '',
        department: '',
        processing_purpose: '',
        legal_basis: 'contract',
        legitimate_interest_details: '',
        data_categories: [],
        data_fields: {},
        data_subject_categories: [],
        recipients: [],
        third_party_transfers: false,
        retention_period: '',
        retention_justification: '',
        security_measures: [],
        encryption_used: false,
        pseudonymization_used: false,
        risk_level: 'low',
        dpia_required: false,
        responsible_person: ''
      });
      setSelectedActivity(null);
    }
    setOpenDialog(true);
  };

  const handleSaveActivity = async () => {
    try {
      setLoading(true);

      const dataToSave = {
        ...formData,
        last_reviewed_at: new Date().toISOString(),
        next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      };

      if (selectedActivity) {
        const { error } = await supabase
          .from('data_processing_activities')
          .update(dataToSave)
          .eq('id', selectedActivity.id);

        if (error) throw error;

        // Log audit entry
        await supabase.from('data_processing_audit_log').insert({
          processing_activity_id: selectedActivity.id,
          action: 'updated',
          changed_by: 'Admin', // Replace with actual user
          change_reason: 'Updated via admin interface'
        });
      } else {
        const { error } = await supabase
          .from('data_processing_activities')
          .insert([dataToSave]);

        if (error) throw error;
      }

      await fetchData();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewActivity = (activity) => {
    setSelectedActivity(activity);
    setViewDialog(true);
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[risk] || 'default';
  };

  const getLegalBasisLabel = (basis) => {
    const option = legalBasisOptions.find(opt => opt.value === basis);
    return option ? option.label : basis;
  };

  if (loading && activities.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Data Processing Registry</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Processing Activity
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>GDPR Article 30:</strong> Organizations must maintain records of all processing activities. 
        This registry documents what data you collect, why, and how it's protected.
      </Alert>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Processing Activities (${activities.length})`} />
        <Tab label={`Data Fields (${dataFields.length})`} />
        <Tab label={`Third Parties (${thirdParties.length})`} />
      </Tabs>

      {/* Processing Activities Tab */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Activity Name</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Legal Basis</TableCell>
                <TableCell>Risk Level</TableCell>
                <TableCell>Third-Party</TableCell>
                <TableCell>DPIA</TableCell>
                <TableCell>Last Reviewed</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {activity.activity_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.department}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300 }}>
                      {activity.processing_purpose.substring(0, 100)}
                      {activity.processing_purpose.length > 100 && '...'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getLegalBasisLabel(activity.legal_basis)} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={activity.risk_level.toUpperCase()}
                      size="small"
                      color={getRiskColor(activity.risk_level)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={activity.third_party_transfers ? 'Yes' : 'No'}
                      size="small"
                      color={activity.third_party_transfers ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {activity.dpia_required && (
                      <Chip
                        label={activity.dpia_completed ? 'Completed' : 'Required'}
                        size="small"
                        color={activity.dpia_completed ? 'success' : 'error'}
                        icon={<SecurityIcon />}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {activity.last_reviewed_at 
                        ? new Date(activity.last_reviewed_at).toLocaleDateString()
                        : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewActivity(activity)} title="View Details">
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenDialog(activity)} title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Data Fields Tab */}
      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Field Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Sensitivity</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Legal Basis</TableCell>
                <TableCell>Retention</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataFields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {field.field_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {field.field_type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={field.category} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={field.sensitivity_level} 
                      size="small"
                      color={field.sensitivity_level === 'critical' ? 'error' : 
                             field.sensitivity_level === 'restricted' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2">
                      {field.primary_purpose}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getLegalBasisLabel(field.legal_basis)} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {field.default_retention_period}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Third Parties Tab */}
      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Processor Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>DPA Status</TableCell>
                <TableCell>Certifications</TableCell>
                <TableCell>Risk Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {thirdParties.map((party) => (
                <TableRow key={party.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {party.processor_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{party.processor_type}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{party.country}</Typography>
                    {party.is_eu_based && (
                      <Chip label="EU" size="small" color="success" sx={{ mt: 0.5 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={party.dpa_status}
                      size="small"
                      color={party.dpa_status === 'executed' ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell>
                    {party.certifications && party.certifications.map((cert, idx) => (
                      <Chip key={idx} label={cert} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={party.risk_level}
                      size="small"
                      color={getRiskColor(party.risk_level)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedActivity ? 'Edit Processing Activity' : 'Add Processing Activity'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Activity Name"
              value={formData.activity_name}
              onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              required
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Responsible Person"
                  value={formData.responsible_person}
                  onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Processing Purpose"
              value={formData.processing_purpose}
              onChange={(e) => setFormData({ ...formData, processing_purpose: e.target.value })}
              multiline
              rows={3}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Legal Basis</InputLabel>
              <Select
                value={formData.legal_basis}
                onChange={(e) => setFormData({ ...formData, legal_basis: e.target.value })}
                label="Legal Basis"
              >
                {legalBasisOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box>
                      <Typography variant="body2">{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.legal_basis === 'legitimate_interests' && (
              <TextField
                label="Legitimate Interest Details"
                value={formData.legitimate_interest_details}
                onChange={(e) => setFormData({ ...formData, legitimate_interest_details: e.target.value })}
                multiline
                rows={2}
                fullWidth
                helperText="Explain why this processing is necessary for legitimate interests"
              />
            )}

            <Autocomplete
              multiple
              options={dataCategoryOptions}
              value={formData.data_categories}
              onChange={(e, value) => setFormData({ ...formData, data_categories: value })}
              renderInput={(params) => (
                <TextField {...params} label="Data Categories" placeholder="Select categories" />
              )}
            />

            <Autocomplete
              multiple
              options={securityMeasureOptions}
              value={formData.security_measures}
              onChange={(e, value) => setFormData({ ...formData, security_measures: value })}
              renderInput={(params) => (
                <TextField {...params} label="Security Measures" placeholder="Select measures" />
              )}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Retention Period"
                  value={formData.retention_period}
                  onChange={(e) => setFormData({ ...formData, retention_period: e.target.value })}
                  placeholder="e.g., 7 years, Until account deletion"
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Risk Level</InputLabel>
                  <Select
                    value={formData.risk_level}
                    onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                    label="Risk Level"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              label="Retention Justification"
              value={formData.retention_justification}
              onChange={(e) => setFormData({ ...formData, retention_justification: e.target.value })}
              multiline
              rows={2}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveActivity} variant="contained" disabled={loading}>
            {selectedActivity ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Processing Activity Details</DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box sx={{ py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">{selectedActivity.activity_name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedActivity.description}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Department</Typography>
                  <Typography variant="body2">{selectedActivity.department || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Responsible Person</Typography>
                  <Typography variant="body2">{selectedActivity.responsible_person || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Processing Purpose</Typography>
                  <Typography variant="body2">{selectedActivity.processing_purpose}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Legal Basis</Typography>
                  <Typography variant="body2">
                    <Chip label={getLegalBasisLabel(selectedActivity.legal_basis)} size="small" />
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Risk Level</Typography>
                  <Typography variant="body2">
                    <Chip 
                      label={selectedActivity.risk_level} 
                      size="small" 
                      color={getRiskColor(selectedActivity.risk_level)}
                    />
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Data Categories</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {selectedActivity.data_categories?.map((cat, idx) => (
                      <Chip key={idx} label={cat} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Security Measures</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {selectedActivity.security_measures?.map((measure, idx) => (
                      <Chip key={idx} label={measure} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Retention Period</Typography>
                  <Typography variant="body2">{selectedActivity.retention_period}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Last Reviewed</Typography>
                  <Typography variant="body2">
                    {selectedActivity.last_reviewed_at 
                      ? new Date(selectedActivity.last_reviewed_at).toLocaleDateString()
                      : 'Never'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Retention Justification</Typography>
                  <Typography variant="body2">{selectedActivity.retention_justification}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button 
            onClick={() => {
              setViewDialog(false);
              handleOpenDialog(selectedActivity);
            }}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
