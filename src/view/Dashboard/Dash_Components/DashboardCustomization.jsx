import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
  Stack,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

const DashboardCustomization = ({ open, onClose, onSave }) => {
  const [visibleSections, setVisibleSections] = useState({
    keyMetrics: true,
    shipping: true,
    quickActions: true,
    ordersInventory: true,
    analytics: true,
    recentOrders: true,
  });

  useEffect(() => {
    // Load saved preferences from localStorage
    const saved = localStorage.getItem("dashboardPreferences");
    if (saved) {
      setVisibleSections(JSON.parse(saved));
    }
  }, [open]);

  const handleToggle = (section) => {
    setVisibleSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = () => {
    localStorage.setItem("dashboardPreferences", JSON.stringify(visibleSections));
    onSave(visibleSections);
    onClose();
  };

  const handleReset = () => {
    const defaultPreferences = {
      keyMetrics: true,
      shipping: true,
      quickActions: true,
      ordersInventory: true,
      analytics: true,
      recentOrders: true,
    };
    setVisibleSections(defaultPreferences);
    localStorage.setItem("dashboardPreferences", JSON.stringify(defaultPreferences));
  };

  const sections = [
    { key: "keyMetrics", label: "Key Metrics", description: "Sales, orders, and user statistics" },
    { key: "shipping", label: "Shipping Overview", description: "Shipping status and charts" },
    { key: "quickActions", label: "Quick Actions", description: "Common dashboard actions" },
    { key: "ordersInventory", label: "Orders & Inventory", description: "Active orders and stock levels" },
    { key: "analytics", label: "Product Analytics", description: "Top products and conversion rates" },
    { key: "recentOrders", label: "Recent Orders", description: "Latest order activity" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DragIndicatorIcon />
          <Typography variant="h6" fontWeight={600}>
            Customize Dashboard
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Show or hide dashboard sections to personalize your view. Your preferences will be saved automatically.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormGroup>
          <Stack spacing={2}>
            {sections.map((section) => (
              <Box
                key={section.key}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: visibleSections[section.key] ? "#f0f9ff" : "#f9f9f9",
                  border: visibleSections[section.key] ? "2px solid #3b82f6" : "1px solid #e0e0e0",
                  transition: "all 0.2s ease",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={visibleSections[section.key]}
                      onChange={() => handleToggle(section.key)}
                      sx={{
                        color: "#3b82f6",
                        "&.Mui-checked": {
                          color: "#3b82f6",
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {section.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {section.description}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            ))}
          </Stack>
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleReset} variant="outlined" color="secondary">
          Reset to Default
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Preferences
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardCustomization;
