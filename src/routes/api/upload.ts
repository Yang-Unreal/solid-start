// src/routes/api/upload.ts
import type { APIEvent } from "@solidjs/start/server";
import {
  uploadFile,
  getPublicUrl,
  listFiles,
  deleteFile,
} from "../../lib/minio";
import crypto from "node:crypto";

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

export async function POST(event: APIEvent) {
  try {
    const formData = await event.request.formData();
    const files = formData.getAll("photos") as File[];
    const oldImageBaseUrl = formData.get("oldImageBaseUrl") as string | null;

    if (files.length === 0) {
      return createErrorResponse("No files provided.", 400);
    }
    if (files.length > 6) {
      return createErrorResponse("Maximum 6 images allowed.", 400);
    }

    // Generate a single base UUID for all images of this vehicle
    const vehicleImageBaseUrl = crypto.randomBytes(16).toString("hex");

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
      // For vehicles, we'll just upload the original image without creating variants
      const fileExtension = masterFile.name.split(".").pop() || "jpg";
      const objectName = `vehicles/${vehicleImageBaseUrl}-${i}.${fileExtension}`;

      const buffer = Buffer.from(await masterFile.arrayBuffer());
      await uploadFile(
        objectName,
        buffer,
        masterFile.type,
        {},
        LONG_CACHE_CONTROL
      );
    }

    // If new images were uploaded successfully and an old base URL was provided, delete the old image set
    if (oldImageBaseUrl) {
      try {
        console.log(`Deleting old image set for base URL: ${oldImageBaseUrl}`);
        const objectsToDelete = await listFiles(`vehicles/${oldImageBaseUrl}`);
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

    // Return the URLs of the uploaded images
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        const fileExtension = file.name.split(".").pop() || "jpg";
        const objectName = `vehicles/${vehicleImageBaseUrl}-${i}.${fileExtension}`;
        uploadedUrls.push(getPublicUrl(objectName));
      }
    }

    return createSuccessResponse({
      success: true,
      imageUrls: uploadedUrls,
      message: `Successfully uploaded ${files.length} image(s).`,
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
