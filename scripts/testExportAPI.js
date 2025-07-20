#!/usr/bin/env node

/**
 * Simple validation script for export functionality
 * Tests the API endpoints directly
 */

console.log("🧪 Testing Export Functionality\n");

const BASE_URL = "http://localhost:3001";

async function testAPIEndpoints() {
  console.log("📡 Testing API endpoints...\n");

  try {
    // Test getting trials list
    console.log("1️⃣  Testing /api/trials endpoint...");
    const trialsResponse = await fetch(`${BASE_URL}/api/trials`);

    if (!trialsResponse.ok) {
      console.log(`❌ Trials API failed: ${trialsResponse.status}`);
      return;
    }

    const trials = await trialsResponse.json();
    console.log(`✅ Found ${trials.length} trials`);

    if (trials.length === 0) {
      console.log(
        "⚠️  No trials found. Create a trial first to test export functionality."
      );
      return;
    }

    const testTrial = trials[0];
    console.log(`📊 Testing with trial: "${testTrial.title}"`);
    console.log(`🔒 Trial blinded: ${!testTrial.isUnblinded}\n`);

    // Test aggregated data endpoint
    console.log("2️⃣  Testing aggregated data endpoint...");
    const aggregatedResponse = await fetch(
      `${BASE_URL}/api/trials/${testTrial._id}/aggregated-data`
    );

    if (aggregatedResponse.ok) {
      const aggregatedData = await aggregatedResponse.json();
      console.log("✅ Aggregated data endpoint working");
      console.log(
        `📈 Data includes enrollment tracking: ${!!aggregatedData.aggregatedData
          .enrollmentOverTime}`
      );
    } else {
      console.log(`❌ Aggregated data failed: ${aggregatedResponse.status}`);
    }

    // Test blinded export
    console.log("\n3️⃣  Testing blinded export endpoint...");
    const blindedExportResponse = await fetch(
      `${BASE_URL}/api/trials/${testTrial._id}/export?blinded=true`
    );

    if (blindedExportResponse.ok) {
      const contentType = blindedExportResponse.headers.get("content-type");
      const contentDisposition = blindedExportResponse.headers.get(
        "content-disposition"
      );

      console.log("✅ Blinded export working");
      console.log(`📄 Content-Type: ${contentType}`);
      console.log(`📎 Content-Disposition: ${contentDisposition}`);
    } else {
      const errorData = await blindedExportResponse.text();
      console.log(
        `❌ Blinded export failed: ${blindedExportResponse.status} - ${errorData}`
      );
    }

    // Test unblinded export
    console.log("\n4️⃣  Testing unblinded export endpoint...");
    const unblindedExportResponse = await fetch(
      `${BASE_URL}/api/trials/${testTrial._id}/export?blinded=false`
    );

    if (testTrial.isUnblinded) {
      if (unblindedExportResponse.ok) {
        console.log("✅ Unblinded export working (trial is unblinded)");
      } else {
        console.log(
          `❌ Unblinded export failed: ${unblindedExportResponse.status}`
        );
      }
    } else {
      if (unblindedExportResponse.status === 403) {
        console.log("✅ Unblinded export properly blocked (trial is blinded)");
      } else {
        console.log(
          `⚠️  Expected 403 but got: ${unblindedExportResponse.status}`
        );
      }
    }

    console.log("\n🎯 Test URLs:");
    console.log(`   Dashboard: ${BASE_URL}/dashboard`);
    console.log(
      `   Trial Reports: ${BASE_URL}/dashboard/trials/${testTrial._id}/reports`
    );
    console.log(
      `   Blinded Export: ${BASE_URL}/api/trials/${testTrial._id}/export?blinded=true`
    );
    console.log(
      `   Unblinded Export: ${BASE_URL}/api/trials/${testTrial._id}/export?blinded=false`
    );
  } catch (error) {
    console.error("❌ Error testing endpoints:", error.message);
    console.log("\n💡 Make sure the Next.js server is running on port 3001");
  }
}

console.log("🚀 Starting tests...\n");
testAPIEndpoints()
  .then(() => {
    console.log("\n✅ Export functionality tests completed!");
  })
  .catch(console.error);
