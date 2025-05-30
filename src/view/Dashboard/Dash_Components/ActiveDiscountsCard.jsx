import React from "react";
import BaseCard2 from "./Comp/Card2";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

const ActiveDiscountsCard = () => {
  return (
    <BaseCard2
      title="Active Discounts"
      value="1"
      iconComponent={LocalOfferOutlinedIcon}
    />
  );
};

export default ActiveDiscountsCard;
