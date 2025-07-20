#!/usr/bin/env node

/**
 * Validation script for export functionality implementation
 * Checks that all required files and components exist
 */

import fs from "fs";
import path from "path";

console.log("🔍 Validating Export Functionality Implementation\n");

const PROJECT_ROOT = process.cwd();

// Files that should exist for export functionality
const requiredFiles = [
  "app/api/trials/[trialId]/export/route.js",
  "app/dashboard/components/ExportButton.js",
  "app/dashboard/components/MetricCard.js",
  "app/dashboard/components/ProgressBar.js",
  "app/dashboard/trials/[trialId]/reports/page.js",
  "package.json",
];

// Check if files exist
function checkFiles() {
  console.log("📁 Checking required files...\n");

  let allFilesExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - MISSING`);
      allFilesExist = false;
    }
  }

  return allFilesExist;
}

// Check package.json for required dependencies
function checkDependencies() {
  console.log("\n📦 Checking dependencies...\n");

  const packageJsonPath = path.join(PROJECT_ROOT, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  const requiredDeps = ["json2csv", "recharts", "mongoose"];
  let allDepsExist = true;

  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
      allDepsExist = false;
    }
  }

  return allDepsExist;
}

// Check export route implementation
function checkExportRoute() {
  console.log("\n🛤️  Checking export route implementation...\n");

  const exportRoutePath = path.join(
    PROJECT_ROOT,
    "app/api/trials/[trialId]/export/route.js"
  );

  if (!fs.existsSync(exportRoutePath)) {
    console.log("❌ Export route file missing");
    return false;
  }

  const content = fs.readFileSync(exportRoutePath, "utf8");

  const checks = [
    { name: "GET export function", pattern: /export async function GET/ },
    {
      name: "json2csv Parser import",
      pattern: /import.*Parser.*from.*json2csv/,
    },
    { name: "Blinded parameter check", pattern: /blinded.*===.*true/ },
    { name: "CSV headers setup", pattern: /Content-Type.*text\/csv/ },
    { name: "File download headers", pattern: /Content-Disposition/ },
    { name: "Trial unblinding validation", pattern: /trial\.isUnblinded/ },
  ];

  let allChecksPass = true;

  for (const check of checks) {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - NOT FOUND`);
      allChecksPass = false;
    }
  }

  return allChecksPass;
}

// Check reports page implementation
function checkReportsPage() {
  console.log("\n📊 Checking reports page implementation...\n");

  const reportsPagePath = path.join(
    PROJECT_ROOT,
    "app/dashboard/trials/[trialId]/reports/page.js"
  );

  if (!fs.existsSync(reportsPagePath)) {
    console.log("❌ Reports page file missing");
    return false;
  }

  const content = fs.readFileSync(reportsPagePath, "utf8");

  const checks = [
    { name: "ExportButton component import", pattern: /import.*ExportButton/ },
    { name: "MetricCard component import", pattern: /import.*MetricCard/ },
    { name: "Enrollment over time chart", pattern: /enrollmentOverTime/ },
    { name: "Export buttons in JSX", pattern: /<ExportButton/ },
    { name: "Recharts LineChart", pattern: /LineChart/ },
    { name: "Progress bar component", pattern: /ProgressBar/ },
  ];

  let allChecksPass = true;

  for (const check of checks) {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - NOT FOUND`);
      allChecksPass = false;
    }
  }

  return allChecksPass;
}

// Run all validations
function runValidation() {
  const filesExist = checkFiles();
  const depsExist = checkDependencies();
  const exportRouteValid = checkExportRoute();
  const reportsPageValid = checkReportsPage();

  console.log("\n📋 VALIDATION SUMMARY");
  console.log("====================");
  console.log(`Files: ${filesExist ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Dependencies: ${depsExist ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Export Route: ${exportRouteValid ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Reports Page: ${reportsPageValid ? "✅ PASS" : "❌ FAIL"}`);

  const allValid =
    filesExist && depsExist && exportRouteValid && reportsPageValid;

  console.log(
    `\n🎯 OVERALL: ${
      allValid ? "✅ EXPORT FUNCTIONALITY READY" : "❌ ISSUES FOUND"
    }`
  );

  if (allValid) {
    console.log("\n🚀 Ready to test:");
    console.log("   1. Start the server: npm run dev");
    console.log("   2. Login to the dashboard");
    console.log("   3. Navigate to a trial's reports page");
    console.log("   4. Test the export buttons");
  }

  return allValid;
}

runValidation();
