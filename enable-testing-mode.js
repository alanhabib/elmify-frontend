#!/usr/bin/env node

/**
 * Testing Mode Control Script
 *
 * This script allows you to quickly enable/disable authentication bypass for testing.
 *
 * Usage:
 *   node enable-testing-mode.js true   # Enable testing mode
 *   node enable-testing-mode.js false  # Disable testing mode
 */

const fs = require("fs");
const path = require("path");

const ENV_FILE = path.join(__dirname, ".env.local");
const enable = process.argv[2] === "true";

try {
  let envContent = fs.readFileSync(ENV_FILE, "utf8");

  // Update or add the bypass flag
  const bypassRegex = /^EXPO_PUBLIC_BYPASS_AUTH_FOR_TESTING=.*$/m;
  const newBypassLine = `EXPO_PUBLIC_BYPASS_AUTH_FOR_TESTING=${enable}`;

  if (bypassRegex.test(envContent)) {
    envContent = envContent.replace(bypassRegex, newBypassLine);
  } else {
    envContent += `\n${newBypassLine}\n`;
  }

  fs.writeFileSync(ENV_FILE, envContent);

  if (enable) {
  } else {
  }
} catch (error) {
  console.error("❌ Error updating environment file:", error.message);
  process.exit(1);
}
