#!/usr/bin/env tsx

// Simple test to check MinIO bucket access
import "dotenv/config";
import { listFiles, bucket } from "../lib/minio";

async function testBucketAccess() {
  console.log("🔍 Testing MinIO bucket access...\n");

  console.log("📋 Configuration:");
  console.log(`Bucket: ${bucket}`);
  console.log(`Endpoint: ${process.env.S3_ENDPOINT}\n`);

  try {
    console.log("📂 Trying to list bucket contents...");
    const result = await listFiles("", 10); // List first 10 objects

    console.log("✅ Bucket access successful!");
    console.log(`Found ${result.Contents?.length || 0} objects in bucket`);

    if (result.Contents && result.Contents.length > 0) {
      console.log("📄 Sample objects:");
      result.Contents.slice(0, 3).forEach((obj) => {
        console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
      });
    }

    return true;
  } catch (error: any) {
    console.error("❌ Bucket access failed:");
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.Code || "Unknown"}`);
    console.error(`Status: ${error.$metadata?.httpStatusCode || "Unknown"}`);
    return false;
  }
}

testBucketAccess().then((success) => {
  process.exit(success ? 0 : 1);
});
