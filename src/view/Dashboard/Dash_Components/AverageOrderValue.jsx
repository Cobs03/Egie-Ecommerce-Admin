import React, { useState, useEffect } from "react";
import Card from "./Comp/Card";
import { MdAttachMoney } from "react-icons/md";
import { DashboardService } from "../../../services/DashboardService";

const AverageOrderValue = () => {
  const [data, setData] = useState({ total: 0, percentage: 0, isIncrease: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await DashboardService.getAverageOrderValue('month');
    if (result.success) {
      setData({
        total: result.average || 0,
        percentage: Math.abs(result.percentage || 0).toFixed(1),
        isIncrease: result.isIncrease !== false
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card
        title="Avg. Order Value"
        value="Loading..."
        percentage="0%"
        period="In the Last Month"
        icon={<MdAttachMoney size={28} color="#888" />}
        percentageColor="#22c55e"
        percentageBg="#dcfce7"
        iconBg="#f3f4f6"
      />
    );
  }

  return (
    <Card
      title="Avg. Order Value"
      value={`₱ ${data.total.toLocaleString()}`}
      percentage={`${data.percentage}%`}
      period="In the Last Month"
      icon={<MdAttachMoney size={28} color="#888" />}
      percentageColor={data.isIncrease ? "#22c55e" : "#ef4444"}
      percentageBg={data.isIncrease ? "#dcfce7" : "#fee2e2"}
      iconBg="#f3f4f6"
    />
  );
};

export default AverageOrderValue;
