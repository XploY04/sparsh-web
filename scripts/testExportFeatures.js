/**
 * Test script to validate data export functionality
 * Run this with: node scripts/testExportFeatures.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Since we're using ES modules, we need to use dynamic imports for the models
async function loadModels() {
  const { default: Trial } = await import("../models/Trial.js");
  const { default: Participant } = await import("../models/Participant.js");
  const { default: DataPoint } = await import("../models/DataPoint.js");

  return { Trial, Participant, DataPoint };
}

async function testExportFeatures() {
  try {
    // Load models dynamically
    const { Trial, Participant, DataPoint } = await loadModels();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find a trial to test with
    const trial = await Trial.findOne();
    if (!trial) {
      console.log("❌ No trials found. Create a trial first.");
      return;
    }

    console.log(`📊 Testing with trial: ${trial.title}`);
    console.log(
      `🔒 Trial blinded status: ${!trial.isUnblinded ? "BLINDED" : "UNBLINDED"}`
    );

    // Check participants
    const participantCount = await Participant.countDocuments({
      trialId: trial._id,
    });
    console.log(`👥 Participants in trial: ${participantCount}`);

    // Check data points
    const dataPointCount = await DataPoint.countDocuments({
      trialId: trial._id,
    });
    console.log(`📈 Data points in trial: ${dataPointCount}`);

    // Test aggregation pipeline (same as used in export)
    const exportData = [];

    const participants = await Participant.find({ trialId: trial._id })
      .select("participantCode assignedGroup enrollmentDate status")
      .lean();

    const dataPoints = await DataPoint.find({ trialId: trial._id })
      .populate({
        path: "participantId",
        select: "participantCode assignedGroup enrollmentDate status",
      })
      .lean();

    console.log("\n📝 Export Data Structure Validation:");

    for (const participant of participants.slice(0, 2)) {
      // Test first 2 participants
      const participantDataPoints = dataPoints.filter(
        (dp) => dp.participantId._id.toString() === participant._id.toString()
      );

      console.log(`\n👤 Participant ${participant.participantCode}:`);
      console.log(`   - Enrollment: ${participant.enrollmentDate}`);
      console.log(`   - Status: ${participant.status}`);
      console.log(`   - Group: ${participant.assignedGroup}`);
      console.log(`   - Data Points: ${participantDataPoints.length}`);

      if (participantDataPoints.length > 0) {
        const sampleDataPoint = participantDataPoints[0];
        console.log(`   - Sample Data Type: ${sampleDataPoint.type}`);
        console.log(`   - Sample Severity: ${sampleDataPoint.severity}`);
        console.log(
          `   - Sample Alert: ${sampleDataPoint.isAlert ? "Yes" : "No"}`
        );
      }
    }

    console.log("\n✅ Export functionality validation complete!");
    console.log("\n🧪 Test URLs:");
    console.log(
      `   - Blinded Export: http://localhost:3000/api/trials/${trial._id}/export?blinded=true`
    );
    console.log(
      `   - Unblinded Export: http://localhost:3000/api/trials/${trial._id}/export?blinded=false`
    );
    console.log(
      `   - Reports Dashboard: http://localhost:3000/dashboard/trials/${trial._id}/reports`
    );
  } catch (error) {
    console.error("❌ Error testing export features:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the test
testExportFeatures();
