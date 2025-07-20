"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BeakerIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { StepProgress } from "../../../components/ui/Progress";
import { showToast } from "../../../components/ui/Toast";

const steps = [
  {
    title: "Basic Information",
    description: "Trial details and metadata",
  },
  {
    title: "Study Arms",
    description: "Define treatment groups",
  },
  {
    title: "Randomization",
    description: "Configure randomization",
  },
  {
    title: "Review & Create",
    description: "Finalize and create trial",
  },
];

export default function NewTrialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft",
    arms: [
      { name: "Control", description: "Control group" },
      { name: "Treatment", description: "Active treatment group" },
    ],
    randomizationRatio: [1, 1],
    targetEnrollment: 100,
    duration: "",
    inclusionCriteria: "",
    exclusionCriteria: "",
    primaryEndpoint: "",
    secondaryEndpoints: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const value =
      e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleRatioChange = (index, value) => {
    const newRatio = [...form.randomizationRatio];
    newRatio[index] = parseInt(value) || 1;
    setForm({ ...form, randomizationRatio: newRatio });
  };

  const handleArmChange = (i, e) => {
    const arms = [...form.arms];
    arms[i][e.target.name] = e.target.value;
    setForm({ ...form, arms });
  };

  const addArm = () => {
    const newArms = [...form.arms, { name: "", description: "" }];
    const newRatio = [...form.randomizationRatio, 1];
    setForm({ ...form, arms: newArms, randomizationRatio: newRatio });
  };

  const removeArm = (i) => {
    if (form.arms.length <= 2) {
      showToast.warning("A trial must have at least 2 arms");
      return;
    }
    const arms = form.arms.filter((_, idx) => idx !== i);
    const ratio = form.randomizationRatio.filter((_, idx) => idx !== i);
    setForm({ ...form, arms, randomizationRatio: ratio });
  };

  const validateStep = (stepIndex) => {
    const newErrors = {};

    switch (stepIndex) {
      case 0: // Basic Info
        if (!form.title.trim()) newErrors.title = "Trial title is required";
        if (!form.description.trim())
          newErrors.description = "Description is required";
        if (!form.targetEnrollment || form.targetEnrollment < 1) {
          newErrors.targetEnrollment = "Target enrollment must be at least 1";
        }
        break;

      case 1: // Study Arms
        form.arms.forEach((arm, index) => {
          if (!arm.name.trim()) {
            newErrors[`arm_${index}_name`] = "Arm name is required";
          }
          if (!arm.description.trim()) {
            newErrors[`arm_${index}_description`] =
              "Arm description is required";
          }
        });
        break;

      case 2: // Randomization
        if (form.randomizationRatio.some((ratio) => ratio < 1)) {
          newErrors.randomization = "All ratios must be at least 1";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const submitTrial = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const response = await fetch("/api/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const trial = await response.json();
        showToast.success("Trial created successfully!");
        router.push(`/dashboard/trials/${trial._id}`);
      } else {
        const error = await response.text();
        throw new Error(error || "Failed to create trial");
      }
    } catch (error) {
      showToast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            form={form}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 1:
        return (
          <StudyArmsStep
            form={form}
            handleArmChange={handleArmChange}
            addArm={addArm}
            removeArm={removeArm}
            errors={errors}
          />
        );
      case 2:
        return (
          <RandomizationStep
            form={form}
            handleRatioChange={handleRatioChange}
            errors={errors}
          />
        );
      case 3:
        return <ReviewStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-lg">
            <BeakerIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Create New Trial
          </h1>
        </div>
        <p className="text-neutral-600">
          Follow the guided steps to set up your clinical trial
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <StepProgress steps={steps} currentStep={currentStep} />
        </Card>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-neutral-600">
                {steps[currentStep].description}
              </p>
            </div>

            {renderStepContent()}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            variant="primary"
            onClick={submitTrial}
            loading={loading}
            icon={<CheckCircleIcon className="w-4 h-4" />}
          >
            Create Trial
          </Button>
        ) : (
          <Button variant="primary" onClick={nextStep}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}

// Step Components
const BasicInfoStep = ({ form, handleChange, errors }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2">
        <Input
          label="Trial Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Enter a descriptive title for your trial"
        />
      </div>

      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className={`input ${errors.description ? "input-error" : ""}`}
          placeholder="Provide a detailed description of the trial objectives and methodology"
        />
        {errors.description && (
          <p className="text-sm text-danger-600 mt-1">{errors.description}</p>
        )}
      </div>

      <Input
        type="number"
        label="Target Enrollment"
        name="targetEnrollment"
        value={form.targetEnrollment}
        onChange={handleChange}
        error={errors.targetEnrollment}
        placeholder="Number of participants"
        min="1"
      />

      <Input
        type="number"
        label="Study Duration (days)"
        name="duration"
        value={form.duration}
        onChange={handleChange}
        placeholder="Expected duration in days"
        min="1"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Primary Endpoint
        </label>
        <textarea
          name="primaryEndpoint"
          value={form.primaryEndpoint}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="Define the primary outcome measure"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Secondary Endpoints
        </label>
        <textarea
          name="secondaryEndpoints"
          value={form.secondaryEndpoints}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="List secondary outcome measures"
        />
      </div>
    </div>
  </div>
);

const StudyArmsStep = ({
  form,
  handleArmChange,
  addArm,
  removeArm,
  errors,
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <p className="text-neutral-600">
        Define the different treatment groups for your trial
      </p>
      <Button
        variant="secondary"
        onClick={addArm}
        icon={<PlusIcon className="w-4 h-4" />}
      >
        Add Arm
      </Button>
    </div>

    <div className="space-y-4">
      {form.arms.map((arm, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-neutral-50 rounded-lg border border-neutral-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-neutral-900">Arm {index + 1}</h4>
            {form.arms.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeArm(index)}
                className="text-danger-600 hover:text-danger-700"
                icon={<TrashIcon className="w-4 h-4" />}
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Arm Name"
              name="name"
              value={arm.name}
              onChange={(e) => handleArmChange(index, e)}
              error={errors[`arm_${index}_name`]}
              placeholder="e.g., Control, Treatment A"
            />
            <Input
              label="Description"
              name="description"
              value={arm.description}
              onChange={(e) => handleArmChange(index, e)}
              error={errors[`arm_${index}_description`]}
              placeholder="Brief description of this arm"
            />
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const RandomizationStep = ({ form, handleRatioChange, errors }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        Randomization Ratio
      </h3>
      <p className="text-neutral-600 mb-6">
        Set the allocation ratio for each arm. For example, 1:1 means equal
        allocation.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {form.arms.map((arm, index) => (
        <div key={index} className="p-4 bg-neutral-50 rounded-lg">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {arm.name} Ratio
          </label>
          <Input
            type="number"
            value={form.randomizationRatio[index]}
            onChange={(e) => handleRatioChange(index, e.target.value)}
            min="1"
            className="w-full"
          />
        </div>
      ))}
    </div>

    {errors.randomization && (
      <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-sm text-danger-700">
        {errors.randomization}
      </div>
    )}

    <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
      <h4 className="font-medium text-primary-900 mb-2">
        Randomization Preview
      </h4>
      <p className="text-sm text-primary-800">
        Ratio: {form.randomizationRatio?.join(":") || "1:1"}(
        {form.arms
          ?.map((arm, index) => {
            const ratio = form.randomizationRatio?.[index] || 1;
            const total =
              form.randomizationRatio?.reduce((a, b) => a + b, 0) || 1;
            const percentage = Math.round((ratio / total) * 100);
            return `${arm?.name || "Arm"}: ${percentage}%`;
          })
          .join(", ") || "No arms defined"}
        )
      </p>
    </div>
  </div>
);

const ReviewStep = ({ form }) => (
  <div className="space-y-6">
    <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-success-600" />
        <h3 className="font-medium text-success-900">Ready to Create</h3>
      </div>
      <p className="text-sm text-success-800 mt-1">
        Review the trial configuration below and click "Create Trial" to
        proceed.
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding="default" className="bg-neutral-50">
        <h4 className="font-semibold text-neutral-900 mb-3">
          Basic Information
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Title:</span>{" "}
            {form.title || "No title"}
          </div>
          <div>
            <span className="font-medium">Target Enrollment:</span>{" "}
            {form.targetEnrollment || "Not specified"}
          </div>
          <div>
            <span className="font-medium">Duration:</span>{" "}
            {form.duration ? `${form.duration} days` : "Not specified"}
          </div>
        </div>
      </Card>

      <Card padding="default" className="bg-neutral-50">
        <h4 className="font-semibold text-neutral-900 mb-3">Study Arms</h4>
        <div className="space-y-2 text-sm">
          {form.arms?.map((arm, index) => (
            <div key={index}>
              <span className="font-medium">{arm?.name || "Unnamed Arm"}:</span>{" "}
              {arm?.description || "No description"}
            </div>
          ))}
        </div>
      </Card>
    </div>

    <Card padding="default" className="bg-neutral-50">
      <h4 className="font-semibold text-neutral-900 mb-3">Description</h4>
      <p className="text-sm text-neutral-700">
        {form.description || "No description provided"}
      </p>
    </Card>
  </div>
);
