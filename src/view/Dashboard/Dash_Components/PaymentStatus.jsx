import React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import { PieChart, Pie, Cell, Legend } from "recharts"; // Import PieChart and Pie

const data = [
  { name: "Paid", value: 205, color: "#63e01d" }, // Light green
  { name: "Pending", value: 235, color: "#2176ae" }, // Blue
];

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

const PaymentStatus = () => {
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
        <Typography variant="h6" fontWeight={700} >
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
