import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

/**
 * BrandAnalysisCharts Component
 * Displays brand performance with pie chart, bar chart, and legend cards
 * 
 * @param {Object} props
 * @param {Array} props.data - Brand performance data
 */
const BrandAnalysisCharts = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Brand Performance Analysis
        </Typography>
        <Grid container spacing={3} justifyContent="space-around">
          {/* Pie Chart - Left 50% */}
          <Grid item xs={12} md={6} width={"40%"}>
            <Box sx={{ maxHeight: 600, overflowY: "auto", pr: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                mb={2}
                textAlign="center"
              >
                Sales by Brand Distribution
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={5}
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} units`,
                        props.payload.name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Brand Performance Bar Chart - Right 50% */}
          <Grid item xs={12} md={6} width={"40%"}>
            <Box sx={{ maxHeight: 600, overflowY: "auto", pl: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                mb={2}
                textAlign="center"
              >
                Brand Performance Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    label={{
                      value: "Total Sales",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} units`, "Total Sales"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "10px",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8884d8"
                    name="Total Sales"
                    radius={[8, 8, 0, 0]}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
        {/* Legend Cards below bar chart */}

        <Box sx={{ mt: 3, bgcolor: '#cbcbcb', p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Legend
          </Typography>
          {data.map((entry, index) => {
            const percent = ((entry.value / total) * 100).toFixed(1);
            return (
              <Card
                key={index}
                sx={{
                  mb: 1.5,
                  bgcolor: "#f5f5f5",
                  borderLeft: `6px solid ${COLORS[index % COLORS.length]}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  "&:hover": {
                    bgcolor: "#fafafa",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    transform: "translateX(4px)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {entry.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.value} units sold
                      </Typography>
                    </Box>
                    <Chip
                      label={`${percent}%`}
                      size="small"
                      sx={{
                        backgroundColor: COLORS[index % COLORS.length],
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BrandAnalysisCharts;
