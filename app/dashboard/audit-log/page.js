"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";
import { LoadingSkeletons } from "../../components/ui/LoadingStates";
import { showToast } from "../../components/ui/Toast";

export default function AuditLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    action: "",
    userId: "",
    trialId: "",
    participantId: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 25,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    fetchAuditLogs();
  }, [session, status, router, filters]);

  const fetchAuditLogs = async () => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/audit-log?${queryParams}`);

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setPagination(data.pagination || {});
      } else {
        throw new Error("Failed to fetch audit logs");
      }
    } catch (error) {
      showToast.error("Failed to load audit logs");
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "page" && key !== "limit") {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/audit-log/export?${queryParams}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast.success("Audit log exported successfully");
      } else {
        throw new Error("Failed to export audit logs");
      }
    } catch (error) {
      showToast.error("Failed to export audit logs");
    }
  };

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const resetFilters = () => {
    setFilters({
      action: "",
      userId: "",
      trialId: "",
      participantId: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 25,
    });
  };

  const changePage = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  if (status === "loading") {
    return <LoadingSkeletons.Table />;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const getActionBadgeVariant = (action) => {
    const dangerActions = ["unblind", "delete", "emergency"];
    const warningActions = ["update", "modify", "change"];
    const successActions = ["create", "add", "enroll"];

    if (
      dangerActions.some((keyword) => action.toLowerCase().includes(keyword))
    ) {
      return "danger";
    }
    if (
      warningActions.some((keyword) => action.toLowerCase().includes(keyword))
    ) {
      return "warning";
    }
    if (
      successActions.some((keyword) => action.toLowerCase().includes(keyword))
    ) {
      return "success";
    }
    return "info";
  };

  const auditColumns = [
    {
      key: "timestamp",
      label: "Timestamp",
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-neutral-900">
            {new Date(value).toLocaleDateString()}
          </div>
          <div className="text-neutral-500">
            {new Date(value).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (value) => (
        <Badge variant={getActionBadgeVariant(value)}>{value}</Badge>
      ),
    },
    {
      key: "userId",
      label: "User",
      render: (value, log) => (
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-neutral-400" />
          <span className="text-sm font-medium">{log.userEmail || value}</span>
        </div>
      ),
    },
    {
      key: "resource",
      label: "Resource",
      render: (value) => (
        <span className="text-sm font-mono text-neutral-600">{value}</span>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (value) => (
        <div className="max-w-xs">
          <p className="text-sm text-neutral-600 truncate" title={value}>
            {value}
          </p>
        </div>
      ),
    },
    {
      key: "ipAddress",
      label: "IP Address",
      render: (value) => (
        <span className="text-xs font-mono text-neutral-500">{value}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Audit Trail</h1>
          <p className="text-neutral-600 mt-1">
            Complete log of all system activities and security events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="primary" onClick={exportAuditLogs}>
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Filter Audit Logs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Action"
                value={filters.action}
                onChange={(e) => updateFilters({ action: e.target.value })}
                placeholder="e.g., unblind, create"
              />
              <Input
                label="User ID"
                value={filters.userId}
                onChange={(e) => updateFilters({ userId: e.target.value })}
                placeholder="User identifier"
              />
              <Input
                label="Trial ID"
                value={filters.trialId}
                onChange={(e) => updateFilters({ trialId: e.target.value })}
                placeholder="Trial identifier"
              />
              <Input
                label="Participant ID"
                value={filters.participantId}
                onChange={(e) =>
                  updateFilters({ participantId: e.target.value })
                }
                placeholder="Participant identifier"
              />
              <Input
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
              />
              <Input
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={fetchAuditLogs}>
                Apply Filters
              </Button>
              <Button variant="secondary" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Events
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {pagination.totalItems || 0}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-neutral-400" />
            </div>
          </Card>
          <Card padding="default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Today's Events
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {
                    logs.filter(
                      (log) =>
                        new Date(log.timestamp).toDateString() ===
                        new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-neutral-400" />
            </div>
          </Card>
          <Card padding="default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Critical Actions
                </p>
                <p className="text-2xl font-bold text-danger-600">
                  {
                    logs.filter(
                      (log) =>
                        log.action.toLowerCase().includes("unblind") ||
                        log.action.toLowerCase().includes("emergency")
                    ).length
                  }
                </p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-danger-400" />
            </div>
          </Card>
          <Card padding="default">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Unique Users
                </p>
                <p className="text-2xl font-bold text-neutral-900">
                  {new Set(logs.map((log) => log.userId)).size}
                </p>
              </div>
              <UserIcon className="w-8 h-8 text-neutral-400" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Audit Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              Audit Events
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} -{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems}
              </span>
            </div>
          </div>

          <Table
            data={logs}
            columns={auditColumns}
            loading={loading}
            emptyState={
              <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No Audit Logs
                </h3>
                <p className="text-neutral-500">
                  No audit events match your current filters.
                </p>
              </div>
            }
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => changePage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => changePage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
