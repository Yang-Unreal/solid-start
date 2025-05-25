// src/routes/api/upload.ts
import type { APIEvent } from "@solidjs/start/server";
import { uploadFile, getPublicUrl } from "../../lib/minio";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function createErrorResponse(message: string, status: number = 500) {
  console.error("API Error:", message);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function POST(event: APIEvent) {
  try {
    const contentType = event.request.headers.get("content-type");

    if (!contentType || !contentType.includes("multipart/form-data")) {
      return createErrorResponse(
        "Invalid content type. Expected multipart/form-data",
        400
      );
    }

    let formData: FormData;
    try {
      formData = await event.request.formData();
    } catch (formError) {
      console.error("Failed to parse form data:", formError);
      return createErrorResponse("Failed to parse form data", 400);
    }

    const filesFromForm = formData.getAll("files");
    const files: File[] = filesFromForm.filter(
      (item): item is File => item instanceof File && item.size > 0
    );

    if (files.length === 0) {
      return createErrorResponse(
        "No valid files provided or files are empty",
        400
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return createErrorResponse(
          `File ${file.name} is too large. Maximum size is ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`,
          400
        );
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return createErrorResponse(
          `File type ${file.type} is not allowed for file ${file.name}`,
          400
        );
      }

      const fileExtension = file.name.split(".").pop() || "txt";
      const uniqueFilename = `${randomUUID()}.${fileExtension}`;
      const objectKey = `uploads/${new Date().getFullYear()}/${
        new Date().getMonth() + 1
      }/${uniqueFilename}`;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        await uploadFile(objectKey, buffer, file.type, {
          "original-name": file.name,
          "upload-date": new Date().toISOString(),
        });

        const fileUrl = getPublicUrl(objectKey);

        uploadedFiles.push({
          name: file.name,
          size: file.size,
          url: fileUrl,
          key: objectKey,
          uploadedAt: new Date().toISOString(),
        });
      } catch (uploadError: any) {
        console.error(`Failed to upload ${file.name}:`, uploadError);
        return createErrorResponse(
          `Failed to upload ${file.name}: ${
            uploadError.message || "Unknown error"
          }`,
          500
        );
      }
    }

    return createSuccessResponse({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    });
  } catch (error: any) {
    console.error("=== Upload API Error ===");
    console.error("Error details:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return createErrorResponse(
      `Internal server error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      500
    );
  }
}

export async function OPTIONS(event: APIEvent) {
  return new Response(null, {
    status: 204, // Standard for OPTIONS preflight success
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
