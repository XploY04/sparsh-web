"use client";
import toast, { Toaster } from "react-hot-toast";

// Toast utility functions
export const showToast = {
  success: (message) =>
    toast.success(message, {
      duration: 4000,
      style: {
        background: "#ffffff",
        color: "#166534",
        border: "1px solid #bbf7d0",
        borderLeft: "4px solid #22c55e",
      },
      iconTheme: {
        primary: "#22c55e",
        secondary: "#ffffff",
      },
    }),

  error: (message) =>
    toast.error(message, {
      duration: 5000,
      style: {
        background: "#ffffff",
        color: "#991b1b",
        border: "1px solid #fecaca",
        borderLeft: "4px solid #ef4444",
      },
      iconTheme: {
        primary: "#ef4444",
        secondary: "#ffffff",
      },
    }),

  warning: (message) =>
    toast(message, {
      duration: 4000,
      icon: "⚠️",
      style: {
        background: "#ffffff",
        color: "#92400e",
        border: "1px solid #fde68a",
        borderLeft: "4px solid #f59e0b",
      },
    }),

  info: (message) =>
    toast(message, {
      duration: 4000,
      icon: "ℹ️",
      style: {
        background: "#ffffff",
        color: "#1e40af",
        border: "1px solid #bfdbfe",
        borderLeft: "4px solid #3b82f6",
      },
    }),

  loading: (message) =>
    toast.loading(message, {
      style: {
        background: "#ffffff",
        color: "#374151",
        border: "1px solid #d1d5db",
      },
    }),

  dismiss: (toastId) => toast.dismiss(toastId),
};

// Toast provider component
const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        className: "",
        style: {
          background: "#ffffff",
          color: "#374151",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          borderRadius: "0.75rem",
          padding: "16px",
          fontSize: "14px",
          maxWidth: "400px",
        },
      }}
    />
  );
};

export default ToastProvider;
