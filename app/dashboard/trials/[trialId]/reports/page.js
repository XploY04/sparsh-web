"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function TrialReportsPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trial, setTrial] = useState(null);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const trialId = params.trialId;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch trial details
        const trialResponse = await fetch(`/api/trials/${trialId}`);
        if (trialResponse.ok) {
          const trialData = await trialResponse.json();
          setTrial(trialData);
        }

        // Fetch aggregated data
        const dataResponse = await fetch(
          `/api/trials/${trialId}/aggregated-data`
        );
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setAggregatedData(data.aggregatedData);
        } else {
          setError("Failed to fetch aggregated data");
        }
      } catch (error) {
        setError("Error fetching data");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, trialId, router]);

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

  const { totalStats, byType, bySeverity, dailyActivity, alerts } =
    aggregatedData || {};

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/trials/${trialId}`)}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Trial Detail
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Data Reports: {trial?.title}
        </h1>
        <p className="text-gray-600">
          Aggregated trial data visualization (blinded analysis)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Total Data Points
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {totalStats?.totalDataPoints || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Active Participants
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {totalStats?.uniqueParticipantCount || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Total Alerts
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {totalStats?.totalAlerts || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Alert Rate
          </h3>
          <p className="text-3xl font-bold text-yellow-600">
            {totalStats?.totalDataPoints > 0
              ? `${(
                  (totalStats.totalAlerts / totalStats.totalDataPoints) *
                  100
                ).toFixed(1)}%`
              : "0%"}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Data Types Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            Data Types Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byType || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">
            Data Severity Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bySeverity || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ severity, count }) => `${severity}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="severity"
              >
                {(bySeverity || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">
            Daily Activity (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyActivity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                name="Total Data Points"
              />
              <Line
                type="monotone"
                dataKey="alertCount"
                stroke="#ff7300"
                name="Alerts"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Types */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4">
            Alert Types and Severity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={alerts || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => router.push(`/dashboard/trials/${trialId}`)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
        >
          Back to Trial
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}
