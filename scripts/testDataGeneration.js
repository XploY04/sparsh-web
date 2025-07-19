// Test script for data monitoring features
// Run this in the browser console on a trial page to generate test data

async function generateTestData() {
  console.log("Starting test data generation...");

  // First, get participants for the current trial
  const urlParts = window.location.pathname.split("/");
  const trialId = urlParts[urlParts.indexOf("trials") + 1];

  try {
    const participantsResponse = await fetch(
      `/api/trials/${trialId}/participants`
    );
    const participants = await participantsResponse.json();

    if (participants.length === 0) {
      console.log(
        "No participants found. Please enroll some participants first."
      );
      return;
    }

    console.log(
      `Found ${participants.length} participants. Generating data...`
    );

    // Sample data types and payloads
    const dataTypes = [
      {
        type: "SymptomReport",
        payloads: [
          { symptom: "headache", severity: 3, duration: "2 hours" },
          { symptom: "nausea", severity: 7, duration: "1 hour" },
          { symptom: "fatigue", severity: 5, duration: "4 hours" },
          { symptom: "dizziness", severity: 9, duration: "30 minutes" }, // High severity
        ],
      },
      {
        type: "VitalSigns",
        payloads: [
          {
            heartRate: 72,
            bloodPressure: { systolic: 120, diastolic: 80 },
            temperature: 98.6,
          },
          {
            heartRate: 130,
            bloodPressure: { systolic: 140, diastolic: 90 },
            temperature: 99.1,
          }, // High heart rate
          {
            heartRate: 68,
            bloodPressure: { systolic: 110, diastolic: 70 },
            temperature: 98.4,
          },
          {
            heartRate: 45,
            bloodPressure: { systolic: 190, diastolic: 120 },
            temperature: 100.2,
          }, // Critical BP
        ],
      },
      {
        type: "SideEffect",
        payloads: [
          { effect: "mild rash", severity: "mild", duration: "2 days" },
          { effect: "severe nausea", severity: "severe", duration: "6 hours" }, // Will trigger alert
          { effect: "drowsiness", severity: "moderate", duration: "3 hours" },
          { effect: "headache", severity: "mild", duration: "1 hour" },
        ],
      },
      {
        type: "EmergencyCall",
        payloads: [
          {
            reason: "Severe allergic reaction",
            severity: "critical",
            notes: "Emergency room visit required",
          }, // Will trigger alert
        ],
      },
      {
        type: "MedicationIntake",
        payloads: [
          {
            medication: "Study Drug A",
            dosage: "10mg",
            time: "morning",
            adherence: true,
          },
          {
            medication: "Study Drug A",
            dosage: "10mg",
            time: "evening",
            adherence: true,
          },
          {
            medication: "Study Drug A",
            dosage: "10mg",
            time: "morning",
            adherence: false,
          },
        ],
      },
    ];

    // Generate data for each participant
    for (const participant of participants) {
      const numDataPoints = Math.floor(Math.random() * 10) + 5; // 5-14 data points per participant

      for (let i = 0; i < numDataPoints; i++) {
        const dataType =
          dataTypes[Math.floor(Math.random() * dataTypes.length)];
        const payload =
          dataType.payloads[
            Math.floor(Math.random() * dataType.payloads.length)
          ];

        try {
          const response = await fetch("/api/data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              participantCode: participant.participantCode,
              type: dataType.type,
              payload: payload,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log(
              `✓ Created ${dataType.type} for ${participant.participantCode}${
                result.dataPoint.isAlert ? " (ALERT)" : ""
              }`
            );
          } else {
            console.error(
              `✗ Failed to create data for ${participant.participantCode}:`,
              await response.text()
            );
          }
        } catch (error) {
          console.error(
            `✗ Error creating data for ${participant.participantCode}:`,
            error
          );
        }

        // Small delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(
      "Test data generation completed! Refresh the page to see the results."
    );
  } catch (error) {
    console.error("Error generating test data:", error);
  }
}

// Instructions for use
console.log(`
🧪 Clinical Trial Data Testing Script
=====================================

To generate test data for this trial:
1. Make sure you have enrolled some participants first
2. Run: generateTestData()
3. Wait for completion
4. Refresh the page to see alerts and data

The script will generate various types of data including some that trigger alerts.
`);

// Make function available globally
window.generateTestData = generateTestData;
