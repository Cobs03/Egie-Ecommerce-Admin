import React from "react";
import Card from "./Comp/Card";
import { FaUserPlus } from "react-icons/fa6";

const NewUser = () => (
  <Card
    title="New Users"
    value="1,000"
    percentage="15%"
    period="In the Last Week"
    icon={<FaUserPlus size={28} color="#888" />}
    percentageColor="#22c55e"
    percentageBg="#dcfce7"
    iconBg="#f3f4f6"
  />
);

export default NewUser;
