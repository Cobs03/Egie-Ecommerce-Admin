import React from "react";
import Card from "./Comp/Card";
import { MdOutlineEventNote } from "react-icons/md";

const TotalSales = () => (
  <Card
    title="Total Sales"
    value="₱ 1,000"
    percentage="15%"
    period="In the Last Week"
    icon={<MdOutlineEventNote size={28} color="#888" />}
    percentageColor="#22c55e"
    percentageBg="#dcfce7"
    iconBg="#f3f4f6"
  />
);

export default TotalSales;

