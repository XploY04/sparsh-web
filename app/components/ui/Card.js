"use client";
import { motion } from "framer-motion";
import clsx from "clsx";

const Card = ({
  children,
  className = "",
  elevated = false,
  hover = false,
  padding = "default",
  ...props
}) => {
  const baseClasses = elevated ? "card-elevated" : "card";

  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  const cardClasses = clsx(baseClasses, paddings[padding], className);

  if (hover) {
    return (
      <motion.div
        whileHover={{
          y: -2,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        transition={{ duration: 0.2 }}
        className={cardClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
