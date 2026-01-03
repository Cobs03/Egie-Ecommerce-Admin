import React from "react";
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
import { Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

const Dashboard = () => {
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
        <Typography variant="body2" color="text.secondary">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Box>

      <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />

      {/* Key Metrics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            KEY METRICS
          </Typography>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            <TotalSales />
            <TotalOrders />
            <AverageOrderValue />
            <TotalUser />
            <NewUser />
          </div>
        </Box>
      </motion.div>

      <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />

      {/* Shipping Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            SHIPPING OVERVIEW
          </Typography>
          <ShippingChart />
        </Box>
      </motion.div>

      <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            QUICK ACTIONS
          </Typography>
          <QuickActions />
        </Box>
      </motion.div>

      <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />

      {/* Middle Section - Orders & Inventory */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            ORDERS & INVENTORY
          </Typography>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            <ActiveOrders />
            <ActiveDiscounts />
            <CancelledOrders />
            <Inventory />
            <OrdersOverview />
          </div>
        </Box>
      </motion.div>

      <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />

      {/* Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            PRODUCT ANALYTICS
          </Typography>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 14,
            }}
          >
            <MostClicked />
            <TopProduct />
            <PaymentStatus />
            <ConversionRate />
          </div>
        </Box>
      </motion.div>

      <hr style={{ marginBottom: "24px", border: "none", borderTop: "1px solid #e0e0e0" }} />

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            RECENT ORDERS
          </Typography>
          <RecentOrders />
        </Box>
      </motion.div>
    </div>
  );
};

export default Dashboard;
