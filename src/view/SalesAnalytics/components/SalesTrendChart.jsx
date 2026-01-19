import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
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
import ChartTooltip from './ChartTooltip';

/**
 * SalesTrendChart Component
 * Displays sales trend over time with revenue and orders as line charts
 * 
 * @param {Object} props
 * @param {Array} props.data - Sales trend data with date, revenue, and orders
 * @param {Function} props.formatCurrency - Function to format currency values
 */
const SalesTrendChart = ({ data, formatCurrency }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Sales Trend Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              yAxisId="orders"
              orientation="right"
            />
            <Tooltip content={<ChartTooltip formatCurrency={formatCurrency} />} />
            <Legend />
            <Line 
              yAxisId="revenue"
              type="monotone" 
              dataKey="revenue" 
              stroke="#8884d8" 
              name="Revenue (₱)" 
              strokeWidth={2} 
            />
            <Line 
              yAxisId="orders"
              type="monotone" 
              dataKey="orders" 
              stroke="#82ca9d" 
              name="Orders" 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SalesTrendChart;
