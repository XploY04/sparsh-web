"use client";
import { forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef(
  (
    {
      type = "text",
      label = "",
      error = "",
      helperText = "",
      leftIcon = null,
      rightIcon = null,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputClasses = clsx(
      "input",
      {
        "input-error": error,
        "pl-10": leftIcon,
        "pr-10": rightIcon,
      },
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-neutral-400">{leftIcon}</span>
            </div>
          )}
          <input ref={ref} type={type} className={inputClasses} {...props} />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-neutral-400">{rightIcon}</span>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-danger-600">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
