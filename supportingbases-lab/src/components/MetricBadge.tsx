import React from "react";

interface Props {
  label: string;
  value: number;
  className?: string;
}

const MetricBadge: React.FC<Props> = ({ label, value, className }) => {
  let color = "gray";
  if (value < 40) color = "green";
  else if (value <= 70) color = "yellow";
  else color = "red";

  return (
    <span className={`badge ${color} ${className || ""}`.trim()}>
      {label}: {Number.isInteger(value) ? value : value.toFixed(1)}
    </span>
  );
};

export default MetricBadge;
