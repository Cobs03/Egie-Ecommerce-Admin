import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import { PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import DashboardService from "../../../services/DashboardService";

const PaymentStatus = () => {
  const [data, setData] = useState([
    { name: "Paid", value: 0, color: "#63e01d" },
    { name: "Pending", value: 0, color: "#2176ae" },
  ]);
  const [loading, setLoading] = useState(true);
  const [isCardHovered, setIsCardHovered] = useState(false);

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

  // Calculate total and percentage
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const paidPercentage = total > 0 ? ((data[0]?.value || 0) / total * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: isCardHovered ? "0 8px 24px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.07)",
        padding: 2,
        minWidth: 280,
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        margin: 1,
        overflow: "hidden",
        border: isCardHovered ? "1px solid #e0e0e0" : "1px solid transparent",
        transform: isCardHovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Payment Status
        </Typography>

        <Box display="flex" flexDirection="column" alignItems="center">
          {/* Semi-circle gauge */}
          <Box position="relative" display="inline-flex">
            <PieChart width={280} height={150}>
              <Pie
                data={data}
                cx={140}
                cy={130}
                innerRadius={70}
                outerRadius={95}
                startAngle={180}
                endAngle={0}
                paddingAngle={0}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <Box
              sx={{
                position: "absolute",
                top: "70%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700} color="#63e01d">
                {paidPercentage}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                Paid
              </Typography>
            </Box>
          </Box>

          {/* Legend */}
          <Stack spacing={1.5} mt={1} width="100%" px={2}>
            {data.map((entry, index) => (
              <Box key={`legend-${index}`} display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: entry.color,
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  />
                  <Typography fontWeight={600} fontSize={14}>
                    {entry.name}
                  </Typography>
                </Box>
                <Typography fontWeight={700} fontSize={14}>
                  {(entry.value || 0).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default PaymentStatus;
