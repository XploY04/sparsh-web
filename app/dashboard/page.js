"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import { MetricsGrid } from "../components/MetricCard";
import { LoadingSkeletons, EmptyStates } from "../components/ui/LoadingStates";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { showToast } from "../components/ui/Toast";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [trials, setTrials] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/trials");

      if (!response.ok) {
        throw new Error("Failed to fetch trials");
      }

      const trialsData = await response.json();
      setTrials(trialsData);

      // Calculate enhanced dashboard stats
      const totalTrials = trialsData.length;
      const activeTrials = trialsData.filter(
        (t) => t.status === "active"
      ).length;
      const completedTrials = trialsData.filter(
        (t) => t.status === "completed"
      ).length;
      const draftTrials = trialsData.filter((t) => t.status === "draft").length;
      const unblindedTrials = trialsData.filter((t) => t.isUnblinded).length;

      // Generate alerts
      const newAlerts = [];

      trialsData.forEach((trial) => {
        if (trial.isUnblinded) {
          newAlerts.push({
            id: `unblind-${trial._id}`,
            type: "warning",
            title: "Trial Unblinded",
            message: `${trial.title} has been unblinded`,
            timestamp: new Date(),
            trialId: trial._id,
          });
        }

        // Check enrollment progress
        const enrollmentProgress =
          trial.currentEnrollment / trial.targetEnrollment;
        if (enrollmentProgress < 0.5 && trial.status === "active") {
          newAlerts.push({
            id: `enrollment-${trial._id}`,
            type: "info",
            title: "Low Enrollment",
            message: `${trial.title} is at ${Math.round(
              enrollmentProgress * 100
            )}% enrollment target`,
            timestamp: new Date(),
            trialId: trial._id,
          });
        }
      });

      setAlerts(newAlerts);
      setStats({
        totalTrials,
        activeTrials,
        completedTrials,
        draftTrials,
        unblindedTrials,
      });
    } catch (error) {
      showToast.error("Failed to load dashboard data");
      console.error("Dashboard data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-8">
        <LoadingSkeletons.Card />
        <MetricsGrid loading={true} />
        <LoadingSkeletons.Table />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const metrics = [
    {
      key: "total",
      title: "Total Trials",
      value: stats.totalTrials || 0,
      subtitle: "All clinical trials",
      variant: "default",
    },
    {
      key: "active",
      title: "Active Trials",
      value: stats.activeTrials || 0,
      subtitle: "Currently running",
      variant: "success",
    },
    {
      key: "completed",
      title: "Completed",
      value: stats.completedTrials || 0,
      subtitle: "Successfully finished",
      variant: "primary",
    },
    {
      key: "draft",
      title: "In Draft",
      value: stats.draftTrials || 0,
      subtitle: "Being prepared",
      variant: "warning",
    },
    {
      key: "unblinded",
      title: "Unblinded",
      value: stats.unblindedTrials || 0,
      subtitle: "Emergency unblinded",
      variant: "danger",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Clinical Trials Dashboard
          </h1>
          <p className="text-neutral-600 mt-1">
            Welcome back! Here's what's happening with your trials today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard/audit-log")}
          >
            <ClockIcon className="w-4 h-4" />
            Audit Trail
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push("/dashboard/trials/new")}
          >
            <PlusIcon className="w-4 h-4" />
            New Trial
          </Button>
        </div>
      </motion.div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-warning-500 bg-warning-50">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-warning-900 mb-2">
                  System Alerts ({alerts.length})
                </h3>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-warning-800">
                          {alert.title}
                        </p>
                        <p className="text-xs text-warning-700">
                          {alert.message}
                        </p>
                      </div>
                      <Badge variant={alert.type} size="sm">
                        {alert.type}
                      </Badge>
                    </div>
                  ))}
                </div>
                {alerts.length > 3 && (
                  <Button variant="ghost" size="sm" className="mt-3">
                    View all {alerts.length} alerts
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MetricsGrid metrics={metrics} loading={loading} />
      </motion.div>

      {/* Recent Trials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">
            Recent Trials
          </h2>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/trials")}
          >
            View All
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeletons.Card key={i} />
            ))}
          </div>
        ) : trials.length === 0 ? (
          <EmptyStates.NoTrials
            onCreateClick={() => router.push("/dashboard/trials/new")}
          />
        ) : (
          <div className="space-y-4">
            {trials.slice(0, 5).map((trial, index) => (
              <motion.div
                key={trial._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  hover
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/trials/${trial._id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-neutral-900 truncate">
                          {trial.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              trial.status === "active"
                                ? "success"
                                : trial.status === "completed"
                                ? "info"
                                : trial.status === "paused"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {trial.status.charAt(0).toUpperCase() +
                              trial.status.slice(1)}
                          </Badge>
                          {trial.isUnblinded && (
                            <Badge variant="danger" icon="🔓">
                              Unblinded
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-neutral-600 mb-3 line-clamp-2">
                        {trial.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-neutral-500">
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>
                            {trial.currentEnrollment || 0}/
                            {trial.targetEnrollment || 100} participants
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>
                            Created{" "}
                            {new Date(trial.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/trials/${trial._id}/reports`);
                        }}
                      >
                        📊 Reports
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/trials/${trial._id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
