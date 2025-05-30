import React from "react";
import BaseCard2 from "./Comp/Card2";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"; // Example icon

const ActiveOrdersCard = () => {
  return (
    <BaseCard2
      title="Active Orders"
      value="250"
      iconComponent={DescriptionOutlinedIcon}
    />
  );
};

export default ActiveOrdersCard;
