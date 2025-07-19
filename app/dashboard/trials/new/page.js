"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = ["Basic Info", "Arms", "Randomization", "Review"];

export default function NewTrialPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft",
    arms: [{ name: "", description: "" }],
    randomizationRatio: [1, 1],
    targetEnrollment: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function handleChange(e) {
    const value = e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  function handleRatioChange(index, value) {
    const newRatio = [...form.randomizationRatio];
    newRatio[index] = parseInt(value) || 1;
    setForm({ ...form, randomizationRatio: newRatio });
  }

  function handleArmChange(i, e) {
    const arms = [...form.arms];
    arms[i][e.target.name] = e.target.value;
    setForm({ ...form, arms });
  }

  function addArm() {
    const newArms = [...form.arms, { name: "", description: "" }];
    const newRatio = [...form.randomizationRatio, 1];
    setForm({ ...form, arms: newArms, randomizationRatio: newRatio });
  }

  function removeArm(i) {
    const arms = form.arms.filter((_, idx) => idx !== i);
    const ratio = form.randomizationRatio.filter((_, idx) => idx !== i);
    setForm({ ...form, arms, randomizationRatio: ratio });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Ensure randomization ratio matches number of arms
    const finalForm = {
      ...form,
      randomizationRatio: form.randomizationRatio.slice(0, form.arms.length)
    };
    
    const res = await fetch("/api/trials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalForm),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Failed to create trial");
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow mt-8">
      <h1 className="text-xl font-bold mb-4">New Trial Wizard</h1>
      <div className="mb-4 flex space-x-2">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`px-3 py-1 rounded ${
              i === step ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {s}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        {step === 0 && (
          <div>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Title"
              className="w-full mb-4 p-2 border rounded"
              required
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full mb-4 p-2 border rounded"
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
            <input
              name="targetEnrollment"
              type="number"
              value={form.targetEnrollment}
              onChange={handleChange}
              placeholder="Target Enrollment"
              className="w-full mb-4 p-2 border rounded"
              min="1"
              required
            />
          </div>
        )}
        {step === 1 && (
          <div>
            {form.arms.map((arm, i) => (
              <div key={i} className="mb-2 flex items-center space-x-2">
                <input
                  name="name"
                  value={arm.name}
                  onChange={(e) => handleArmChange(i, e)}
                  placeholder="Arm Name"
                  className="p-2 border rounded"
                  required
                />
                <input
                  name="description"
                  value={arm.description}
                  onChange={(e) => handleArmChange(i, e)}
                  placeholder="Description"
                  className="p-2 border rounded"
                />
                {form.arms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArm(i)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addArm}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              Add Arm
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Randomization Settings</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Randomization Ratio (must match number of arms)
              </label>
              <div className="space-y-2">
                {form.arms.map((arm, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="w-24 text-sm">{arm.name || `Arm ${i + 1}`}:</span>
                    <input
                      type="number"
                      value={form.randomizationRatio[i] || 1}
                      onChange={(e) => handleRatioChange(i, e.target.value)}
                      className="w-20 p-2 border rounded"
                      min="1"
                      required
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Current ratio: {form.randomizationRatio.slice(0, form.arms.length).join(":")}
              </p>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="mb-2">
              <b>Title:</b> {form.title}
            </div>
            <div className="mb-2">
              <b>Description:</b> {form.description}
            </div>
            <div className="mb-2">
              <b>Status:</b> {form.status}
            </div>
            <div className="mb-2">
              <b>Target Enrollment:</b> {form.targetEnrollment} participants
            </div>
            <div className="mb-2">
              <b>Randomization Ratio:</b> {form.randomizationRatio.slice(0, form.arms.length).join(":")}
            </div>
            <div className="mb-2">
              <b>Arms:</b>
              <ul className="list-disc ml-6">
                {form.arms.map((arm, i) => (
                  <li key={i}>
                    {arm.name} - {arm.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex justify-between mt-6">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next
            </button>
          )}
          {step === steps.length - 1 && (
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
