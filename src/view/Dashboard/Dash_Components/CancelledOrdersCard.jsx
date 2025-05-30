import React from "react";
import BaseCard2 from "./Comp/Card2";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const CancelledOrdersCard = () => {
  return (
    <BaseCard2
      title="Cancelled Orders"
      value="1"
      iconComponent={CancelOutlinedIcon}
    />
  );
};

export default CancelledOrdersCard;
