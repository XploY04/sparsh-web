// Run this script to create your first admin user
// Usage: node scripts/createAdmin.js

const bcrypt = require("bcryptjs");

async function createAdmin() {
  const email = "admin@example.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("Admin user credentials:");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Hashed password:", hashedPassword);
  console.log("\nUse these credentials to register via POST /api/register");
  console.log("Or update your database directly with the hashed password");
}

createAdmin();
