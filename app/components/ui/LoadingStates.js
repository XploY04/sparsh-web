"use client";
import { motion } from "framer-motion";
import Button from "./Button";

const LoadingSkeletons = {
  Text: ({ className = "", width = "w-full" }) => (
    <div className={`skeleton-text ${width} ${className}`} />
  ),

  Title: ({ className = "", width = "w-3/4" }) => (
    <div className={`skeleton-title ${width} ${className}`} />
  ),

  Card: ({ className = "" }) => (
    <div className={`card ${className}`}>
      <div className="p-6 space-y-4">
        <LoadingSkeletons.Title />
        <LoadingSkeletons.Text />
        <LoadingSkeletons.Text width="w-2/3" />
      </div>
    </div>
  ),

  Table: ({ rows = 5, columns = 4, className = "" }) => (
    <div className={`card ${className}`}>
      <div className="overflow-hidden">
        <div className="table-header">
          <div className="flex space-x-6 p-6">
            {Array.from({ length: columns }).map((_, i) => (
              <LoadingSkeletons.Title key={i} width="w-24" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-neutral-200">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex space-x-6 p-6">
              {Array.from({ length: columns }).map((_, j) => (
                <LoadingSkeletons.Text key={j} width="w-24" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  MetricCard: ({ className = "" }) => (
    <div className={`card ${className}`}>
      <div className="p-6 space-y-3">
        <LoadingSkeletons.Text width="w-1/2" />
        <div className="skeleton h-8 w-16" />
      </div>
    </div>
  ),
};

const EmptyStates = {
  NoData: ({
    title = "No data available",
    description = "There's nothing to display here yet.",
    action = null,
    icon = "📊",
    className = "",
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 ${className}`}
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </motion.div>
  ),

  NoParticipants: ({ onEnrollClick }) => (
    <EmptyStates.NoData
      title="No participants enrolled"
      description="Start building your study by enrolling your first participant."
      icon="👥"
      action={
        onEnrollClick && (
          <Button onClick={onEnrollClick} variant="primary">
            Enroll First Participant
          </Button>
        )
      }
    />
  ),

  NoTrials: ({ onCreateClick }) => (
    <EmptyStates.NoData
      title="No trials created"
      description="Create your first clinical trial to begin managing studies."
      icon="🧪"
      action={
        onCreateClick && (
          <Button onClick={onCreateClick} variant="primary">
            Create Your First Trial
          </Button>
        )
      }
    />
  ),
};

export { LoadingSkeletons, EmptyStates };
