"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";
import Card from "./Card";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-[400px] flex items-center justify-center p-8">
    <Card className="max-w-md w-full text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-6"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
          <ExclamationTriangleIcon className="h-8 w-8 text-danger-600" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-neutral-600 text-sm mb-4">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          {process.env.NODE_ENV === "development" && error && (
            <details className="text-left">
              <summary className="cursor-pointer text-xs text-neutral-500 mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-danger-600 bg-danger-50 p-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            icon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Refresh Page
          </Button>
          <Button variant="primary" onClick={resetError}>
            Try Again
          </Button>
        </div>
      </motion.div>
    </Card>
  </div>
);

export default ErrorBoundary;
