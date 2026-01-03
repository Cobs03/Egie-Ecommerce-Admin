import React, { useState, useEffect } from "react";
import BaseCard2 from "./Comp/Card2";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { DashboardService } from "../../../services/DashboardService";

const CancelledOrdersCard = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  return (
    <BaseCard2
      title="Cancelled Orders"
      value={loading ? "..." : count.toString()}
      iconComponent={CancelOutlinedIcon}
    />
  );
};

export default CancelledOrdersCard;
