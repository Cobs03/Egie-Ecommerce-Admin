import React from "react";
import Card from "./Comp/Card";
import { IoDocumentTextOutline } from "react-icons/io5";

const TotalOrders = () => (
  <Card
    title="Total Orders"
    value="543"
    percentage="15%"
    period="In the Last Month"
    icon={<IoDocumentTextOutline size={28} color="#888" />}
    percentageColor="#ef4444"
    percentageBg="#fee2e2"
    iconBg="#f3f4f6"
  />
);

export default TotalOrders;

