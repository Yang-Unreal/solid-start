import { uploadFile } from "../lib/minio";
import * as fs from "fs/promises";
import * as path from "path";

async function uploadCloudWebp() {
  const filePath = path.join(process.cwd(), "public", "heroBackground.webp");
  const key = "heroBackground.webp"; // This should match the URL in index.tsx
  const contentType = "image/webp";
  const cacheControl = "public, max-age=31536000, immutable"; // 1 year cache

  try {
    console.log(`Attempting to read file from: ${filePath}`);
    const fileBuffer = await fs.readFile(filePath);
    console.log(`File read successfully. Size: ${fileBuffer.length} bytes`);

    console.log(`Uploading ${key} to MinIO...`);
    await uploadFile(
      key,
      new Uint8Array(fileBuffer),
      contentType,
      {},
      cacheControl
    );
    console.log(
      `Successfully uploaded ${key} with Cache-Control: ${cacheControl}`
    );
  } catch (error) {
    console.error(`Failed to upload image:`, error);
    process.exit(1);
  }
}

uploadCloudWebp();
