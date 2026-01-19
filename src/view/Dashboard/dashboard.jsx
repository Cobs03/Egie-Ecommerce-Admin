import React, { useState, useEffect } from "react";
import TotalSales from "./Dash_Components/TotalSales";
import TotalOrders from "./Dash_Components/TotalOrders";
import TotalUser from "./Dash_Components/TotalUser";
import NewUser from "./Dash_Components/NewUser";
import AverageOrderValue from "./Dash_Components/AverageOrderValue";
import ShippingChart from "./Dash_Components/ShippingChart";
import ActiveOrders from "./Dash_Components/ActiveOrdersCard";
import ActiveDiscounts from "./Dash_Components/ActiveDiscountsCard";
import CancelledOrders from "./Dash_Components/CancelledOrdersCard";
import Inventory from "./Dash_Components/Inventory";
import OrdersOverview from "./Dash_Components/OrdersOverview";
import MostClicked from "./Dash_Components/MostClicked";
import TopProduct from "./Dash_Components/TopProduct";
import PaymentStatus from "./Dash_Components/PaymentStatus";
import RecentOrders from "./Dash_Components/RecentOrders";
import QuickActions from "./Dash_Components/QuickActions";
import ConversionRate from "./Dash_Components/ConversionRate";
import DashboardCustomization from "./Dash_Components/DashboardCustomization";
import {
  Typography,
  Box,
  IconButton,
  Collapse,
  Switch,
  FormControlLabel,
  Tooltip,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [expandedSections, setExpandedSections] = useState({
    keyMetrics: true,
    shipping: true,
    quickActions: true,
    ordersInventory: true,
    analytics: true,
    recentOrders: true,
  });

  const [visibleSections, setVisibleSections] = useState({
    keyMetrics: true,
    shipping: true,
    quickActions: true,
    ordersInventory: true,
    analytics: true,
    recentOrders: true,
  });

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshKey, setRefreshKey] = useState(0);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem("dashboardPreferences");
    if (saved) {
      const preferences = JSON.parse(saved);
      setVisibleSections(preferences);
      setExpandedSections(preferences);
    }
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 60000); // Refresh every 60 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setLastRefresh(new Date());
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSavePreferences = (preferences) => {
    setVisibleSections(preferences);
    setExpandedSections(preferences);
  };

  const SectionHeader = ({ title, section, children }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1,
        p: 1,
        borderRadius: 2,
        bgcolor: "#f9f9f9",
        "&:hover": {
          bgcolor: "#f0f0f0",
        },
        transition: "background-color 0.2s ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 600, cursor: "pointer" }}
          onClick={() => toggleSection(section)}
        >
          {title}
        </Typography>
        <Chip
          label={expandedSections[section] ? "Expanded" : "Collapsed"}
          size="small"
          sx={{ height: 20, fontSize: 10 }}
        />
      </Box>
      <IconButton
        size="small"
        onClick={() => toggleSection(section)}
        sx={{
          transform: expandedSections[section] ? "rotate(0deg)" : "rotate(180deg)",
          transition: "transform 0.3s ease",
        }}
      >
        <ExpandMoreIcon />
      </IconButton>
    </Box>
  );

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ fontFamily: "'Bruno Ace SC', sans-serif" }}
        >
          DASHBOARD
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title={`Last updated: ${lastRefresh.toLocaleTimeString()}`}>
            <Chip
              label={`Updated ${lastRefresh.toLocaleTimeString()}`}
              size="small"
              sx={{ bgcolor: "#e0e0e0" }}
            />
          </Tooltip>
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="caption">
                Auto-refresh (60s)
              </Typography>
            }
          />
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Customize Dashboard">
            <IconButton onClick={() => setCustomizeDialogOpen(true)} size="small">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>
        </Box>
      </Box>

      <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />

      {/* Key Metrics Section */}
      {visibleSections.keyMetrics && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 2 }}>
          <SectionHeader title="KEY METRICS" section="keyMetrics" />
          <Collapse in={expandedSections.keyMetrics} timeout="auto">
            {/* Row 1: Total Sales, Total Orders, Avg Order Value */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <TotalSales key={`sales-${refreshKey}`} />
              <TotalOrders key={`orders-${refreshKey}`} />
              <AverageOrderValue key={`aov-${refreshKey}`} />
            </div>
            {/* Row 2: New Users, Total Users */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              <NewUser key={`newuser-${refreshKey}`} />
              <TotalUser key={`totaluser-${refreshKey}`} />
            </div>
          </Collapse>
        </Box>
      </motion.div>
      )}

      {visibleSections.keyMetrics && <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />}

      {/* Shipping Overview */}
      {visibleSections.shipping && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box sx={{ mb: 2 }}>
          <SectionHeader title="SHIPPING OVERVIEW" section="shipping" />
          <Collapse in={expandedSections.shipping} timeout="auto">
            <ShippingChart key={`shipping-${refreshKey}`} />
          </Collapse>
        </Box>
      </motion.div>
      )}

      {visibleSections.shipping && <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />}

      {/* Quick Actions */}
      {visibleSections.quickActions && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box sx={{ mb: 2 }}>
          <SectionHeader title="QUICK ACTIONS" section="quickActions" />
          <Collapse in={expandedSections.quickActions} timeout="auto">
            <QuickActions />
          </Collapse>
        </Box>
      </motion.div>
      )}

      {visibleSections.quickActions && <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />}

      {/* Middle Section - Orders & Inventory */}
      {visibleSections.ordersInventory && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Box sx={{ mb: 2 }}>
          <SectionHeader title="ORDERS & INVENTORY" section="ordersInventory" />
          <Collapse in={expandedSections.ordersInventory} timeout="auto">
            {/* Row 1: Active Orders, Active Discounts, Cancelled Orders */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <ActiveOrders key={`active-${refreshKey}`} />
              <ActiveDiscounts key={`discounts-${refreshKey}`} />
              <CancelledOrders key={`cancelled-${refreshKey}`} />
            </div>
            {/* Row 2: Inventory, Orders Overview */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              <Inventory key={`inventory-${refreshKey}`} />
              <OrdersOverview key={`overview-${refreshKey}`} />
            </div>
          </Collapse>
        </Box>
      </motion.div>
      )}

      {visibleSections.ordersInventory && <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />}

      {/* Analytics Section */}
      {visibleSections.analytics && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Box sx={{ mb: 2 }}>
          <SectionHeader title="PRODUCT ANALYTICS" section="analytics" />
          <Collapse in={expandedSections.analytics} timeout="auto">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 14,
              }}
            >
              <MostClicked key={`clicked-${refreshKey}`} />
              <TopProduct key={`top-${refreshKey}`} />
              <PaymentStatus key={`payment-${refreshKey}`} />
              <ConversionRate key={`conversion-${refreshKey}`} />
            </div>
          </Collapse>
        </Box>
      </motion.div>
      )}

      {visibleSections.analytics && <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />}

      {/* Recent Activity */}
      {visibleSections.recentOrders && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Box sx={{ mb: 12 }}>
          <SectionHeader title="RECENT ORDERS" section="recentOrders" />
          <Collapse in={expandedSections.recentOrders} timeout="auto">
            <RecentOrders key={`recent-${refreshKey}`} />
          </Collapse>
        </Box>
      </motion.div>
      )}

      <DashboardCustomization
        open={customizeDialogOpen}
        onClose={() => setCustomizeDialogOpen(false)}
        onSave={handleSavePreferences}
      />
    </div>
  );
};

export default Dashboard;
