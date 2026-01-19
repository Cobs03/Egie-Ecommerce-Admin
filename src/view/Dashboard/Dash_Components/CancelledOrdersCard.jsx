import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard2 from "./Comp/Card2";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { DashboardService } from "../../../services/DashboardService";

const CancelledOrdersCard = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await DashboardService.getCancelledOrders();
    if (result.success) {
      setCount(result.total);
    }
    setLoading(false);
  };

  const handleClick = () => {
    // Navigate to orders page with cancelled filter
    navigate("/orders", { state: { filterStatus: "cancelled" } });
  };

  return (
    <BaseCard2
      title="Cancelled Orders"
      value={loading ? "..." : count.toString()}
      iconComponent={CancelOutlinedIcon}
      onClick={handleClick}
      tooltipText="Click to view all cancelled orders"
    />
  );
};

export default CancelledOrdersCard;
