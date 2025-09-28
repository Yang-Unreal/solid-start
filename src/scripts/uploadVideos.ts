import { uploadFile } from "../lib/minio";
import * as fs from "fs/promises";
import * as path from "path";

// Array of video files to upload
const videosToUpload = [
  {
    key: "byd-3.webm",
    contentType: "video/webm",
  },
  {
    key: "poster.webp",
    contentType: "image/webp",
  },
];

async function uploadVideos() {
  // A long cache policy is perfect for static video assets that won't change.
  const cacheControl = "public, max-age=31536000, immutable"; // 1 year cache

  // We wrap the entire loop in a try/catch. If any file fails, the script will exit.
  try {
    for (const video of videosToUpload) {
      const filePath = path.join(process.cwd(), "public", "videos", video.key);

      console.log(`\n--- Processing: ${video.key} ---`);
      console.log(`Attempting to read file from: ${filePath}`);
      const fileBuffer = await fs.readFile(filePath);
      console.log(`File read successfully. Size: ${fileBuffer.length} bytes`);

      console.log(`Uploading ${video.key} to MinIO...`);
      await uploadFile(
        video.key,
        new Uint8Array(fileBuffer),
        video.contentType,
        {}, // No specific metadata needed
        cacheControl
      );
      console.log(
        `Successfully uploaded ${video.key} with Cache-Control: ${cacheControl}`
      );
    }
    console.log("\nAll videos uploaded successfully!");
  } catch (error) {
    console.error(`\nFailed to upload videos:`, error);
    process.exit(1); // Exit with a failure code
  }
}

// Run the upload script
uploadVideos();
