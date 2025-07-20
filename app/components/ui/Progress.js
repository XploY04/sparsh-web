"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

const ProgressBar = ({
  current = 0,
  total = 100,
  label = "",
  showPercentage = true,
  showNumbers = true,
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const variants = {
    primary: "bg-primary-600",
    success: "bg-success-600",
    warning: "bg-warning-600",
    danger: "bg-danger-600",
  };

  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        {label && (
          <span className="text-sm font-medium text-neutral-700">{label}</span>
        )}
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          {showNumbers && (
            <span>
              {current}/{total}
            </span>
          )}
          {showPercentage && <span>({percentage}%)</span>}
        </div>
      </div>
      <div
        className={clsx(
          "w-full bg-neutral-200 rounded-full overflow-hidden",
          sizes[size]
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={clsx(
            "h-full rounded-full transition-colors",
            variants[variant]
          )}
        />
      </div>
    </div>
  );
};

const StepProgress = ({ steps = [], currentStep = 0, className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex items-center">
            <div
              className={clsx(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                {
                  "bg-primary-600 border-primary-600 text-white":
                    index < currentStep,
                  "bg-primary-100 border-primary-600 text-primary-600":
                    index === currentStep,
                  "bg-neutral-100 border-neutral-300 text-neutral-400":
                    index > currentStep,
                }
              )}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <div className="ml-3">
              <p
                className={clsx("text-sm font-medium", {
                  "text-primary-600": index <= currentStep,
                  "text-neutral-400": index > currentStep,
                })}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-neutral-500">{step.description}</p>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={clsx("flex-1 h-0.5 mx-8", {
                "bg-primary-600": index < currentStep,
                "bg-neutral-300": index >= currentStep,
              })}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export { ProgressBar, StepProgress };
