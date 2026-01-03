import * as React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import DashboardService from "../../../services/DashboardService";

export default function ShippingChart() {
  const [data, setData] = React.useState([
    { id: 0, value: 0, label: "Delivered", color: "#63e01d" },
    { id: 1, value: 0, label: "Shipped", color: "#2176ae" },
    { id: 2, value: 0, label: "Processing", color: "#ffe14d" },
    { id: 3, value: 0, label: "Pending", color: "#ff9800" },
  ]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    const fetchShippingData = async () => {
      try {
        const stats = await DashboardService.getShippingStats();
        const chartData = [
          { id: 0, value: stats.delivered || 0, label: "Delivered", color: "#63e01d" },
          { id: 1, value: stats.shipped || 0, label: "Shipped", color: "#2176ae" },
          { id: 2, value: stats.processing || 0, label: "Processing", color: "#ffe14d" },
          { id: 3, value: stats.pending || 0, label: "Pending", color: "#ff9800" },
        ];
        setData(chartData);
        const totalOrders = (stats.delivered || 0) + (stats.shipped || 0) + (stats.processing || 0) + (stats.pending || 0);
        setTotal(totalOrders);
      } catch (error) {
        console.error("Error fetching shipping data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShippingData();
  }, []);

  if (loading) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          minWidth: 300,
          minHeight: 300,
          p: 2,
          m: 1,
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
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        minWidth: 300,
        minHeight: 350,
        p: 2,
        m: 1,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Shipping Status
          </Typography>
          <Box
            sx={{
              bgcolor: "#f5f5f5",
              px: 2,
              py: 0.5,
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              Total: {total}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          {/* Pie Chart - Larger and Centered */}
          <PieChart
            series={[
              {
                data,
                innerRadius: 70,
                outerRadius: 110,
                paddingAngle: 2,
                cornerRadius: 5,
              },
            ]}
            width={300}
            height={240}
            slotProps={{
              legend: { hidden: true },
            }}
          />
          {/* Legend - Horizontal Layout at Bottom */}
          <Box 
            display="flex" 
            flexWrap="wrap" 
            gap={3} 
            mt={2} 
            justifyContent="center"
            width="100%"
          >
            {data.map((item) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <Box key={item.id} display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: item.color,
                    }}
                  />
                  <Typography fontWeight={600} fontSize={13}>
                    {item.label}
                  </Typography>
                  <Typography fontWeight={500} fontSize={12} color="text.secondary">
                    {percentage}%
                  </Typography>
                  <Typography fontWeight={700} fontSize={13}>
                    {item.value}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
