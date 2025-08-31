#!/usr/bin/env tsx

// Test script to diagnose MinIO connection issues
import "dotenv/config";
import { testMinIOConnection } from "../lib/minio";

async function main() {
  console.log("🔍 Testing MinIO connection...\n");

  // Check environment variables
  console.log("📋 Environment Variables:");
  console.log(
    `S3_ACCESS_KEY_ID: ${
      process.env.S3_ACCESS_KEY_ID ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(
    `S3_SECRET_ACCESS_KEY: ${
      process.env.S3_SECRET_ACCESS_KEY ? "✅ Set" : "❌ Missing"
    }`
  );
  console.log(`S3_BUCKET: ${process.env.S3_BUCKET || "❌ Missing"}`);
  console.log(`S3_ENDPOINT: ${process.env.S3_ENDPOINT || "❌ Missing"}\n`);

  // Test connection
  try {
    const success = await testMinIOConnection();
    if (success) {
      console.log("🎉 MinIO connection test PASSED!");
      process.exit(0);
    } else {
      console.log("💥 MinIO connection test FAILED!");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 MinIO connection test ERROR:", error);
    process.exit(1);
  }
}

main().catch(console.error);
