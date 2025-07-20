"use client";
import clsx from "clsx";

const Badge = ({
  children,
  variant = "neutral",
  size = "md",
  icon = null,
  className = "",
  ...props
}) => {
  const baseClasses = "badge";

  const variants = {
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    info: "badge-info",
    neutral: "badge-neutral",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={clsx(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
