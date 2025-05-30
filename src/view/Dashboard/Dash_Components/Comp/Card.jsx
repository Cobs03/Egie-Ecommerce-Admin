import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const Card = ({
  title,
  value,
  percentage,
  period,
  icon,
  percentageColor = "#22c55e",
  percentageBg = "#dcfce7",
  iconBg = "#f3f4f6",
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    handleClose();
  };

  const options = ["In the Last Week", "In the Last Day", "In the Last Month"];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        padding: 24,
        minWidth: 240,
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        margin: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            background: iconBg,
            borderRadius: 12,
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            position: "absolute",
            zIndex: -1,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: "#888", fontWeight: 500 }}>
            {title}
          </div>
        </div>
        
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          style={{ position: "absolute", top: 8, right: 8, color: "#bbb" }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: 48 * 4.5,
              width: "20ch",
            },
          }}
        >
          {options.map((option) => (
            <MenuItem
              key={option}
              selected={option === selectedPeriod}
              onClick={() => handleMenuItemClick(option)}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </div>
      <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            background: percentageBg,
            color: percentageColor,
            borderRadius: 16,
            padding: "2px 12px",
            fontWeight: 600,
            fontSize: 14,
            marginRight: 8,
          }}
        >
          ↑ {percentage}
        </div>
        <div style={{ color: "#888", fontSize: 14 }}>{selectedPeriod}</div>
      </div>
    </div>
  );
};

export default Card;
