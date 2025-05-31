import React from "react";
import TotalSales from "./Dash_Components/TotalSales";
import TotalOrders from "./Dash_Components/TotalOrders";
import TotalUser from "./Dash_Components/TotalUser";
import NewUser from "./Dash_Components/NewUser";
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
import { Typography } from "@mui/material";

const Dashboard = () => {
  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
            <Typography variant="h5" fontWeight={700} mb={2}>Dashboard</Typography>
      <hr />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr) 1.2fr",
          gridTemplateRows: "auto auto",
          gap: 4,
        }}
      >
        <div style={{ gridColumn: "1 / 2" }}>
          <TotalSales />
        </div>
        <div style={{ gridColumn: "2 / 3" }}>
          <TotalOrders />
        </div>
        <div style={{ gridColumn: "3 / 4", gridRow: "1 / 3" }}>
          <ShippingChart />
        </div>
        <div style={{ gridColumn: "1 / 2" }}>
          <TotalUser />
        </div>
        <div style={{ gridColumn: "2 / 3" }}>
          <NewUser />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr 1.5fr", // 3 equal columns
          gridTemplateRows: "repeat(6, 0.2fr)", // 3 equal-height rows
          gap: 14,
          marginBottom: 10,
        }}
      >
        {/* Column 1 - 3 stacked rows */}
        <div style={{ gridColumn: "1", gridRow: "1 /span 2" }}>
          <ActiveOrders />
        </div>
        <div style={{ gridColumn: "1", gridRow: "3 /span 2" }}>
          <ActiveDiscounts />
        </div>
        <div style={{ gridColumn: "1", gridRow: "5 /span 2" }}>
          <CancelledOrders />
        </div>

        {/* Column 2 - spans 2 rows */}
        <div style={{ gridColumn: "2", gridRow: "1 / span 3" }}>
          <Inventory />
        </div>
        <div style={{ gridColumn: "2", gridRow: "4 / span 3" }}>
          <OrdersOverview />
        </div>

        {/* Column 3 - spans all 3 rows */}
        <div style={{ gridColumn: "3", gridRow: "1 / span 6" }}>
          <MostClicked />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr 1.5fr", // 3 equal columns
          gridTemplateRows: "repeat(2, 7fr)", // 3 equal-height rows
          gap: 14,
          marginBottom: 110,
        }}
      >
        <div style={{ gridColumn: "1 / span 2", gridRow: "1 / span 2" }}>
          <RecentOrders />
        </div>
        <div style={{ gridColumn: "3", gridRow: "1 " }}>
          <TopProduct />
        </div>
        <div style={{ gridColumn: "3", gridRow: "2 " }}>
          <PaymentStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
