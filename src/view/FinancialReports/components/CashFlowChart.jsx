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
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';

/**
 * CashFlowChart Component
 * Displays cash flow trend over time with inflow, outflow, and net cash flow
 */
const CashFlowChart = ({ data, formatCurrency }) => {
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
              {entry.name}: {formatCurrency(entry.value)}
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
          Cash Flow Trend
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4caf50" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f44336" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="inflow"
              stroke="#4caf50"
              fill="url(#colorInflow)"
              name="Cash Inflow"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="outflow"
              stroke="#f44336"
              fill="url(#colorOutflow)"
              name="Cash Outflow"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="netCashFlow"
              stroke="#1976d2"
              strokeWidth={3}
              name="Net Cash Flow"
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <Box mt={2} display="flex" justifyContent="space-around" flexWrap="wrap" gap={2}>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Total Inflow
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {formatCurrency(data.reduce((sum, d) => sum + d.inflow, 0))}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Total Outflow
            </Typography>
            <Typography variant="h6" fontWeight={700} color="error.main">
              {formatCurrency(data.reduce((sum, d) => sum + d.outflow, 0))}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Net Position
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight={700} 
              color={data.reduce((sum, d) => sum + d.netCashFlow, 0) >= 0 ? "success.main" : "error.main"}
            >
              {formatCurrency(data.reduce((sum, d) => sum + d.netCashFlow, 0))}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CashFlowChart;
