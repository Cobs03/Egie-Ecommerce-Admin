import React, { useState, useEffect } from "react";
import BaseCard2 from "./Comp/Card2";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { DashboardService } from "../../../services/DashboardService";

const ActiveOrdersCard = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  return (
    <BaseCard2
      title="Active Orders"
      value={loading ? "..." : count.toString()}
      iconComponent={DescriptionOutlinedIcon}
    />
  );
};

export default ActiveOrdersCard;
