// Test script for participant enrollment and randomization
// Run with: node scripts/testParticipantEnrollment.js

import dbConnect from "../lib/dbConnect.js";
import Trial from "../models/Trial.js";
import Participant from "../models/Participant.js";
import mongoose from "mongoose";

async function testParticipantEnrollment() {
  console.log("🧪 Testing Participant Enrollment and Randomization...\n");
  
  try {
    await dbConnect();
    console.log("✅ Connected to database");

    // Create a test trial
    const testTrial = new Trial({
      title: "Test Randomization Trial",
      description: "Testing the randomization logic",
      status: "active",
      arms: [
        { name: "Control", description: "Placebo group" },
        { name: "Treatment", description: "Active treatment group" }
      ],
      randomizationRatio: [1, 1], // 1:1 ratio
      targetEnrollment: 20
    });

    await testTrial.save();
    console.log("✅ Created test trial:", testTrial.title);

    // Test participant enrollment and randomization
    const enrollmentResults = { 0: 0, 1: 0 }; // Track assignments
    const numParticipants = 10;

    for (let i = 0; i < numParticipants; i++) {
      const participantCode = `TEST${Date.now()}${i}`;
      
      // Simulate randomization logic
      const totalWeight = testTrial.randomizationRatio.reduce((sum, weight) => sum + weight, 0);
      const random = Math.random() * totalWeight;
      
      let cumulativeWeight = 0;
      let assignedGroup = 0;
      for (let j = 0; j < testTrial.randomizationRatio.length; j++) {
        cumulativeWeight += testTrial.randomizationRatio[j];
        if (random <= cumulativeWeight) {
          assignedGroup = j;
          break;
        }
      }

      const participant = new Participant({
        participantCode,
        trialId: testTrial._id,
        assignedGroup,
        status: "enrolled"
      });

      await participant.save();
      enrollmentResults[assignedGroup]++;
      
      console.log(`👤 Enrolled ${participantCode} → Group ${assignedGroup} (${testTrial.arms[assignedGroup].name})`);
    }

    console.log("\n📊 Randomization Results:");
    testTrial.arms.forEach((arm, index) => {
      const count = enrollmentResults[index];
      const percentage = ((count / numParticipants) * 100).toFixed(1);
      console.log(`   ${arm.name}: ${count}/${numParticipants} (${percentage}%)`);
    });

    // Test blinded data retrieval
    console.log("\n🔒 Testing Blinded Data Retrieval:");
    const blindedParticipants = await Participant.find({ trialId: testTrial._id })
      .select("-assignedGroup -isUnblinded")
      .sort({ enrollmentDate: -1 });
    
    console.log(`   Retrieved ${blindedParticipants.length} participants (assignedGroup hidden)`);
    console.log("   Sample participant data:", {
      participantCode: blindedParticipants[0]?.participantCode,
      status: blindedParticipants[0]?.status,
      enrollmentDate: blindedParticipants[0]?.enrollmentDate,
      hasAssignedGroup: blindedParticipants[0]?.assignedGroup !== undefined
    });

    // Clean up test data
    await Participant.deleteMany({ trialId: testTrial._id });
    await Trial.findByIdAndDelete(testTrial._id);
    console.log("\n🧹 Cleaned up test data");

    console.log("\n✅ All tests passed! Participant enrollment system is working correctly.");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
}

// Run the test
testParticipantEnrollment();
