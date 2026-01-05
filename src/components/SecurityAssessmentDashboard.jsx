import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Security,
  Assessment,
  BugReport,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  PlayArrow,
  Visibility,
  Assignment,
  TrendingUp
} from '@mui/icons-material';
import { supabase } from '../../../config/supabaseClient';
import { Line } from 'react-chartjs-2';

export default function SecurityAssessmentDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Assessments
  const [assessments, setAssessments] = useState([]);
  const [assessmentSummary, setAssessmentSummary] = useState(null);
  
  // Findings
  const [openFindings, setOpenFindings] = useState([]);
  const [vulnerabilityStats, setVulnerabilityStats] = useState([]);
  
  // Automated checks
  const [securityCheckResults, setSecurityCheckResults] = useState([]);
  const [runningChecks, setRunningChecks] = useState(false);
  
  // Dependencies
  const [dependencies, setDependencies] = useState([]);
  const [dependencyVulns, setDependencyVulns] = useState([]);
  
  // Audit trail
  const [auditTrail, setAuditTrail] = useState([]);
  
  // Dialogs
  const [createAssessmentDialog, setCreateAssessmentDialog] = useState(false);
  const [viewFindingDialog, setViewFindingDialog] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  
  // Form state
  const [newAssessment, setNewAssessment] = useState({
    assessment_type: 'vulnerability_scan',
    assessment_name: '',
    description: '',
    scheduled_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 0:
          await loadAssessments();
          break;
        case 1:
          await loadFindings();
          break;
        case 2:
          await loadSecurityChecks();
          break;
        case 3:
          await loadDependencies();
          break;
        case 4:
          await loadAuditTrail();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = async () => {
    const [
      { data: assessments },
      { data: summary }
    ] = await Promise.all([
      supabase
        .from('security_assessments')
        .select('*')
        .order('scheduled_date', { ascending: false }),
      supabase
        .from('security_assessment_summary')
        .select('*')
    ]);

    setAssessments(assessments || []);
    setAssessmentSummary(summary || []);
  };

  const loadFindings = async () => {
    const [
      { data: findings },
      { data: stats }
    ] = await Promise.all([
      supabase
        .from('open_security_findings')
        .select('*')
        .limit(100),
      supabase
        .from('vulnerability_statistics')
        .select('*')
        .order('month', { ascending: false })
        .limit(12)
    ]);

    setOpenFindings(findings || []);
    setVulnerabilityStats(stats || []);
  };

  const loadSecurityChecks = async () => {
    // Run automated security checks
    const { data, error } = await supabase
      .rpc('run_all_security_checks');

    if (!error) {
      setSecurityCheckResults(data || []);
    }
  };

  const loadDependencies = async () => {
    const [
      { data: deps },
      { data: vulns }
    ] = await Promise.all([
      supabase
        .from('system_dependencies')
        .select('*')
        .eq('has_vulnerabilities', true)
        .order('vulnerability_count', { ascending: false }),
      supabase
        .from('dependency_vulnerabilities')
        .select('*, system_dependencies(package_name, package_version)')
        .in('remediation_status', ['open', 'in_progress'])
        .order('severity', { ascending: false })
    ]);

    setDependencies(deps || []);
    setDependencyVulns(vulns || []);
  };

  const loadAuditTrail = async () => {
    const { data } = await supabase
      .from('compliance_audit_trail')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    setAuditTrail(data || []);
  };

  const createAssessment = async () => {
    const { error } = await supabase
      .from('security_assessments')
      .insert(newAssessment);

    if (!error) {
      setCreateAssessmentDialog(false);
      setNewAssessment({
        assessment_type: 'vulnerability_scan',
        assessment_name: '',
        description: '',
        scheduled_date: new Date().toISOString().split('T')[0]
      });
      loadAssessments();
    }
  };

  const runSecurityChecks = async () => {
    setRunningChecks(true);
    await loadSecurityChecks();
    setRunningChecks(false);
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

  const getStatusColor = (status) => {
    const colors = {
      passing: 'success',
      failing: 'error',
      error: 'error',
      completed: 'success',
      in_progress: 'warning',
      scheduled: 'info',
      open: 'error',
      resolved: 'success'
    };
    return colors[status] || 'default';
  };

  // Chart data for vulnerability trends
  const vulnerabilityChartData = {
    labels: vulnerabilityStats.map(stat => 
      new Date(stat.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    ).reverse(),
    datasets: [
      {
        label: 'Critical',
        data: vulnerabilityStats.map(stat => stat.critical).reverse(),
        borderColor: '#d32f2f',
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
      },
      {
        label: 'High',
        data: vulnerabilityStats.map(stat => stat.high).reverse(),
        borderColor: '#f57c00',
        backgroundColor: 'rgba(245, 124, 0, 0.1)',
      },
      {
        label: 'Medium',
        data: vulnerabilityStats.map(stat => stat.medium).reverse(),
        borderColor: '#fbc02d',
        backgroundColor: 'rgba(251, 192, 45, 0.1)',
      }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security /> Security Assessment Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Assessment />}
          onClick={() => setCreateAssessmentDialog(true)}
        >
          Schedule Assessment
        </Button>
      </Box>

      {/* Summary Cards */}
      {assessmentSummary && assessmentSummary.length > 0 && activeTab === 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {assessmentSummary.map((summary) => (
            <Grid item xs={12} md={4} key={summary.assessment_type}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {summary.assessment_type.replace(/_/g, ' ').toUpperCase()}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Completed</Typography>
                      <Typography variant="h4">{summary.completed}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Findings</Typography>
                      <Typography variant="h4" color="error">{summary.critical_findings}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Last: {summary.last_completed ? new Date(summary.last_completed).toLocaleDateString() : 'Never'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab label="Assessments" icon={<Schedule />} iconPosition="start" />
          <Tab label="Findings" icon={<BugReport />} iconPosition="start" />
          <Tab label="Security Checks" icon={<CheckCircle />} iconPosition="start" />
          <Tab label="Dependencies" icon={<Warning />} iconPosition="start" />
          <Tab label="Audit Trail" icon={<Assignment />} iconPosition="start" />
        </Tabs>
      </Paper>

      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {/* Tab 0: Assessments */}
          {activeTab === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assessment Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Scheduled Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Findings</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>{assessment.assessment_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={assessment.assessment_type.replace(/_/g, ' ')} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{new Date(assessment.scheduled_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={assessment.status} 
                          color={getStatusColor(assessment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {assessment.findings_count > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {assessment.critical_findings > 0 && (
                              <Chip label={`C:${assessment.critical_findings}`} color="error" size="small" />
                            )}
                            {assessment.high_findings > 0 && (
                              <Chip label={`H:${assessment.high_findings}`} color="warning" size="small" />
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 1: Findings */}
          {activeTab === 1 && (
            <>
              {vulnerabilityStats.length > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Vulnerability Trends (12 Months)</Typography>
                    <Line data={vulnerabilityChartData} options={{ responsive: true }} />
                  </CardContent>
                </Card>
              )}

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Component</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {openFindings.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell>{finding.title}</TableCell>
                        <TableCell>
                          <Chip 
                            label={finding.severity} 
                            color={getSeverityColor(finding.severity)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{finding.affected_component}</TableCell>
                        <TableCell>
                          <Chip label={finding.remediation_status} size="small" />
                        </TableCell>
                        <TableCell>
                          {finding.remediation_deadline ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {new Date(finding.remediation_deadline).toLocaleDateString()}
                              {finding.is_overdue && <Error color="error" fontSize="small" />}
                            </Box>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedFinding(finding);
                              setViewFindingDialog(true);
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Tab 2: Security Checks */}
          {activeTab === 2 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Alert severity="info">
                  Automated security checks run to validate system security posture
                </Alert>
                <Button
                  variant="contained"
                  startIcon={runningChecks ? <Refresh className="rotating" /> : <PlayArrow />}
                  onClick={runSecurityChecks}
                  disabled={runningChecks}
                >
                  Run Checks
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Check Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Issues Found</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityCheckResults.map((check, index) => (
                      <TableRow key={index}>
                        <TableCell>{check.check_name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={check.status} 
                            color={getStatusColor(check.status)}
                            icon={check.status === 'passing' ? <CheckCircle /> : <Error />}
                          />
                        </TableCell>
                        <TableCell>{check.issues_found}</TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {check.details?.recommendation}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Tab 3: Dependencies */}
          {activeTab === 3 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Package</TableCell>
                    <TableCell>CVE ID</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Affected Version</TableCell>
                    <TableCell>Patched Version</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dependencyVulns.map((vuln) => (
                    <TableRow key={vuln.id}>
                      <TableCell>
                        {vuln.system_dependencies?.package_name}@{vuln.system_dependencies?.package_version}
                      </TableCell>
                      <TableCell>{vuln.cve_id || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={vuln.severity} 
                          color={getSeverityColor(vuln.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{vuln.affected_versions}</TableCell>
                      <TableCell>
                        <Chip label={vuln.patched_version} color="success" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={vuln.remediation_status} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab 4: Audit Trail */}
          {activeTab === 4 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditTrail.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={entry.event_type} size="small" />
                      </TableCell>
                      <TableCell>{entry.user_email}</TableCell>
                      <TableCell>{entry.event_description}</TableCell>
                      <TableCell>{entry.ip_address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Create Assessment Dialog */}
      <Dialog open={createAssessmentDialog} onClose={() => setCreateAssessmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Security Assessment</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Assessment Type"
            value={newAssessment.assessment_type}
            onChange={(e) => setNewAssessment({ ...newAssessment, assessment_type: e.target.value })}
            margin="normal"
          >
            <MenuItem value="vulnerability_scan">Vulnerability Scan</MenuItem>
            <MenuItem value="penetration_test">Penetration Test</MenuItem>
            <MenuItem value="code_review">Code Review</MenuItem>
            <MenuItem value="dependency_audit">Dependency Audit</MenuItem>
            <MenuItem value="access_review">Access Review</MenuItem>
            <MenuItem value="compliance_audit">Compliance Audit</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Assessment Name"
            value={newAssessment.assessment_name}
            onChange={(e) => setNewAssessment({ ...newAssessment, assessment_name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={newAssessment.description}
            onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            type="date"
            label="Scheduled Date"
            value={newAssessment.scheduled_date}
            onChange={(e) => setNewAssessment({ ...newAssessment, scheduled_date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAssessmentDialog(false)}>Cancel</Button>
          <Button onClick={createAssessment} variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>

      {/* View Finding Dialog */}
      <Dialog open={viewFindingDialog} onClose={() => setViewFindingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Security Finding Details</DialogTitle>
        <DialogContent>
          {selectedFinding && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedFinding.title}</Typography>
              <Chip 
                label={selectedFinding.severity} 
                color={getSeverityColor(selectedFinding.severity)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" paragraph>
                <strong>Component:</strong> {selectedFinding.affected_component}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Status:</strong> {selectedFinding.remediation_status}
              </Typography>
              {selectedFinding.remediation_deadline && (
                <Typography variant="body2" paragraph>
                  <strong>Deadline:</strong> {new Date(selectedFinding.remediation_deadline).toLocaleDateString()}
                  {selectedFinding.is_overdue && <Chip label="OVERDUE" color="error" size="small" sx={{ ml: 1 }} />}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewFindingDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
