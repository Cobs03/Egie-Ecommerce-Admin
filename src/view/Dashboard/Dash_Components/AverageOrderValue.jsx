import React, { useState, useEffect } from "react";
import Card from "./Comp/Card";
import { MdAttachMoney } from "react-icons/md";
import { DashboardService } from "../../../services/DashboardService";

const AverageOrderValue = () => {
  const [data, setData] = useState({ total: 0, percentage: 0, isIncrease: true });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

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
    const result = await DashboardService.getAverageOrderValue(periodMap[selectedPeriod] || selectedPeriod);
    if (result.success) {
      setData({
        total: result.average || 0,
        percentage: (result.percentage || 0).toFixed(1),
        isIncrease: result.isIncrease !== false
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
    setPeriod(periodMap[newPeriod] || 'month');
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
      value={`₱ ${data.total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      percentage={`${data.isIncrease ? '↑' : '↓'} ${data.percentage}%`}
      period={period === 'day' ? 'Today' : period === 'week' ? 'In the Last Week' : 'In the Last Month'}
      icon={<MdAttachMoney size={28} color="#888" />}
      percentageColor={data.isIncrease ? "#22c55e" : "#ef4444"}
      percentageBg={data.isIncrease ? "#dcfce7" : "#fee2e2"}
      iconBg="#f3f4f6"
      onPeriodChange={handlePeriodChange}
    />
  );
};

export default AverageOrderValue;
