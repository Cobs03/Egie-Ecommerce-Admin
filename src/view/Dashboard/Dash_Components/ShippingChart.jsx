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
          { id: 0, value: stats.delivered, label: "Delivered", color: "#63e01d" },
          { id: 1, value: stats.shipped, label: "Shipped", color: "#2176ae" },
          { id: 2, value: stats.processing, label: "Processing", color: "#ffe14d" },
          { id: 3, value: stats.pending, label: "Pending", color: "#ff9800" },
        ];
        setData(chartData);
        setTotal(stats.delivered + stats.shipped + stats.processing + stats.pending);
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
        minHeight: 300,
        p: 2,
        m: 1,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
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
          <PieChart
            series={[
              {
                data,
                innerRadius: 60,
                outerRadius: 80,
                paddingAngle: 2,
                cornerRadius: 5,
                cx: 100,
                cy: 90,
              },
            ]}
            width={200}
            height={180}
            slotProps={{
              legend: { hidden: true },
            }}
          />
          <Stack spacing={1} mt={2} width="100%">
            {data.map((item) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" flex={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: item.color,
                        mr: 1.5,
                      }}
                    />
                    <Typography fontWeight={600} fontSize={13}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2} alignItems="center">
                    <Typography fontWeight={500} fontSize={12} color="text.secondary">
                      {percentage}%
                    </Typography>
                    <Typography fontWeight={700} fontSize={13}>
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
