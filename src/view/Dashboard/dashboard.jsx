import React from "react";
import TotalSales from "./Dash_Components/TotalSales";
import TotalOrders from "./Dash_Components/TotalOrders";
import TotalUser from "./Dash_Components/TotalUser";
import NewUser from "./Dash_Components/NewUser";
import ShippingChart from "./Dash_Components/ShippingChart";

const Dashboard = () => {
  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr) 1.2fr",
          gridTemplateRows: "repeat(2, auto)",
          gap: 24,
          maxWidth: 1100,
          margin: "0 auto",
          alignItems: "start",
        }}
      >
        <div style={{ gridColumn: "1 / 2", gridRow: "1 / 2" }}>
          <TotalSales />
        </div>
        <div style={{ gridColumn: "2 / 3", gridRow: "1 / 2" }}>
          <TotalOrders />
        </div>
        <div style={{ gridColumn: "1 / 2", gridRow: "2 / 3" }}>
          <TotalUser />
        </div>
        <div style={{ gridColumn: "2 / 3", gridRow: "2 / 3" }}>
          <NewUser />
        </div>
        <div style={{ gridColumn: "3 / 4", gridRow: "1 / 3" }}>
          <ShippingChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
