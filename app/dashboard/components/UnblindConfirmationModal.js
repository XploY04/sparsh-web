"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function UnblindConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  participantCode,
  type = "participant", // "participant" or "trial"
  trialTitle = "",
}) {
  const [reason, setReason] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isParticipant = type === "participant";
  const expectedConfirmation = isParticipant
    ? `UNBLIND ${participantCode}`
    : "UNBLIND STUDY";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert("Please provide a reason for unblinding");
      return;
    }

    if (isParticipant && reason.trim().length < 10) {
      alert("Reason must be at least 10 characters long");
      return;
    }

    if (!isParticipant && reason.trim().length < 20) {
      alert(
        "Reason must be at least 20 characters long for study-wide unblinding"
      );
      return;
    }

    if (confirmationText !== expectedConfirmation) {
      alert(`Please type exactly: ${expectedConfirmation}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason, confirmationText);
    } catch (error) {
      console.error("Error during unblinding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setConfirmationText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-600">
              {isParticipant ? "Emergency Unblinding" : "Study Unblinding"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-2">Critical Action Warning</p>
                  {isParticipant ? (
                    <p>
                      You are about to unblind participant{" "}
                      <strong>{participantCode}</strong>. This action cannot be
                      undone and will reveal their treatment assignment.
                    </p>
                  ) : (
                    <p>
                      You are about to unblind the entire study{" "}
                      <strong>{trialTitle}</strong>. This action cannot be
                      undone and will reveal all treatment assignments. All
                      participants in the study will be marked as unblinded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for {isParticipant ? "Emergency " : ""}Unblinding *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isParticipant
                    ? "Provide a detailed medical or safety reason for emergency unblinding..."
                    : "Provide a detailed reason for study unblinding (e.g., study completion, safety concerns, regulatory requirement)..."
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-1">
                Minimum {isParticipant ? "10" : "20"} characters required
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmation Text *
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={`Type exactly: ${expectedConfirmation}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-1">
                Type exactly:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {expectedConfirmation}
                </code>
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Unblinding..."
                : `Confirm ${isParticipant ? "Emergency " : ""}Unblinding`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
