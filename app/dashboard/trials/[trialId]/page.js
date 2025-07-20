"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye, Lock, Users, Activity } from "lucide-react";
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
  const [error, setError] = useState("");
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
        setError("Failed to fetch trial details");
      }
    } catch (error) {
      setError("Error fetching trial details");
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
        setError("Failed to fetch participants");
      }
    } catch (error) {
      setError("Error fetching participants");
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
      console.error("Error fetching alerts");
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
    setError("");

    try {
      const response = await fetch(`/api/trials/${trialId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchParticipants(); // Refresh participant list
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to enroll participant");
      }
    } catch (error) {
      setError("Error enrolling participant");
    } finally {
      setEnrolling(false);
    }
  };

  // Update trial status
  const updateTrialStatus = async (newStatus) => {
    setUpdatingStatus(true);
    setError("");

    try {
      const response = await fetch(`/api/trials/${trialId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchTrial(); // Refresh trial data
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to update trial status");
      }
    } catch (error) {
      setError("Error updating trial status");
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

      const data = await response.json();

      if (response.ok) {
        setUnblindResult(data);
        setTrial((prev) => ({
          ...prev,
          isUnblinded: true,
          unblindedAt: data.trial.unblindedAt,
        }));
        setShowUnblindModal(false);
        await fetchTrial(); // Refresh trial data
        await fetchParticipants(); // Refresh participants to show updated status
      } else {
        throw new Error(data.error || "Failed to unblind study");
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      throw error;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!trial) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">Trial not found</div>
      </div>
    );
  }

  const enrollmentStats = {
    enrolled: participants.length,
    target: trial.targetEnrollment || 100,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "paused":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Dashboard
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {trial.title}
            </h1>
            <p className="text-gray-600 mb-4">{trial.description}</p>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  trial.status
                )}`}
              >
                {trial.status.charAt(0).toUpperCase() + trial.status.slice(1)}
              </span>
              <span className="text-sm text-gray-600">
                {enrollmentStats.enrolled} / {enrollmentStats.target} enrolled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Trial Management</h2>

        {/* Navigation Buttons */}
        <div className="flex gap-4 flex-wrap mb-6">
          <button
            onClick={() => router.push(`/dashboard/trials/${trialId}/reports`)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
          >
            View Data Reports
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
          >
            Refresh Data
          </button>
        </div>

        <h3 className="text-lg font-semibold mb-4">Enrollment Controls</h3>

        <div className="flex gap-4 flex-wrap">
          {/* Pause/Resume Button */}
          <button
            onClick={() =>
              updateTrialStatus(trial.status === "active" ? "paused" : "active")
            }
            disabled={updatingStatus || trial.status === "completed"}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              trial.status === "active"
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {updatingStatus
              ? "Updating..."
              : trial.status === "active"
              ? "Pause Enrollment"
              : "Resume Enrollment"}
          </button>

          {/* Enroll Participant Button */}
          <button
            onClick={enrollParticipant}
            disabled={
              enrolling ||
              trial.status !== "active" ||
              enrollmentStats.enrolled >= enrollmentStats.target
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling ? "Enrolling..." : "Enroll New Participant"}
          </button>

          {/* Complete Trial Button */}
          <button
            onClick={() => updateTrialStatus("completed")}
            disabled={updatingStatus || trial.status === "completed"}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Trial
          </button>
        </div>

        {trial.status !== "active" && (
          <p className="mt-2 text-sm text-gray-600">
            {trial.status === "paused" &&
              "Enrollment is paused. Resume to enroll new participants."}
            {trial.status === "completed" &&
              "Trial is completed. No new enrollments allowed."}
            {trial.status === "draft" &&
              "Trial is in draft mode. Activate to begin enrollment."}
          </p>
        )}
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Administrative Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Study Status */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Study Blinding Status</h3>
            {trial.isUnblinded ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">STUDY UNBLINDED</span>
                </div>
                <p className="text-sm text-red-700">
                  Unblinded on:{" "}
                  {new Date(
                    trial.unblindedAt || trial.updatedAt
                  ).toLocaleString()}
                </p>
                {unblindResult && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-800">
                      Treatment Mapping:
                    </p>
                    <div className="mt-1 space-y-1">
                      {unblindResult.treatmentMapping.map((mapping) => (
                        <p key={mapping.group} className="text-xs text-red-700">
                          Group {mapping.group}: {mapping.name}{" "}
                          {mapping.description && `(${mapping.description})`}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-red-700 mt-2">
                      {unblindResult.participants.newlyUnblinded} of{" "}
                      {unblindResult.participants.total} participants newly
                      unblinded
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Lock className="h-4 w-4" />
                  <span className="font-medium">STUDY BLINDED</span>
                </div>
                <p className="text-sm text-gray-600">
                  Treatment assignments are concealed
                </p>
              </div>
            )}
          </div>

          {/* Unblind Actions */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Emergency Actions</h3>
            {!trial.isUnblinded ? (
              <button
                onClick={() => setShowUnblindModal(true)}
                disabled={trial.status === "draft"}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
              >
                <AlertTriangle className="h-4 w-4" />
                Unlock Final Results
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Final results have been unlocked
                </p>
                <p className="text-xs text-green-700 mt-1">
                  All treatment assignments are now visible
                </p>
              </div>
            )}

            {trial.status === "draft" && (
              <p className="text-xs text-gray-500">
                Draft trials cannot be unblinded. Activate the trial first.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 italic">
            ⚠️ Emergency unblinding actions are permanently logged and cannot be
            undone. Use only when medically necessary or for final study
            analysis.
          </p>
        </div>
      </div>

      {/* Alerts Dashboard */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Critical Alerts</h2>
          <p className="text-sm text-gray-600 mt-1">
            Recent alerts requiring attention (participant identities are
            blinded)
          </p>
        </div>
        <div className="p-6">
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${
                    alert.severity === "critical"
                      ? "border-red-300 bg-red-50"
                      : alert.severity === "high"
                      ? "border-orange-300 bg-orange-50"
                      : "border-yellow-300 bg-yellow-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 text-xs font-medium bg-white rounded border">
                        {alert.type}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          alert.severity === "critical"
                            ? "bg-red-200 text-red-800"
                            : alert.severity === "high"
                            ? "bg-orange-200 text-orange-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/participants/${alert.participant.id}`
                          )
                        }
                        className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                      >
                        {alert.participant.code}
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(alert.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Showing 5 of {alerts.length} alerts
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Participants</h2>
          <p className="text-sm text-gray-600 mt-1">
            All participant data is blinded - treatment assignments are not
            visible
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No participants enrolled yet
                  </td>
                </tr>
              ) : (
                participants.map((participant) => (
                  <tr key={participant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/participants/${participant._id}`
                          )
                        }
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {participant.participantCode}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(
                        participant.enrollmentDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          participant.status === "enrolled"
                            ? "bg-blue-100 text-blue-800"
                            : participant.status === "active"
                            ? "bg-green-100 text-green-800"
                            : participant.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {participant.status.charAt(0).toUpperCase() +
                          participant.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unblind Confirmation Modal */}
      <UnblindConfirmationModal
        isOpen={showUnblindModal}
        onClose={() => setShowUnblindModal(false)}
        onConfirm={handleStudyUnblind}
        trialTitle={trial?.title}
        type="trial"
      />
    </div>
  );
}
