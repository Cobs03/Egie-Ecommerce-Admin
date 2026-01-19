import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
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
 * CustomerGrowthChart Component
 * Visualizes customer acquisition and growth over time
 */
const CustomerGrowthChart = ({ data }) => {
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
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Customer Growth Trend
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="newCustomers"
              stroke="#4caf50"
              strokeWidth={3}
              name="New Customers"
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="activeCustomers"
              stroke="#1976d2"
              strokeWidth={2}
              name="Active Customers"
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalCustomers"
              stroke="#ff9800"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Total Customers (Cumulative)"
            />
          </LineChart>
        </ResponsiveContainer>

        <Box mt={2} display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Current Period New
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {data[data.length - 1]?.newCustomers || 0}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Current Period Active
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary">
              {data[data.length - 1]?.activeCustomers || 0}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Total Customers
            </Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main">
              {data[data.length - 1]?.totalCustomers || 0}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CustomerGrowthChart;
