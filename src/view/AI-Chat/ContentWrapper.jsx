import React from "react";

const ContentWrapper = ({
  children,
  className = "",
  maxWidth = "container-responsive",
  style = {},
}) => {
  return (
    <div
      className={`${maxWidth} content-wrapper ${className}`}
      style={{
        position: "relative",
        minHeight: "100vh",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default ContentWrapper;
