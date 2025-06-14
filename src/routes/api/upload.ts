// src/routes/api/upload.ts
import type { APIEvent } from "@solidjs/start/server";
import { uploadFile, getPublicUrl } from "../../lib/minio";
import { randomUUID } from "crypto";
import sharp from "sharp"; // Import the sharp library
import type { ProductImages } from "~/db/schema";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // Increased to 15MB for high-res masters
// Only allow image types that Sharp can process
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const LONG_CACHE_CONTROL = "public, max-age=31536000, immutable"; // 1 year cache

// Helper function for consistent error responses
function createErrorResponse(message: string, status: number = 500) {
  console.error("API Error:", message);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Helper function for consistent success responses
function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// A helper to process and upload a single image variant
async function processAndUploadVariant(
  sharpInstance: sharp.Sharp,
  fileNameBase: string,
  suffix: string,
  format: "avif" | "webp" | "jpeg",
  mimeType: string
): Promise<string> {
  let buffer: Buffer;
  let quality: number;

  switch (format) {
    case "avif":
      quality = 80; // Good quality for AVIF
      buffer = await sharpInstance.avif({ quality }).toBuffer();
      break;
    case "webp":
      quality = 85; // Good quality for WebP
      buffer = await sharpInstance.webp({ quality }).toBuffer();
      break;
    case "jpeg":
      quality = 90; // High quality for JPEG fallback
      buffer = await sharpInstance.jpeg({ quality }).toBuffer();
      break;
  }

  const objectKey = `products/${fileNameBase}-${suffix}.${format}`;
  // NOTE: Your `uploadFile` function needs to accept and use the cacheControl parameter.
  await uploadFile(objectKey, buffer, mimeType, {}, LONG_CACHE_CONTROL);
  return getPublicUrl(objectKey);
}

export async function POST(event: APIEvent) {
  try {
    const formData = await event.request.formData();
    // Your `new.tsx` sends the file with the key "file"
    const masterFile = formData.get("file") as File | null;

    if (!masterFile || masterFile.size === 0) {
      return createErrorResponse("No file provided or file is empty", 400);
    }
    if (masterFile.size > MAX_FILE_SIZE) {
      return createErrorResponse("Master image is too large.", 400);
    }
    if (!ALLOWED_MIME_TYPES.includes(masterFile.type)) {
      return createErrorResponse(
        `File type ${masterFile.type} is not allowed.`,
        400
      );
    }

    const masterBuffer = Buffer.from(await masterFile.arrayBuffer());
    const sharpInstance = sharp(masterBuffer);
    const fileNameBase = randomUUID();

    // --- Create Detail and Thumbnail Sharp Instances ---
    // Using .clone() is efficient as it avoids re-decoding the master image
    const detailInstance = sharpInstance
      .clone()
      .resize(1280, 720, { fit: "cover" });
    const thumbnailInstance = sharpInstance
      .clone()
      .resize(640, 360, { fit: "cover" });

    // --- Process and Upload All 6 Variants in Parallel ---
    const [
      detailAvifUrl,
      detailWebpUrl,
      detailJpegUrl,
      thumbAvifUrl,
      thumbWebpUrl,
      thumbJpegUrl,
    ] = await Promise.all([
      processAndUploadVariant(
        detailInstance,
        fileNameBase,
        "detail",
        "avif",
        "image/avif"
      ),
      processAndUploadVariant(
        detailInstance,
        fileNameBase,
        "detail",
        "webp",
        "image/webp"
      ),
      processAndUploadVariant(
        detailInstance,
        fileNameBase,
        "detail",
        "jpeg",
        "image/jpeg"
      ),
      processAndUploadVariant(
        thumbnailInstance,
        fileNameBase,
        "thumb",
        "avif",
        "image/avif"
      ),
      processAndUploadVariant(
        thumbnailInstance,
        fileNameBase,
        "thumb",
        "webp",
        "image/webp"
      ),
      processAndUploadVariant(
        thumbnailInstance,
        fileNameBase,
        "thumb",
        "jpeg",
        "image/jpeg"
      ),
    ]);

    // --- Construct the Final JSON Object ---
    const images: ProductImages = {
      detail: {
        avif: detailAvifUrl,
        webp: detailWebpUrl,
        jpeg: detailJpegUrl,
      },
      thumbnail: {
        avif: thumbAvifUrl,
        webp: thumbWebpUrl,
        jpeg: thumbJpegUrl,
      },
    };

    return createSuccessResponse({
      success: true,
      images, // Return the structured object
      message: `Successfully processed and uploaded 6 image variants.`,
    });
  } catch (error: any) {
    console.error("=== Upload API Error ===", error);
    return createErrorResponse(`Internal server error: ${error.message}`, 500);
  }
}

export async function OPTIONS() {
  // Standard CORS preflight response
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
