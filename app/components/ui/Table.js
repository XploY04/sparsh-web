"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const Table = ({
  data = [],
  columns = [],
  loading = false,
  sortable = true,
  className = "",
  emptyState = null,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (key) => {
    if (!sortable) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="animate-pulse">
          <div className="table-header">
            <div className="flex space-x-6 p-6">
              {columns.map((_, i) => (
                <div key={i} className="skeleton h-4 w-24" />
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex space-x-6 p-6 border-t border-neutral-200"
            >
              {columns.map((_, j) => (
                <div key={j} className="skeleton h-4 w-24" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <div className={`card ${className}`}>{emptyState}</div>;
  }

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx("table-header-cell", {
                    "cursor-pointer hover:bg-neutral-100 select-none":
                      sortable && column.sortable !== false,
                  })}
                  onClick={() =>
                    column.sortable !== false && handleSort(column.key)
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortable && column.sortable !== false && (
                      <div className="flex flex-col">
                        <ChevronUpIcon
                          className={clsx("h-3 w-3", {
                            "text-primary-600":
                              sortConfig.key === column.key &&
                              sortConfig.direction === "asc",
                            "text-neutral-400": !(
                              sortConfig.key === column.key &&
                              sortConfig.direction === "asc"
                            ),
                          })}
                        />
                        <ChevronDownIcon
                          className={clsx("h-3 w-3 -mt-1", {
                            "text-primary-600":
                              sortConfig.key === column.key &&
                              sortConfig.direction === "desc",
                            "text-neutral-400": !(
                              sortConfig.key === column.key &&
                              sortConfig.direction === "desc"
                            ),
                          })}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {sortedData.map((row, index) => (
              <motion.tr
                key={row.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="table-row"
              >
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
