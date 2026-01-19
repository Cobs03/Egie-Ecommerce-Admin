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
  Chip,
  Paper
} from '@mui/material';

/**
 * RFMAnalysis Component
 * Recency, Frequency, Monetary analysis for customer segmentation
 */
const RFMAnalysis = ({ rfmData, formatCurrency }) => {
  const getSegmentColor = (segment) => {
    const colors = {
      'Champions': 'error',
      'Loyal': 'success',
      'Potential Loyalist': 'primary',
      'New Customers': 'info',
      'Promising': 'warning',
      'Need Attention': 'warning',
      'About to Sleep': 'default',
      'At Risk': 'error',
      'Cannot Lose': 'error',
      'Hibernating': 'default',
      'Lost': 'default'
    };
    return colors[segment] || 'default';
  };

  return (
    <Box>
      <Grid container spacing={3} mb={3} justifyContent={'space-around'}>
        {/* RFM Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Recency
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {rfmData.avgRecency} days
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Average days since last purchase
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Frequency
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary">
                {rfmData.avgFrequency} orders
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Average number of orders per customer
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average Monetary Value
              </Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {formatCurrency(rfmData.avgMonetary)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Average total spent per customer
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* RFM Segmentation Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Customer Segmentation (RFM Analysis)
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Segment</strong></TableCell>
                  <TableCell align="center"><strong>Customers</strong></TableCell>
                  <TableCell align="right"><strong>Total Revenue</strong></TableCell>
                  <TableCell align="right"><strong>Avg Spend</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rfmData.segments?.map((segment, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip
                        label={segment.name}
                        color={getSegmentColor(segment.name)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">{segment.count}</TableCell>
                    <TableCell align="right">{formatCurrency(segment.revenue)}</TableCell>
                    <TableCell align="right">{formatCurrency(segment.avgSpend)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {segment.description}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {(!rfmData.segments || rfmData.segments.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No segmentation data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              📊 RFM Segmentation Methodology:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Recency:</strong> How recently did the customer purchase? (1-5 score)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Frequency:</strong> How often do they purchase? (1-5 score)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Monetary:</strong> How much do they spend? (1-5 score)
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RFMAnalysis;
