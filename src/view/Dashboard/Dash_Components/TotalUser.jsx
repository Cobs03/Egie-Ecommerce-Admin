import React from "react";
import Card from "./Comp/Card";
import { FaUserGroup } from "react-icons/fa6";

const TotalUser = () => (
  <Card
    title="Total Users"
    value="1,000"
    percentage="15%"
    period="In the Last Week"
    icon={<FaUserGroup size={28} color="#888" />}
    percentageColor="#22c55e"
    percentageBg="#dcfce7"
    iconBg="#f3f4f6"
  />
);

export default TotalUser;

