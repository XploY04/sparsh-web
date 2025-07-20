"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

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
  const [errors, setErrors] = useState({});

  const isParticipant = type === "participant";
  const expectedConfirmation = isParticipant
    ? `UNBLIND ${participantCode}`
    : "UNBLIND STUDY";

  const minReasonLength = isParticipant ? 10 : 20;

  const validateForm = () => {
    const newErrors = {};

    if (!reason.trim()) {
      newErrors.reason = "Reason is required";
    } else if (reason.trim().length < minReasonLength) {
      newErrors.reason = `Reason must be at least ${minReasonLength} characters`;
    }

    if (!confirmationText) {
      newErrors.confirmation = "Confirmation text is required";
    } else if (confirmationText !== expectedConfirmation) {
      newErrors.confirmation = `Must exactly match: ${expectedConfirmation}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onConfirm(reason, confirmationText);
      setReason("");
      setConfirmationText("");
    } catch (error) {
      setErrors({ general: "Failed to process unblinding request" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setConfirmationText("");
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      showCloseButton={!isSubmitting}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        {/* Warning Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-100 mb-6">
          <EyeSlashIcon className="h-8 w-8 text-danger-600" />
        </div>

        {/* Title and Description */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-neutral-900 mb-3">
            {isParticipant
              ? "Emergency Unblind Participant"
              : "Emergency Unblind Study"}
          </h3>

          <div className="space-y-3 text-left">
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-danger-900 mb-2">
                    ⚠️ Critical Warning - This Action Cannot Be Undone
                  </p>
                  <ul className="text-danger-800 space-y-1">
                    <li>
                      • This will permanently reveal treatment assignments
                    </li>
                    <li>• Study integrity may be compromised</li>
                    <li>• Regulatory notifications may be required</li>
                    <li>• Complete audit trail will be maintained</li>
                  </ul>
                </div>
              </div>
            </div>

            {isParticipant ? (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-900">
                      Participant to be unblinded:
                    </p>
                    <Badge variant="info" className="mt-1">
                      {participantCode}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warning-900">
                      Entire study will be unblinded:
                    </p>
                    <p className="text-sm text-warning-800 mt-1 font-mono">
                      {trialTitle}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <Input
            label={
              <span className="flex items-center gap-2">
                Reason for Emergency Unblinding
                <span className="text-danger-500">*</span>
              </span>
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={errors.reason}
            placeholder={
              isParticipant
                ? "Describe the medical emergency or safety concern..."
                : "Describe the study-wide safety issue or emergency..."
            }
            disabled={isSubmitting}
            helperText={`Minimum ${minReasonLength} characters required`}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              <span className="flex items-center gap-2">
                Confirmation Text
                <span className="text-danger-500">*</span>
              </span>
            </label>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <p className="text-sm text-neutral-600 mb-2">
                To proceed, type exactly:
              </p>
              <code className="text-sm font-mono bg-neutral-100 px-2 py-1 rounded text-neutral-900 font-semibold">
                {expectedConfirmation}
              </code>
            </div>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              error={errors.confirmation}
              placeholder={`Type: ${expectedConfirmation}`}
              disabled={isSubmitting}
              className="font-mono"
            />
          </div>

          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700"
            >
              {errors.general}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? "Processing..."
                : `Unblind ${isParticipant ? "Participant" : "Study"}`}
            </Button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
}
