"use client";
import { motion } from "framer-motion";
import {
  BeakerIcon,
  PlayIcon,
  CheckCircleIcon,
  DocumentIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import Card from "./ui/Card";

const MetricCard = ({
  title,
  value,
  subtitle = "",
  trend = null,
  icon = null,
  variant = "default",
  loading = false,
  onClick = null,
  className = "",
}) => {
  const icons = {
    total: BeakerIcon,
    active: PlayIcon,
    completed: CheckCircleIcon,
    draft: DocumentIcon,
    unblinded: EyeSlashIcon,
  };

  const variants = {
    default: "border-neutral-200",
    primary: "border-primary-200 bg-primary-50",
    success: "border-success-200 bg-success-50",
    warning: "border-warning-200 bg-warning-50",
    danger: "border-danger-200 bg-danger-50",
  };

  const IconComponent = icon || icons[variant] || BeakerIcon;

  if (loading) {
    return (
      <Card className={`${className} ${variants[variant]}`} padding="default">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton h-4 w-20"></div>
            <div className="skeleton h-8 w-8 rounded-lg"></div>
          </div>
          <div className="skeleton h-8 w-16 mb-2"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card
        className={`${className} ${variants[variant]} cursor-pointer`}
        padding="default"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
          <div
            className={`p-2 rounded-lg ${
              {
                default: "bg-neutral-100",
                primary: "bg-primary-100",
                success: "bg-success-100",
                warning: "bg-warning-100",
                danger: "bg-danger-100",
              }[variant]
            }`}
          >
            <IconComponent
              className={`w-5 h-5 ${
                {
                  default: "text-neutral-600",
                  primary: "text-primary-600",
                  success: "text-success-600",
                  warning: "text-warning-600",
                  danger: "text-danger-600",
                }[variant]
              }`}
            />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span
            className={`text-3xl font-bold ${
              {
                default: "text-neutral-900",
                primary: "text-primary-900",
                success: "text-success-900",
                warning: "text-warning-900",
                danger: "text-danger-900",
              }[variant]
            }`}
          >
            {value}
          </span>
          {trend && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                trend.direction === "up"
                  ? "text-success-600"
                  : "text-danger-600"
              }`}
            >
              {trend.direction === "up" ? (
                <ArrowTrendingUpIcon className="w-3 h-3" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>

        {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      </Card>
    </motion.div>
  );
};

const MetricsGrid = ({ metrics = [], loading = false, className = "" }) => {
  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 ${className}`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <MetricCard key={i} loading={true} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 ${className}`}
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.key || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <MetricCard {...metric} />
        </motion.div>
      ))}
    </div>
  );
};

export default MetricCard;
export { MetricCard, MetricsGrid };
