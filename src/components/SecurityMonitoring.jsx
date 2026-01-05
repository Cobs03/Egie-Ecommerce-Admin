import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Security,
  Block,
  CheckCircle,
  Warning,
  Delete,
  Refresh,
  Info,
  Download,
  Shield
} from '@mui/icons-material';
import { supabase } from '../../../config/supabaseClient';

export default function SecurityMonitoring() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Failed logins state
  const [failedLogins, setFailedLogins] = useState([]);
  const [failedLoginStats, setFailedLoginStats] = useState(null);
  
  // Brute force state
  const [bruteForceAttempts, setBruteForceAttempts] = useState([]);
  
  // IP blacklist state
  const [ipBlacklist, setIpBlacklist] = useState([]);
  const [addIpDialog, setAddIpDialog] = useState(false);
  const [newIpData, setNewIpData] = useState({ ip: '', reason: '', hours: 1 });
  
  // Suspicious activities state
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  
  // Login history state
  const [loginHistory, setLoginHistory] = useState([]);
  
  useEffect(() => {
    loadData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 0:
          await loadFailedLogins();
          break;
        case 1:
          await loadBruteForceAttempts();
          break;
        case 2:
          await loadIpBlacklist();
          break;
        case 3:
          await loadSuspiciousActivities();
          break;
        case 4:
          await loadLoginHistory();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load failed login attempts
  const loadFailedLogins = async () => {
    const { data, error } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .order('attempt_time', { ascending: false })
      .limit(100);
    
    if (!error) setFailedLogins(data || []);
    
    // Get statistics
    const { data: stats } = await supabase
      .from('failed_login_summary')
      .select('*')
      .order('date', { ascending: false })
      .limit(7);
    
    if (stats && stats.length > 0) {
      const totals = stats.reduce((acc, day) => ({
        total_attempts: acc.total_attempts + day.total_attempts,
        unique_ips: acc.unique_ips + day.unique_ips,
        unique_emails: acc.unique_emails + day.unique_emails
      }), { total_attempts: 0, unique_ips: 0, unique_emails: 0 });
      
      setFailedLoginStats(totals);
    }
  };
  
  // Load brute force attack candidates
  const loadBruteForceAttempts = async () => {
    const { data, error } = await supabase
      .from('brute_force_candidates')
      .select('*')
      .order('attempt_count', { ascending: false });
    
    if (!error) setBruteForceAttempts(data || []);
  };
  
  // Load IP blacklist
  const loadIpBlacklist = async () => {
    const { data, error } = await supabase
      .from('ip_blacklist')
      .select('*')
      .order('blocked_at', { ascending: false });
    
    if (!error) setIpBlacklist(data || []);
  };
  
  // Load suspicious activities
  const loadSuspiciousActivities = async () => {
    const { data, error } = await supabase
      .from('suspicious_activities')
      .select('*, profiles(email)')
      .order('detected_at', { ascending: false })
      .limit(100);
    
    if (!error) setSuspiciousActivities(data || []);
  };
  
  // Load login history
  const loadLoginHistory = async () => {
    const { data, error } = await supabase
      .from('login_history')
      .select('*')
      .order('login_time', { ascending: false })
      .limit(100);
    
    if (!error) setLoginHistory(data || []);
  };
  
  // Block IP address
  const blockIpAddress = async () => {
    const blockedUntil = new Date();
    blockedUntil.setHours(blockedUntil.getHours() + parseInt(newIpData.hours));
    
    const { error } = await supabase
      .from('ip_blacklist')
      .insert({
        ip_address: newIpData.ip,
        reason: newIpData.reason,
        blocked_until: blockedUntil.toISOString()
      });
    
    if (!error) {
      setAddIpDialog(false);
      setNewIpData({ ip: '', reason: '', hours: 1 });
      loadIpBlacklist();
    }
  };
  
  // Unblock IP address
  const unblockIpAddress = async (id) => {
    const { error } = await supabase
      .from('ip_blacklist')
      .delete()
      .eq('id', id);
    
    if (!error) loadIpBlacklist();
  };
  
  // Update suspicious activity status
  const updateActivityStatus = async (id, status) => {
    const { error } = await supabase
      .from('suspicious_activities')
      .update({ 
        status,
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (!error) loadSuspiciousActivities();
  };
  
  // Export data
  const exportData = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };
  
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };
  
  const getSeverityColor = (severity) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[severity] || 'default';
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield /> Security Monitoring
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Statistics Cards */}
      {activeTab === 0 && failedLoginStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Failed Attempts (7 days)
                </Typography>
                <Typography variant="h4">{failedLoginStats.total_attempts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Unique IPs
                </Typography>
                <Typography variant="h4">{failedLoginStats.unique_ips}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Targeted Emails
                </Typography>
                <Typography variant="h4">{failedLoginStats.unique_emails}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Failed Logins" />
          <Tab label="Brute Force Attacks" />
          <Tab label="IP Blacklist" />
          <Tab label="Suspicious Activities" />
          <Tab label="Login History" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tab 0: Failed Logins */}
          {activeTab === 0 && (
            <Paper>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Recent Failed Login Attempts</Typography>
                <Button
                  startIcon={<Download />}
                  onClick={() => exportData(failedLogins, 'failed-logins.csv')}
                >
                  Export
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Failure Reason</TableCell>
                      <TableCell>User Agent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {failedLogins.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell>{new Date(attempt.attempt_time).toLocaleString()}</TableCell>
                        <TableCell>{attempt.email}</TableCell>
                        <TableCell>
                          <Chip label={attempt.ip_address} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={attempt.failure_reason} 
                            size="small" 
                            color="error" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {attempt.user_agent}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
          
          {/* Tab 1: Brute Force Attacks */}
          {activeTab === 1 && (
            <Paper>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">Brute Force Attack Candidates</Typography>
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  IPs with 5+ failed attempts in the last hour are automatically blocked for 1 hour
                </Alert>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Attempts</TableCell>
                      <TableCell>Emails Targeted</TableCell>
                      <TableCell>First Attempt</TableCell>
                      <TableCell>Last Attempt</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bruteForceAttempts.map((attack, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip label={attack.ip_address} color="error" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="h6" color="error">
                            {attack.attempt_count}
                          </Typography>
                        </TableCell>
                        <TableCell>{attack.unique_emails_targeted}</TableCell>
                        <TableCell>{new Date(attack.first_attempt).toLocaleTimeString()}</TableCell>
                        <TableCell>{new Date(attack.last_attempt).toLocaleTimeString()}</TableCell>
                        <TableCell>{attack.attack_duration}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Block />}
                            onClick={() => {
                              setNewIpData({ 
                                ip: attack.ip_address, 
                                reason: `Brute force attack - ${attack.attempt_count} attempts`,
                                hours: 24
                              });
                              setAddIpDialog(true);
                            }}
                          >
                            Block 24h
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
          
          {/* Tab 2: IP Blacklist */}
          {activeTab === 2 && (
            <Paper>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Blocked IP Addresses</Typography>
                <Button
                  variant="contained"
                  startIcon={<Block />}
                  onClick={() => setAddIpDialog(true)}
                >
                  Add IP Block
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Blocked At</TableCell>
                      <TableCell>Blocked Until</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ipBlacklist.map((ip) => {
                      const isExpired = ip.blocked_until && new Date(ip.blocked_until) < new Date();
                      return (
                        <TableRow key={ip.id}>
                          <TableCell>
                            <Chip label={ip.ip_address} color="error" />
                          </TableCell>
                          <TableCell>{ip.reason}</TableCell>
                          <TableCell>{new Date(ip.blocked_at).toLocaleString()}</TableCell>
                          <TableCell>
                            {ip.blocked_until ? new Date(ip.blocked_until).toLocaleString() : 'Permanent'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={isExpired ? 'Expired' : 'Active'} 
                              color={isExpired ? 'default' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => unblockIpAddress(ip.id)}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
          
          {/* Tab 3: Suspicious Activities */}
          {activeTab === 3 && (
            <Paper>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">Suspicious Activities</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Detected</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {suspiciousActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{new Date(activity.detected_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label={activity.activity_type} size="small" />
                        </TableCell>
                        <TableCell>{activity.profiles?.email || 'N/A'}</TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>
                          <Chip 
                            label={activity.severity} 
                            color={getSeverityColor(activity.severity)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={activity.status} size="small" />
                        </TableCell>
                        <TableCell>
                          {activity.status === 'detected' && (
                            <>
                              <Button
                                size="small"
                                onClick={() => updateActivityStatus(activity.id, 'false_positive')}
                              >
                                False Positive
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => updateActivityStatus(activity.id, 'confirmed_threat')}
                              >
                                Confirm Threat
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
          
          {/* Tab 4: Login History */}
          {activeTab === 4 && (
            <Paper>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6">Successful Login History</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Device</TableCell>
                      <TableCell>Alerts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loginHistory.map((login) => (
                      <TableRow key={login.id}>
                        <TableCell>{new Date(login.login_time).toLocaleString()}</TableCell>
                        <TableCell>{login.email}</TableCell>
                        <TableCell>
                          <Chip label={login.ip_address} size="small" />
                        </TableCell>
                        <TableCell>
                          {login.city && login.country_code ? 
                            `${login.city}, ${login.country_code}` : 
                            login.country_code || 'Unknown'
                          }
                        </TableCell>
                        <TableCell>{login.device_type || 'Unknown'}</TableCell>
                        <TableCell>
                          {login.is_new_location && (
                            <Tooltip title="Login from new location">
                              <Chip 
                                label="New Location" 
                                color="warning" 
                                size="small"
                                icon={<Warning />}
                              />
                            </Tooltip>
                          )}
                          {login.is_new_device && (
                            <Tooltip title="Login from new device">
                              <Chip 
                                label="New Device" 
                                color="warning" 
                                size="small"
                                icon={<Warning />}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}
      
      {/* Add IP Block Dialog */}
      <Dialog open={addIpDialog} onClose={() => setAddIpDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Block IP Address</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="IP Address"
            value={newIpData.ip}
            onChange={(e) => setNewIpData({ ...newIpData, ip: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Reason"
            value={newIpData.reason}
            onChange={(e) => setNewIpData({ ...newIpData, reason: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Block Duration (hours, 0 = permanent)"
            type="number"
            value={newIpData.hours}
            onChange={(e) => setNewIpData({ ...newIpData, hours: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddIpDialog(false)}>Cancel</Button>
          <Button onClick={blockIpAddress} variant="contained" color="error">
            Block IP
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
