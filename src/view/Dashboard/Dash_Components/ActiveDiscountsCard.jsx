import React, { useState, useEffect } from "react";
import BaseCard2 from "./Comp/Card2";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { DashboardService } from "../../../services/DashboardService";

const ActiveDiscountsCard = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await DashboardService.getActiveDiscounts();
    if (result.success) {
      setCount(result.total);
    }
    setLoading(false);
  };

  return (
    <BaseCard2
      title="Active Discounts"
      value={loading ? "..." : count.toString()}
      iconComponent={LocalOfferOutlinedIcon}
    />
  );
};

export default ActiveDiscountsCard;
