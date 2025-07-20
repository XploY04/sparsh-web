"use client";

import { useState } from "react";

export default function ExportButton({
  trialId,
  isBlinded,
  isEnabled = true,
  label,
  className = "",
  disabledMessage = "",
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async (e) => {
    if (!isEnabled) {
      e.preventDefault();
      return;
    }

    setIsDownloading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/trials/${trialId}/export?blinded=${isBlinded}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Export failed");
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `trial_export_${isBlinded ? "blinded" : "unblinded"}_${
        new Date().toISOString().split("T")[0]
      }.csv`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={!isEnabled || isDownloading}
        className={`${className} ${
          !isEnabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : isDownloading
            ? "bg-gray-400 cursor-not-allowed"
            : ""
        } inline-flex items-center transition-colors`}
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Downloading...
          </>
        ) : (
          label
        )}
        {!isEnabled && disabledMessage && (
          <span className="ml-2 text-xs">({disabledMessage})</span>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-sm min-w-max z-10">
          {error}
        </div>
      )}
    </div>
  );
}
