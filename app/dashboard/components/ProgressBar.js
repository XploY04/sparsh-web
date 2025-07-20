"use client";

export default function ProgressBar({
  current,
  target,
  label,
  color = "blue",
}) {
  const percentage = Math.min((current / target) * 100, 100);

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  };

  const backgroundClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    red: "bg-red-100",
    yellow: "bg-yellow-100",
    purple: "bg-purple-100",
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>
          {current} / {target} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className={`w-full ${backgroundClasses[color]} rounded-full h-2`}>
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
