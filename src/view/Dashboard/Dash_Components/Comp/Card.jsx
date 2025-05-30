import React from "react";

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
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
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
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: "#888", fontWeight: 500 }}>
            {title}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            cursor: "pointer",
            color: "#bbb",
          }}
        >
          ⋮
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
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
        <div style={{ color: "#888", fontSize: 14 }}>{period}</div>
      </div>
    </div>
  );
};

export default Card;

