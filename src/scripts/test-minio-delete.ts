import {
  uploadFile,
  getPublicUrl,
  deleteFile,
  minio,
  bucket,
  endpoint,
} from "../lib/minio";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import * as fs from "fs/promises";
import * as path from "path";

async function testMinIOUploadDelete() {
  const testKey = `products/test-vehicle-image-${Date.now()}.jpg`;
  const filePath = path.join(
    process.cwd(),
    "..",
    "..",
    "public",
    "heroBackground.webp"
  ); // Using existing file

  try {
    console.log("=== MinIO Upload/Delete Test ===");

    // Step 1: Upload a test file
    console.log(`Reading test file from: ${filePath}`);
    const fileBuffer = await fs.readFile(filePath);
    console.log(`File read successfully. Size: ${fileBuffer.length} bytes`);

    console.log(`Uploading test file with key: ${testKey}`);
    await uploadFile(testKey, new Uint8Array(fileBuffer), "image/webp");
    console.log("✅ Upload successful");

    // Step 2: Get the public URL
    const publicUrl = getPublicUrl(testKey);
    console.log(`Generated public URL: ${publicUrl}`);

    // Also test with a simulated endpoint that has a path
    const simulatedEndpointWithPath = "https://minio.limingcn.com/minio";
    const simulatedUrl = `${simulatedEndpointWithPath}/${bucket}/${testKey}`;
    console.log(`Simulated URL with endpoint path: ${simulatedUrl}`);

    // Step 3: Extract key using the same logic as vehicle deletion
    console.log("\n=== Testing Key Extraction ===");
    const url = new URL(publicUrl);
    console.log(`URL pathname: ${url.pathname}`);

    if (!endpoint) throw new Error("MinIO endpoint not configured");
    const endpointUrl = new URL(endpoint);
    const endpointPath = endpointUrl.pathname.replace(/\/$/, "");
    const bucketPrefix = `${endpointPath}/${bucket}`;
    console.log(`Endpoint path: ${endpointPath}`);
    console.log(`Bucket prefix: ${bucketPrefix}`);

    const extractedKey = url.pathname.replace(
      new RegExp(`^${bucketPrefix}/`),
      ""
    );
    console.log(`Extracted key: ${extractedKey}`);
    console.log(`Original key: ${testKey}`);
    console.log(`Keys match: ${extractedKey === testKey}`);

    // Test with simulated endpoint path
    console.log("\n=== Testing with Simulated Endpoint Path ===");
    const simulatedUrlObj = new URL(simulatedUrl);
    console.log(`Simulated URL pathname: ${simulatedUrlObj.pathname}`);

    const simulatedEndpointUrl = new URL(simulatedEndpointWithPath);
    const simulatedEndpointPath = simulatedEndpointUrl.pathname.replace(
      /\/$/,
      ""
    );
    const simulatedBucketPrefix = `${simulatedEndpointPath}/${bucket}`;
    console.log(`Simulated endpoint path: ${simulatedEndpointPath}`);
    console.log(`Simulated bucket prefix: ${simulatedBucketPrefix}`);

    const simulatedExtractedKey = simulatedUrlObj.pathname.replace(
      new RegExp(`^${simulatedBucketPrefix}/`),
      ""
    );
    console.log(`Simulated extracted key: ${simulatedExtractedKey}`);
    console.log(`Simulated keys match: ${simulatedExtractedKey === testKey}`);

    // Step 4: Try to delete using extracted key
    console.log("\n=== Testing Deletion ===");
    console.log(`Attempting to delete with extracted key: ${extractedKey}`);

    await minio.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: [{ Key: extractedKey }],
        },
      })
    );

    console.log("✅ Deletion successful");

    // Step 5: Verify deletion by trying to access the file
    console.log("\n=== Verification ===");
    try {
      await minio.send({
        Bucket: bucket,
        Key: extractedKey,
      } as any);
      console.log("❌ File still exists after deletion");
    } catch (error: any) {
      if (error.name === "NoSuchKey") {
        console.log(
          "✅ File successfully deleted (NoSuchKey error as expected)"
        );
      } else {
        console.log("⚠️  Unexpected error during verification:", error.message);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testMinIOUploadDelete();
