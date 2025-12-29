import React, { useState, useEffect } from "react";
import Card from "./Comp/Card";
import { FaUserPlus } from "react-icons/fa6";
import { DashboardService } from "../../../services/DashboardService";

const NewUser = () => {
  const [data, setData] = useState({ total: 0, percentage: 0, isIncrease: true });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    loadData(period);
  }, [period]);

  const loadData = async (selectedPeriod) => {
    setLoading(true);
    const periodMap = {
      'Today': 'day',
      'In the Last Day': 'day',
      'In the Last Week': 'week',
      'In the Last Month': 'month'
    };
    const result = await DashboardService.getNewUsers(periodMap[selectedPeriod] || selectedPeriod);
    if (result.success) {
      setData({
        total: result.total,
        percentage: Math.abs(result.percentage).toFixed(1),
        isIncrease: result.isIncrease
      });
    }
    setLoading(false);
  };

  const handlePeriodChange = (newPeriod) => {
    const periodMap = {
      'Today': 'day',
      'In the Last Day': 'day',
      'In the Last Week': 'week',
      'In the Last Month': 'month'
    };
    setPeriod(periodMap[newPeriod] || 'week');
  };

  if (loading) {
    return (
      <Card
        title="New Users"
        value="Loading..."
        percentage="0%"
        period="In the Last Week"
        icon={<FaUserPlus size={28} color="#888" />}
        percentageColor="#22c55e"
        percentageBg="#dcfce7"
        iconBg="#f3f4f6"
      />
    );
  }

  return (
    <Card
      title="New Users"
      value={data.total.toString()}
      percentage={`${data.isIncrease ? '↑' : '↓'} ${data.percentage}%`}
      period={period === 'day' ? 'Today' : period === 'week' ? 'In the Last Week' : 'In the Last Month'}
      icon={<FaUserPlus size={28} color="#888" />}
      percentageColor={data.isIncrease ? "#22c55e" : "#ef4444"}
      percentageBg={data.isIncrease ? "#dcfce7" : "#fee2e2"}
      iconBg="#f3f4f6"
      onPeriodChange={handlePeriodChange}
    />
  );
};

export default NewUser;
