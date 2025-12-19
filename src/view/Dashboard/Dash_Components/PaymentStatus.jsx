import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import { PieChart, Pie, Cell, Legend } from "recharts"; // Import PieChart and Pie
import DashboardService from "../../../services/DashboardService";

const PaymentStatus = () => {
  const [data, setData] = useState([
    { name: "Paid", value: 0, color: "#63e01d" },
    { name: "Pending", value: 0, color: "#2176ae" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const stats = await DashboardService.getPaymentStats();
        const chartData = [
          { name: "Paid", value: stats.paid, color: "#63e01d" },
          { name: "Pending", value: stats.pending, color: "#2176ae" },
        ];
        setData(chartData);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  if (loading) {
    return (
      <Card
        sx={{
          background: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          padding: 2,
          minWidth: 280,
          minHeight: 220,
          margin: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Loading...</Typography>
      </Card>
    );
  }

  // Calculate total for percentages
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  // Custom Legend rendering function
  const renderLegend = (props) => {
    const { payload } = props;

    return (
      <Stack spacing={1} mt={2} width="100%">
        {payload.map((entry, index) => (
          <Box key={`legend-${index}`} display="flex" alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: entry.color || entry.payload.fill, // Use color from data
                mr: 1.5,
                flexShrink: 0,
              }}
            />
            <Typography fontWeight={600} fontSize={15} flex={1}>
              {entry.value}
            </Typography>
            <Typography fontWeight={500} fontSize={15}>
              {`${((entry.payload.value / total) * 100).toFixed(0)}% (${entry.payload.value})`}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  };

  return (
    <Card
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        padding: 2,
        minWidth: 280,
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        margin: 1,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Payment Status
        </Typography>

        <Box display="flex" flexDirection="column" alignItems="center">
          <PieChart width={280} height={220}>
            <Pie
              data={data}
              cx={140}
              cy={120}
              innerRadius={80}
              outerRadius={100}
              startAngle={180}
              endAngle={0}
              paddingAngle={2}
              cornerRadius={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend content={renderLegend} wrapperStyle={{ paddingLeft: 20 }} />
          </PieChart>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentStatus;
