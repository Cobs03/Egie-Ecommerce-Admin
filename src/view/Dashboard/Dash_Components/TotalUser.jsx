import React, { useState, useEffect } from "react";
import Card from "./Comp/Card";
import { FaUserGroup } from "react-icons/fa6";
import { DashboardService } from "../../../services/DashboardService";

const TotalUser = () => {
  const [data, setData] = useState({ total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await DashboardService.getTotalUsers('week');
    if (result.success) {
      setData({
        total: result.total,
        percentage: result.percentage.toFixed(1)
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card
        title="Total Users"
        value="Loading..."
        percentage="0%"
        period="In the Last Week"
        icon={<FaUserGroup size={28} color="#888" />}
        percentageColor="#22c55e"
        percentageBg="#dcfce7"
        iconBg="#f3f4f6"
      />
    );
  }

  return (
    <Card
      title="Total Users"
      value={data.total.toLocaleString()}
      percentage={`${data.percentage}%`}
      period="In the Last Week"
      icon={<FaUserGroup size={28} color="#888" />}
      percentageColor="#22c55e"
      percentageBg="#dcfce7"
      iconBg="#f3f4f6"
    />
  );
};

export default TotalUser;
