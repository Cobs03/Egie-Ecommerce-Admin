import * as React from "react";
import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

const data = [
  { id: 0, value: 215, label: "Delivered", color: "#63e01d" },
  { id: 1, value: 235, label: "Dispatched", color: "#2176ae" },
  { id: 2, value: 235, label: "Ongoing", color: "#ffe14d" },
];

export default function ShippingChart() {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        minWidth: 300,
        minHeight: 320,
        p: 2,
        m: 1,
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Shipping
        </Typography>
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
            {data.map((item) => (
              <Box key={item.id} display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    mr: 1.5,
                  }}
                />
                <Typography fontWeight={600} fontSize={15} flex={1}>
                  {item.label}
                </Typography>
                <Typography fontWeight={500} fontSize={15}>
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
