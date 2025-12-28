import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Box, Stack, LinearProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { motion } from "framer-motion";
import { DashboardService } from "../../../services/DashboardService";

const ConversionRate = () => {
  const [data, setData] = useState({
    conversionRate: 0,
    totalVisits: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await DashboardService.getConversionRate();
    if (result.success) {
      setData({
        conversionRate: result.rate || 0,
        totalVisits: result.visits || 0,
        totalOrders: result.orders || 0,
      });
    }
    setLoading(false);
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 3,
        boxShadow: 3,
        padding: 2,
        minWidth: 280,
        minHeight: 220,
        margin: 1,
        color: "#fff",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700} color="#fff">
            Conversion Rate
          </Typography>
          <TrendingUpIcon sx={{ fontSize: 32, opacity: 0.8 }} />
        </Box>

        <Typography variant="h2" fontWeight={700} mb={1}>
          {data.conversionRate.toFixed(1)}%
        </Typography>

        <LinearProgress
          variant="determinate"
          value={Math.min(data.conversionRate, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.3)",
            mb: 3,
            "& .MuiLinearProgress-bar": {
              bgcolor: "#fff",
              borderRadius: 4,
            },
          }}
        />

        <Stack spacing={1.5}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Total Orders (30d)
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {data.totalVisits.toLocaleString()}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Completed Orders
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {data.totalOrders.toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default ConversionRate;
