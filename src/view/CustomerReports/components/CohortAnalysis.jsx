import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * CohortAnalysis Component
 * Analyzes customer retention and behavior by acquisition cohort
 */
const CohortAnalysis = ({ cohortData, formatCurrency }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'white',
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const getRetentionColor = (value) => {
    if (value >= 70) return '#4caf50';
    if (value >= 40) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box>
      {/* Cohort Retention Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Cohort Retention Over Time
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Percentage of customers from each acquisition month who made repeat purchases
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={cohortData.retentionTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {cohortData.cohorts?.map((cohort, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={cohort.name}
                  stroke={cohort.color}
                  strokeWidth={2}
                  name={cohort.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cohort Analysis Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Monthly Cohort Performance
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Cohort</strong></TableCell>
                  <TableCell align="center"><strong>Customers</strong></TableCell>
                  <TableCell align="right"><strong>Total Revenue</strong></TableCell>
                  <TableCell align="center"><strong>Month 1</strong></TableCell>
                  <TableCell align="center"><strong>Month 2</strong></TableCell>
                  <TableCell align="center"><strong>Month 3</strong></TableCell>
                  <TableCell align="center"><strong>Month 6</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cohortData.cohortTable?.map((cohort, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {cohort.month}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{cohort.customers}</TableCell>
                    <TableCell align="right">{formatCurrency(cohort.revenue)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${cohort.retention1}%`}
                        size="small"
                        sx={{ 
                          bgcolor: getRetentionColor(cohort.retention1),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${cohort.retention2}%`}
                        size="small"
                        sx={{ 
                          bgcolor: getRetentionColor(cohort.retention2),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${cohort.retention3}%`}
                        size="small"
                        sx={{ 
                          bgcolor: getRetentionColor(cohort.retention3),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${cohort.retention6}%`}
                        size="small"
                        sx={{ 
                          bgcolor: getRetentionColor(cohort.retention6),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {(!cohortData.cohortTable || cohortData.cohortTable.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No cohort data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Cohort Insights */}
      <Grid container spacing={3} justifyContent={'space-around'}>
        <Grid item xs={12} md={4} width="30%">
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Best Performing Cohort
              </Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">
                {cohortData.bestCohort?.month || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {cohortData.bestCohort?.retention}% retention after 3 months
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} width="30%">
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Cohort Size
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {cohortData.avgCohortSize || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                customers per month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} width="30%">
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average 3-Month Retention
              </Typography>
              <Typography variant="h6" fontWeight={700} color="warning.main">
                {cohortData.avgRetention3Month}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                across all cohorts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Card sx={{ bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Typography variant="body2" fontWeight={600} color="primary" gutterBottom>
              📊 How to Read This Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Each row represents a group of customers acquired in the same month
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Retention % shows how many customers from that cohort came back to buy again
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Green (70%+) = Excellent, Orange (40-70%) = Good, Red (&lt;40%) = Needs Improvement
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default CohortAnalysis;
