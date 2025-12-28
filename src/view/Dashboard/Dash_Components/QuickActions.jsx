import React from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import DiscountIcon from "@mui/icons-material/Discount";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Add Product",
      icon: <AddIcon />,
      color: "#2196f3",
      path: "/products/add",
    },
    {
      label: "View Orders",
      icon: <ReceiptIcon />,
      color: "#4caf50",
      path: "/orders",
    },
    {
      label: "Manage Inventory",
      icon: <InventoryIcon />,
      color: "#ff9800",
      path: "/products",
    },
    {
      label: "Create Discount",
      icon: <DiscountIcon />,
      color: "#e91e63",
      path: "/discount",
    },
    {
      label: "View Customers",
      icon: <PeopleIcon />,
      color: "#9c27b0",
      path: "/user",
    },
    {
      label: "Shipping Status",
      icon: <LocalShippingIcon />,
      color: "#00bcd4",
      path: "/orders",
    },
  ];

  return (
    <Card
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        padding: 2,
        margin: 1,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 2,
          }}
        >
          {actions.map((action, index) => (
            <Box key={index}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate(action.path)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  py: 2,
                  borderColor: action.color,
                  color: action.color,
                  "&:hover": {
                    borderColor: action.color,
                    bgcolor: `${action.color}15`,
                  },
                }}
              >
                <Box sx={{ fontSize: 28 }}>{action.icon}</Box>
                <Typography variant="caption" fontWeight={600} textAlign="center">
                  {action.label}
                </Typography>
              </Button>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
