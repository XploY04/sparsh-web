"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BeakerIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Table from "../../../components/ui/Table";
import { ProgressBar } from "../../../components/ui/Progress";
import {
  LoadingSkeletons,
  EmptyStates,
} from "../../../components/ui/LoadingStates";
import MetricCard from "../../../components/MetricCard";
import { showToast } from "../../../components/ui/Toast";
import UnblindConfirmationModal from "../../components/UnblindConfirmationModal";

export default function TrialDetailPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trial, setTrial] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showUnblindModal, setShowUnblindModal] = useState(false);
  const [unblindResult, setUnblindResult] = useState(null);

  const trialId = params.trialId;

  // Fetch trial data
  const fetchTrial = async () => {
    try {
      const response = await fetch(`/api/trials/${trialId}`);
      if (response.ok) {
        const data = await response.json();
        setTrial(data);
      } else {
        throw new Error("Failed to fetch trial details");
      }
    } catch (error) {
      showToast.error("Failed to load trial details");
      console.error("Error fetching trial:", error);
    }
  };

  // Fetch participants data
  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/trials/${trialId}/participants`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(data);
      } else {
        throw new Error("Failed to fetch participants");
      }
    } catch (error) {
      showToast.error("Failed to load participants");
      console.error("Error fetching participants:", error);
    }
  };

  // Fetch alerts data
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/trials/${trialId}/alerts`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      } else {
        console.error("Failed to fetch alerts");
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTrial(), fetchParticipants(), fetchAlerts()]);
      setLoading(false);
    };

    loadData();
  }, [session, status, trialId, router]);

  // Enroll new participant
  const enrollParticipant = async () => {
    setEnrolling(true);

    try {
      const response = await fetch(`/api/trials/${trialId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        showToast.success("Participant enrolled successfully");
        await fetchParticipants(); // Refresh participant list
        await fetchTrial(); // Refresh trial data for updated counts
      } else {
        const errorText = await response.text();
        showToast.error(errorText || "Failed to enroll participant");
      }
    } catch (error) {
      showToast.error("Error enrolling participant");
    } finally {
      setEnrolling(false);
    }
  };

  // Update trial status
  const updateTrialStatus = async (newStatus) => {
    setUpdatingStatus(true);

    try {
      const response = await fetch(`/api/trials/${trialId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        showToast.success(`Trial status updated to ${newStatus}`);
        await fetchTrial(); // Refresh trial data
      } else {
        const errorText = await response.text();
        showToast.error(errorText || "Failed to update trial status");
      }
    } catch (error) {
      showToast.error("Error updating trial status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStudyUnblind = async (reason, confirmationText) => {
    try {
      const response = await fetch(`/api/trials/${trialId}/unblind`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason,
          confirmationText,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setUnblindResult(result);
        setShowUnblindModal(false);
        showToast.success("Trial unblinded successfully");
        await fetchTrial(); // Refresh trial data
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to unblind trial");
      }
    } catch (error) {
      showToast.error(error.message);
      throw error;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8">
        <LoadingSkeletons.Card />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeletons.MetricCard key={i} />
          ))}
        </div>
        <LoadingSkeletons.Table />
      </div>
    );
  }

  if (!trial) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Trial Not Found
        </h3>
        <p className="text-neutral-500 mb-6">
          The requested trial could not be found.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const enrollmentProgress =
    (trial.currentEnrollment / trial.targetEnrollment) * 100;

  const statusConfig = {
    active: { variant: "success", icon: PlayIcon },
    paused: { variant: "warning", icon: PauseIcon },
    completed: { variant: "info", icon: CheckCircleIcon },
    draft: { variant: "neutral", icon: DocumentTextIcon },
  };

  const currentStatus = statusConfig[trial.status] || statusConfig.draft;
  const StatusIcon = currentStatus.icon;

  const participantColumns = [
    {
      key: "participantCode",
      label: "Participant ID",
      render: (value) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      key: "enrollmentDate",
      label: "Enrolled",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "active" ? "success" : "neutral"}>
          {value}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (_, participant) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              router.push(`/dashboard/participants/${participant._id}`)
            }
          >
            View
          </Button>
          {!trial.isUnblinded && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                // Handle individual participant unblind
                showToast.info(
                  "Individual participant unblinding not implemented yet"
                );
              }}
            >
              Unblind
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              ← Back to Dashboard
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BeakerIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                {trial.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge
                  variant={currentStatus.variant}
                  icon={<StatusIcon className="w-3 h-3" />}
                >
                  {trial.status.charAt(0).toUpperCase() + trial.status.slice(1)}
                </Badge>
                {trial.isUnblinded && (
                  <Badge variant="danger">
                    <EyeSlashIcon className="w-3 h-3" />
                    Unblinded
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <p className="text-neutral-600 text-lg">{trial.description}</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                router.push(`/dashboard/trials/${trialId}/reports`)
              }
            >
              <ChartBarIcon className="w-4 h-4" />
              Reports
            </Button>
            <Button
              variant="primary"
              onClick={enrollParticipant}
              loading={enrolling}
              disabled={trial.status !== "active"}
            >
              <PlusIcon className="w-4 h-4" />
              Enroll Participant
            </Button>
          </div>

          <div className="flex gap-2">
            {trial.status === "active" && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => updateTrialStatus("paused")}
                loading={updatingStatus}
              >
                <PauseIcon className="w-4 h-4" />
                Pause
              </Button>
            )}
            {trial.status === "paused" && (
              <Button
                variant="success"
                size="sm"
                onClick={() => updateTrialStatus("active")}
                loading={updatingStatus}
              >
                <PlayIcon className="w-4 h-4" />
                Resume
              </Button>
            )}
            {!trial.isUnblinded && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowUnblindModal(true)}
              >
                <EyeSlashIcon className="w-4 h-4" />
                Emergency Unblind
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
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
                  Active Alerts ({alerts.length})
                </h3>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div key={index} className="text-sm text-warning-800">
                      <span className="font-medium">{alert.type}:</span>{" "}
                      {alert.message}
                    </div>
                  ))}
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Enrollment Progress"
            value={`${trial.currentEnrollment || 0}/${
              trial.targetEnrollment || 0
            }`}
            subtitle={`${Math.round(enrollmentProgress)}% complete`}
            variant="primary"
          />
          <MetricCard
            title="Active Participants"
            value={participants.filter((p) => p.status === "active").length}
            subtitle="Currently in study"
            variant="success"
          />
          <MetricCard
            title="Study Duration"
            value={trial.duration ? `${trial.duration} days` : "Not set"}
            subtitle="Total planned duration"
            variant="info"
          />
          <MetricCard
            title="Data Points"
            value={participants.reduce(
              (sum, p) => sum + (p.dataPoints?.length || 0),
              0
            )}
            subtitle="Total collected"
            variant="neutral"
          />
        </div>
      </motion.div>

      {/* Enrollment Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Enrollment Progress
          </h3>
          <ProgressBar
            current={trial.currentEnrollment || 0}
            total={trial.targetEnrollment || 0}
            label="Participants Enrolled"
            variant={enrollmentProgress >= 100 ? "success" : "primary"}
          />
        </Card>
      </motion.div>

      {/* Participants Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            Participants ({participants.length})
          </h2>
        </div>

        <Table
          data={participants}
          columns={participantColumns}
          emptyState={
            <EmptyStates.NoParticipants
              onEnrollClick={
                trial.status === "active" ? enrollParticipant : null
              }
            />
          }
        />
      </motion.div>

      {/* Unblind Modal */}
      <UnblindConfirmationModal
        isOpen={showUnblindModal}
        onClose={() => setShowUnblindModal(false)}
        onConfirm={handleStudyUnblind}
        type="trial"
        trialTitle={trial.title}
      />

      {/* Unblind Results */}
      {unblindResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 mb-4">
                <EyeSlashIcon className="h-6 w-6 text-warning-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Trial Successfully Unblinded
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">
                  Treatment Assignments:
                </h4>
                <div className="space-y-2">
                  {unblindResult.assignments?.map((assignment, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="font-mono">
                        {assignment.participantCode}
                      </span>
                      <Badge
                        variant={
                          assignment.treatment === "active"
                            ? "success"
                            : "neutral"
                        }
                      >
                        {assignment.treatment}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button onClick={() => setUnblindResult(null)}>Close</Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
