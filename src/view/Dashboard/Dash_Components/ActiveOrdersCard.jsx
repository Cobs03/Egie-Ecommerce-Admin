import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard2 from "./Comp/Card2";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { DashboardService } from "../../../services/DashboardService";

const ActiveOrdersCard = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await DashboardService.getActiveOrders();
    if (result.success) {
      setCount(result.total);
    }
    setLoading(false);
  };

  const handleClick = () => {
    // Navigate to orders page with active filter
    navigate("/orders", { state: { filterStatus: "active" } });
  };

  return (
    <BaseCard2
      title="Active Orders"
      value={loading ? "..." : count.toString()}
      iconComponent={DescriptionOutlinedIcon}
      onClick={handleClick}
      tooltipText="Includes: Pending, Confirmed, Processing, and Shipped orders. Click to view all active orders."
    />
  );
};

export default ActiveOrdersCard;
