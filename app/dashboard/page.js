"use client";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [trials, setTrials] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/trials")
        .then((res) => res.json())
        .then(setTrials);
    }
  }, [status]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Clinical Trials Dashboard
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/dashboard/trials/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Create New Trial
          </button>
          <button
            onClick={() => signOut()}
            className="text-red-600 hover:text-red-700 px-4 py-2 rounded border border-red-600 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <ul className="space-y-4">
        {trials.map((trial) => (
          <li
            key={trial._id}
            className="bg-white p-4 rounded shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-lg">{trial.title}</div>
                <div className="text-gray-600 mt-1">{trial.description}</div>
                <div className="flex items-center gap-4 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      trial.status === "active"
                        ? "bg-green-100 text-green-800"
                        : trial.status === "paused"
                        ? "bg-yellow-100 text-yellow-800"
                        : trial.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {trial.status.charAt(0).toUpperCase() +
                      trial.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    Target: {trial.targetEnrollment || 100} participants
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/dashboard/trials/${trial._id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                View Details
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
