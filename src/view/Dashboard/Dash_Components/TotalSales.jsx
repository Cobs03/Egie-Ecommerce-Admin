import React, { useState, useEffect } from "react";
import Card from "./Comp/Card";
import { MdOutlineEventNote } from "react-icons/md";
import { DashboardService } from "../../../services/DashboardService";

const TotalSales = () => {
  const [data, setData] = useState({ total: 0, percentage: 0, isIncrease: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await DashboardService.getTotalSales('week');
    if (result.success) {
      setData({
        total: result.total,
        percentage: Math.abs(result.percentage).toFixed(1),
        isIncrease: result.isIncrease
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card
        title="Total Sales"
        value="Loading..."
        percentage="0%"
        period="In the Last Week"
        icon={<MdOutlineEventNote size={28} color="#888" />}
        percentageColor="#22c55e"
        percentageBg="#dcfce7"
        iconBg="#f3f4f6"
      />
    );
  }

  return (
    <Card
      title="Total Sales"
      value={`₱ ${data.total.toLocaleString()}`}
      percentage={`${data.percentage}%`}
      period="In the Last Week"
      icon={<MdOutlineEventNote size={28} color="#888" />}
      percentageColor={data.isIncrease ? "#22c55e" : "#ef4444"}
      percentageBg={data.isIncrease ? "#dcfce7" : "#fee2e2"}
      iconBg="#f3f4f6"
    />
  );
};

export default TotalSales;
