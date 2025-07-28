// src/routes/api/upload.ts
import type { APIEvent } from "@solidjs/start/server";
import {
  uploadFile,
  getPublicUrl,
  listFiles,
  deleteFile,
} from "../../lib/minio";
import { randomUUID } from "crypto";
import sharp from "sharp"; // Import the sharp library

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

  const objectKey = `products/${fileNameBase}.${format}`;
  // NOTE: Your `uploadFile` function needs to accept and use the cacheControl parameter.
  await uploadFile(objectKey, buffer, mimeType, {}, LONG_CACHE_CONTROL);
  return getPublicUrl(objectKey);
}

export async function POST(event: APIEvent) {
  try {
    const formData = await event.request.formData();
    const files = formData.getAll("files[]") as File[];
    const oldImageBaseUrl = formData.get("oldImageBaseUrl") as string | null;

    if (files.length === 0) {
      return createErrorResponse("No files provided.", 400);
    }
    if (files.length > 6) {
      return createErrorResponse("Maximum 6 images allowed.", 400);
    }

    // Generate a single base UUID for all images of this product
    const productImageBaseUrl = randomUUID();
    const uploadedImageBaseUrls: string[] = [productImageBaseUrl]; // This array will now only contain one UUID

    for (let i = 0; i < files.length; i++) {
      const masterFile = files[i];
      if (!masterFile || masterFile.size === 0) {
        return createErrorResponse("Empty file provided.", 400);
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

      const sizes = {
        thumbnail: { width: 96, height: 54 },
        card: { width: 608, height: 342 },
        detail: { width: 1280, height: 720 },
      };
      const formats = ["avif", "webp", "jpeg"] as const;

      const uploadPromises: Promise<any>[] = [];

      for (const sizeName in sizes) {
        const { width, height } = sizes[sizeName as keyof typeof sizes];
        for (const format of formats) {
          // Use the single productImageBaseUrl and the current file index 'i'
          const fileNameBase = `${productImageBaseUrl}-${i}-${sizeName}`;
          const mimeType = `image/${format}`;
          const resizedInstance = sharpInstance
            .clone()
            .resize(width, height, { fit: "inside", withoutEnlargement: true });

          uploadPromises.push(
            processAndUploadVariant(
              resizedInstance,
              fileNameBase,
              format,
              mimeType
            )
          );
        }
      }
      await Promise.all(uploadPromises);
    }

    // If new images were uploaded successfully and an old base URL was provided, delete the old image set
    if (oldImageBaseUrl) {
      try {
        console.log(`Deleting old image set for base URL: ${oldImageBaseUrl}`);
        const objectsToDelete = await listFiles(`products/${oldImageBaseUrl}`);
        if (objectsToDelete.Contents) {
          const deletePromises = objectsToDelete.Contents.map((obj) =>
            deleteFile(obj.Key!)
          );
          await Promise.all(deletePromises);
          console.log(
            `Successfully deleted ${objectsToDelete.Contents.length} old image files.`
          );
        }
      } catch (deleteError) {
        // Log the error but don't fail the whole request, since the new images are already uploaded.
        console.error(
          `Failed to delete old image set for base URL ${oldImageBaseUrl}:`,
          deleteError
        );
      }
    }

    // Return the single base URL for the product's images
    const imageBaseUrls: string[] = uploadedImageBaseUrls;

    return createSuccessResponse({
      success: true,
      imageBaseUrls, // Return the structured object
      message: `Successfully processed and uploaded ${uploadedImageBaseUrls.length} image(s).`,
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
