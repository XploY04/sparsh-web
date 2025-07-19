"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ParticipantTimelinePage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [participant, setParticipant] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingMockData, setSubmittingMockData] = useState(false);
  const [mockDataType, setMockDataType] = useState("SymptomReport");

  const participantId = params.participantId;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch participant details
        const participantResponse = await fetch(
          `/api/participants/${participantId}`
        );
        if (participantResponse.ok) {
          const participantData = await participantResponse.json();
          setParticipant(participantData);
        }

        // Fetch timeline data
        const timelineResponse = await fetch(
          `/api/participants/${participantId}/timeline`
        );
        if (timelineResponse.ok) {
          const data = await timelineResponse.json();
          setTimeline(data.timeline);
          setSummary(data.summary);
        } else {
          setError("Failed to fetch timeline data");
        }
      } catch (error) {
        setError("Error fetching data");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, participantId, router]);

  const submitMockData = async () => {
    setSubmittingMockData(true);
    try {
      const mockPayloads = {
        SymptomReport: {
          symptom: "headache",
          severity: Math.floor(Math.random() * 10) + 1,
          duration: "2 hours",
          notes: "Mock symptom report for testing",
        },
        VitalSigns: {
          heartRate: Math.floor(Math.random() * 60) + 60,
          bloodPressure: {
            systolic: Math.floor(Math.random() * 40) + 120,
            diastolic: Math.floor(Math.random() * 20) + 70,
          },
          temperature: (Math.random() * 2 + 97).toFixed(1),
        },
        EmergencyCall: {
          reason: "Mock emergency for testing",
          severity: "critical",
          notes: "This is a test emergency call",
        },
        SideEffect: {
          effect: "nausea",
          severity: ["mild", "moderate", "severe"][
            Math.floor(Math.random() * 3)
          ],
          duration: "30 minutes",
        },
      };

      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantCode: participant?.participantCode,
          type: mockDataType,
          payload: mockPayloads[mockDataType],
        }),
      });

      if (response.ok) {
        // Refresh timeline data
        const timelineResponse = await fetch(
          `/api/participants/${participantId}/timeline`
        );
        if (timelineResponse.ok) {
          const data = await timelineResponse.json();
          setTimeline(data.timeline);
          setSummary(data.summary);
        }
      } else {
        const errorText = await response.text();
        setError(errorText || "Failed to submit mock data");
      }
    } catch (error) {
      setError("Error submitting mock data");
    } finally {
      setSubmittingMockData(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      SymptomReport: "bg-blue-100 text-blue-800",
      VitalSigns: "bg-green-100 text-green-800",
      MedicationIntake: "bg-purple-100 text-purple-800",
      EmergencyCall: "bg-red-100 text-red-800",
      SideEffect: "bg-orange-100 text-orange-800",
      QualityOfLife: "bg-indigo-100 text-indigo-800",
      AppUsage: "bg-gray-100 text-gray-800",
      Other: "bg-pink-100 text-pink-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Participant Timeline: {participant?.participantCode}
            </h1>
            <p className="text-gray-600">
              Complete data timeline for this participant
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Total Events
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {summary.totalDataPoints}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Alerts</h3>
            <p className="text-3xl font-bold text-red-600">
              {summary.totalAlerts}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Data Types
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {summary.dataTypes.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Days Active
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {timeline.length}
            </p>
          </div>
        </div>
      )}

      {/* Mock Data Submission */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Submit Mock Data</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Type
            </label>
            <select
              value={mockDataType}
              onChange={(e) => setMockDataType(e.target.value)}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="SymptomReport">Symptom Report</option>
              <option value="VitalSigns">Vital Signs</option>
              <option value="EmergencyCall">Emergency Call</option>
              <option value="SideEffect">Side Effect</option>
            </select>
          </div>
          <button
            onClick={submitMockData}
            disabled={submittingMockData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingMockData ? "Submitting..." : "Submit Mock Data"}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {timeline.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No data points recorded yet</p>
          </div>
        ) : (
          timeline.map((day) => (
            <div key={day.date} className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{day.totalCount} events</span>
                    {day.alertCount > 0 && (
                      <span className="text-red-600 font-medium">
                        {day.alertCount} alerts
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {day.dataPoints.map((dataPoint) => (
                    <div
                      key={dataPoint._id}
                      className={`border rounded-lg p-4 ${
                        dataPoint.isAlert
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(
                              dataPoint.type
                            )}`}
                          >
                            {dataPoint.type}
                          </span>
                          {dataPoint.isAlert && (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(
                                dataPoint.severity
                              )}`}
                            >
                              {dataPoint.severity.toUpperCase()} ALERT
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(dataPoint.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-2 rounded">
                          {JSON.stringify(dataPoint.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
