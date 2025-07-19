import dbConnect from "../lib/dbConnect.js";
import Trial from "../models/Trial.js";
import Participant from "../models/Participant.js";
import DataPoint from "../models/DataPoint.js";

async function setupTestData() {
  try {
    await dbConnect();
    console.log("Connected to database");

    // Create a test trial if it doesn't exist
    let trial = await Trial.findOne({ title: "Test Data Monitoring Trial" });
    if (!trial) {
      trial = new Trial({
        title: "Test Data Monitoring Trial",
        description: "A trial for testing data monitoring and alert features",
        status: "active",
        arms: [
          { name: "Control", description: "Control group" },
          { name: "Treatment", description: "Treatment group" },
        ],
        targetEnrollment: 20,
      });
      await trial.save();
      console.log("✓ Created test trial");
    }

    // Create test participants if they don't exist
    const existingParticipants = await Participant.countDocuments({
      trialId: trial._id,
    });
    if (existingParticipants < 5) {
      const participantsToCreate = 5 - existingParticipants;
      for (let i = 0; i < participantsToCreate; i++) {
        const participantCode = `TEST-${String(
          existingParticipants + i + 1
        ).padStart(3, "0")}`;
        const participant = new Participant({
          participantCode,
          trialId: trial._id,
          status: "active",
          assignedGroup: Math.floor(Math.random() * 2) + 1, // Randomly assign to group 1 or 2
        });
        await participant.save();
        console.log(`✓ Created participant ${participantCode}`);
      }
    }

    // Generate sample data points
    const participants = await Participant.find({ trialId: trial._id });
    console.log(`Generating data for ${participants.length} participants...`);

    const dataTypes = [
      {
        type: "SymptomReport",
        samples: [
          {
            symptom: "headache",
            severity: 3,
            duration: "2 hours",
            notes: "Mild headache, tolerable",
          },
          {
            symptom: "nausea",
            severity: 8,
            duration: "1 hour",
            notes: "Severe nausea after meal",
          },
          {
            symptom: "fatigue",
            severity: 5,
            duration: "4 hours",
            notes: "Moderate fatigue",
          },
          {
            symptom: "dizziness",
            severity: 9,
            duration: "30 minutes",
            notes: "Severe dizziness, difficulty standing",
          },
        ],
      },
      {
        type: "VitalSigns",
        samples: [
          {
            heartRate: 72,
            bloodPressure: { systolic: 120, diastolic: 80 },
            temperature: 98.6,
            notes: "Normal vitals",
          },
          {
            heartRate: 130,
            bloodPressure: { systolic: 140, diastolic: 90 },
            temperature: 99.1,
            notes: "Elevated heart rate and BP",
          },
          {
            heartRate: 68,
            bloodPressure: { systolic: 110, diastolic: 70 },
            temperature: 98.4,
            notes: "Normal vitals",
          },
          {
            heartRate: 45,
            bloodPressure: { systolic: 200, diastolic: 125 },
            temperature: 100.2,
            notes: "Critical vital signs",
          },
        ],
      },
      {
        type: "SideEffect",
        samples: [
          {
            effect: "mild rash",
            severity: "mild",
            duration: "2 days",
            bodyPart: "arms",
          },
          {
            effect: "severe nausea",
            severity: "severe",
            duration: "6 hours",
            impact: "Unable to eat",
          },
          {
            effect: "drowsiness",
            severity: "moderate",
            duration: "3 hours",
            impact: "Difficulty concentrating",
          },
          {
            effect: "allergic reaction",
            severity: "severe",
            duration: "4 hours",
            impact: "Breathing difficulties",
          },
        ],
      },
      {
        type: "EmergencyCall",
        samples: [
          {
            reason: "Severe allergic reaction",
            severity: "critical",
            notes: "Emergency room visit required",
            outcome: "Hospitalized",
          },
          {
            reason: "Chest pain",
            severity: "critical",
            notes: "Sudden onset chest pain",
            outcome: "Evaluated in ER",
          },
        ],
      },
      {
        type: "MedicationIntake",
        samples: [
          {
            medication: "Study Drug",
            dosage: "10mg",
            time: "morning",
            adherence: true,
            notes: "Taken as prescribed",
          },
          {
            medication: "Study Drug",
            dosage: "10mg",
            time: "evening",
            adherence: true,
            notes: "Taken as prescribed",
          },
          {
            medication: "Study Drug",
            dosage: "10mg",
            time: "morning",
            adherence: false,
            notes: "Forgot to take medication",
          },
          {
            medication: "Rescue Medication",
            dosage: "5mg",
            time: "afternoon",
            adherence: true,
            notes: "Taken for symptom relief",
          },
        ],
      },
      {
        type: "QualityOfLife",
        samples: [
          {
            overallScore: 7,
            physicalHealth: 6,
            mentalHealth: 8,
            socialFunction: 7,
            notes: "Feeling good overall",
          },
          {
            overallScore: 4,
            physicalHealth: 3,
            mentalHealth: 5,
            socialFunction: 4,
            notes: "Some difficulties with daily activities",
          },
          {
            overallScore: 8,
            physicalHealth: 8,
            mentalHealth: 8,
            socialFunction: 9,
            notes: "Excellent day",
          },
          {
            overallScore: 3,
            physicalHealth: 2,
            mentalHealth: 4,
            socialFunction: 3,
            notes: "Very difficult day",
          },
        ],
      },
    ];

    let totalDataPoints = 0;
    let totalAlerts = 0;

    for (const participant of participants) {
      // Generate 10-20 data points per participant over the last 30 days
      const numDataPoints = Math.floor(Math.random() * 11) + 10; // 10-20 data points

      for (let i = 0; i < numDataPoints; i++) {
        const dataTypeEntry =
          dataTypes[Math.floor(Math.random() * dataTypes.length)];
        const payload =
          dataTypeEntry.samples[
            Math.floor(Math.random() * dataTypeEntry.samples.length)
          ];

        // Create timestamp within last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(timestamp.getHours() - hoursAgo);

        // Determine if this should be an alert
        let isAlert = false;
        let severity = "low";

        if (dataTypeEntry.type === "EmergencyCall") {
          isAlert = true;
          severity = "critical";
        } else if (
          dataTypeEntry.type === "SideEffect" &&
          payload.severity === "severe"
        ) {
          isAlert = true;
          severity = "high";
        } else if (
          dataTypeEntry.type === "SymptomReport" &&
          payload.severity >= 8
        ) {
          isAlert = true;
          severity = "medium";
        } else if (dataTypeEntry.type === "VitalSigns") {
          if (payload.heartRate > 120 || payload.heartRate < 50) {
            isAlert = true;
            severity = "medium";
          }
          if (
            payload.bloodPressure?.systolic > 180 ||
            payload.bloodPressure?.diastolic > 110
          ) {
            isAlert = true;
            severity = "high";
          }
        }

        const dataPoint = new DataPoint({
          participantId: participant._id,
          trialId: trial._id,
          type: dataTypeEntry.type,
          payload,
          timestamp,
          isAlert,
          severity,
        });

        await dataPoint.save();
        totalDataPoints++;
        if (isAlert) totalAlerts++;
      }
    }

    console.log(
      `✓ Generated ${totalDataPoints} data points (${totalAlerts} alerts) for ${participants.length} participants`
    );
    console.log(`✓ Trial ID: ${trial._id}`);
    console.log(`✓ Setup complete! You can now test the monitoring features.`);

    return {
      trialId: trial._id,
      participantCount: participants.length,
      dataPointCount: totalDataPoints,
      alertCount: totalAlerts,
    };
  } catch (error) {
    console.error("Error setting up test data:", error);
    throw error;
  }
}

// Export for use in other scripts
export default setupTestData;

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTestData()
    .then((result) => {
      console.log("Test data setup completed:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Setup failed:", error);
      process.exit(1);
    });
}
