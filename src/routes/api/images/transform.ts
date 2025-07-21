import type { APIEvent } from "@solidjs/start/server";
import sharp from "sharp";
import { getFileStream, bucket, endpoint } from "~/lib/minio";
import { PassThrough, Readable } from "stream";

// Helper to determine content type
const getContentType = (format: string) => {
  switch (format) {
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
};

export async function GET(event: APIEvent) {
  const url = new URL(event.request.url);
  const imageUrl = url.searchParams.get("url");
  const width = parseInt(url.searchParams.get("w") || "", 10);
  const height = parseInt(url.searchParams.get("h") || "", 10);
  const format = url.searchParams.get("f") || "webp"; // Default to webp

  if (!imageUrl) {
    console.error("Transform API Error: Image URL is missing.");
    return new Response("Image URL is required.", { status: 400 });
  }

  console.log(
    `Transforming image: ${imageUrl} to ${format} (${width}x${height})`
  );

  try {
    // Extract object key from the full MinIO URL using known endpoint and bucket
    let objectKey: string | null = null;
    const baseUrlPrefix = `${endpoint}/${bucket}/`;
    if (imageUrl.startsWith(baseUrlPrefix)) {
      objectKey = imageUrl.substring(baseUrlPrefix.length);
    }

    if (!objectKey) {
      console.error(
        `Transform API Error: Invalid image URL format or not from configured MinIO bucket: ${imageUrl}`
      );
      return new Response(
        "Invalid image URL or not from configured MinIO bucket.",
        { status: 400 }
      );
    }

    console.log(`Fetching object key: ${objectKey} from bucket: ${bucket}`);
    // Fetch the image stream from MinIO (using the globally configured bucket)
    const imageNodeStream = await getFileStream(objectKey);

    if (!imageNodeStream) {
      console.error(
        `Transform API Error: Image not found in MinIO for object key: ${objectKey}`
      );
      return new Response("Image not found in MinIO.", { status: 404 });
    }

    console.log("Node.js stream obtained from MinIO.");

    let transformer = sharp();

    // Add error handling to the sharp pipeline
    transformer.on("error", (err) => {
      console.error("Sharp transformation error:", err);
      // It's tricky to send a 500 response here if headers have already been sent.
      // The outer catch block will handle initial errors.
    });

    // Apply resizing if width or height are provided
    if (!isNaN(width) && !isNaN(height)) {
      transformer = transformer.resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      });
      console.log(`Resizing to ${width}x${height}`);
    } else if (!isNaN(width)) {
      transformer = transformer.resize(width, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
      console.log(`Resizing to width ${width}`);
    } else if (!isNaN(height)) {
      transformer = transformer.resize(undefined, height, {
        fit: "inside",
        withoutEnlargement: true,
      });
      console.log(`Resizing to height ${height}`);
    }

    // Apply format conversion
    switch (format) {
      case "jpeg":
        transformer = transformer.jpeg({ quality: 80 });
        console.log("Converting to JPEG");
        break;
      case "webp":
        transformer = transformer.webp({ quality: 80 });
        console.log("Converting to WebP");
        break;
      case "avif":
        transformer = transformer.avif({ quality: 70 });
        console.log("Converting to AVIF");
        break;
      case "png":
        transformer = transformer.png();
        console.log("Converting to PNG");
        break;
      case "gif":
        transformer = transformer.gif();
        console.log("Converting to GIF");
        break;
      default:
        transformer = transformer.webp({ quality: 80 });
        console.log("Unknown format, defaulting to WebP");
        break;
    }

    const passthrough = new PassThrough();
    imageNodeStream.pipe(transformer).pipe(passthrough);
    console.log("Piping streams complete.");

    return new Response(passthrough as any, {
      headers: {
        "Content-Type": getContentType(format),
        "Cache-Control": "public, max-age=31536000, immutable", // Cache transformed images for a long time
      },
    });
  } catch (error: any) {
    console.error("Image transformation error:", error);
    return new Response(`Internal server error: ${error.message}`, {
      status: 500,
    });
  }
}
