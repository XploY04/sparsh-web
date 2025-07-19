// Test script to register admin user and verify API endpoints
const fetch = require("node-fetch");

async function testSetup() {
  const baseUrl = "http://localhost:3001";

  try {
    // Test 1: Register admin user
    console.log("1. Testing admin registration...");
    const registerResponse = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      }),
    });

    if (registerResponse.ok) {
      const user = await registerResponse.json();
      console.log("✅ Admin user registered:", user);
    } else {
      const error = await registerResponse.text();
      console.log("⚠️ Registration response:", error);
    }

    console.log("\n2. Setup complete!");
    console.log("Next steps:");
    console.log("- Open http://localhost:3001 in your browser");
    console.log("- Login with: admin@example.com / admin123");
    console.log("- Access the dashboard to create trials");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("Make sure the development server is running: npm run dev");
  }
}

testSetup();
