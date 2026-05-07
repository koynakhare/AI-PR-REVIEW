import React, { memo } from "react";

const Badge = memo(function Badge({ children, tone = "neutral", className = "" }) {
  return <span className={`badge badge-${tone} ${className}`.trim()}>{children}</span>;
});

export default Badge;
