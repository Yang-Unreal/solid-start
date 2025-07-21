// src/lib/minio.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type {
  HeadObjectCommandOutput,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const bucketEnv = process.env.S3_BUCKET;
export const endpoint = process.env.S3_ENDPOINT; // Export endpoint
const region = "us-east-1";

console.log("MinIO Configuration (AWS SDK):", {
  accessKeyId: accessKeyId ? `${accessKeyId.substring(0, 4)}...` : "MISSING",
  secretAccessKey: secretAccessKey ? "***SET***" : "MISSING",
  bucket: bucketEnv || "MISSING",
  endpoint: endpoint || "MISSING",
  region: region,
});

if (!accessKeyId || !secretAccessKey || !bucketEnv || !endpoint) {
  console.error(
    "CRITICAL SERVER ERROR: Missing one or more S3 environment variables (S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_ENDPOINT)."
  );
  throw new Error("Missing S3 environment variables for MinIO client.");
}

export const minio = new S3Client({
  endpoint: endpoint,
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  forcePathStyle: true,
});

export const bucket = bucketEnv;

export async function uploadFile(
  key: string,
  data: Uint8Array,
  contentType: string,
  metadata: Record<string, string> = {},
  cacheControl: string = "public, max-age=31536000, immutable" // Default to 1 year immutable cache
) {
  console.log(`Uploading file to key: ${key} in bucket ${bucket}`);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType: contentType,
    Metadata: metadata,
    CacheControl: cacheControl,
  });

  try {
    const response = await minio.send(command);
    console.log(`Successfully uploaded ${key}. ETag: ${response.ETag}`);
    return data.length; // Represents bytes written
  } catch (error) {
    console.error(`Upload failed for key ${key}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`MinIO upload failed: ${errorMessage}`);
  }
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  try {
    console.log(`Deleting file: ${key} from bucket ${bucket}`);
    await minio.send(command);
    console.log(`Successfully deleted: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${key}:`, error);
    throw error;
  }
}

export async function fileExists(key: string): Promise<boolean> {
  const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
  try {
    await minio.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    console.error(`Failed to check file existence for key ${key}:`, error);
    throw error;
  }
}

export interface FileStats {
  etag?: string;
  lastModified?: Date;
  size?: number;
  type?: string;
  metadata?: Record<string, string>;
}

export async function getFileStats(key: string): Promise<FileStats> {
  const command = new HeadObjectCommand({ Bucket: bucket, Key: key });
  try {
    const response: HeadObjectCommandOutput = await minio.send(command);
    return {
      etag: response.ETag,
      lastModified: response.LastModified,
      size: response.ContentLength,
      type: response.ContentType,
      metadata: response.Metadata,
    };
  } catch (error) {
    console.error(`Failed to get file stats for ${key}:`, error);
    throw error;
  }
}

export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600,
  method: "GET" | "PUT" | "DELETE" = "GET"
): Promise<string> {
  let command;
  const params = { Bucket: bucket, Key: key };

  if (method === "GET") {
    command = new GetObjectCommand(params);
  } else if (method === "PUT") {
    command = new PutObjectCommand(params);
  } else if (method === "DELETE") {
    command = new DeleteObjectCommand(params);
  } else {
    throw new Error(`Unsupported method for presigned URL: ${method}`);
  }

  try {
    return await getSignedUrl(minio, command, { expiresIn });
  } catch (error) {
    console.error(`Failed to generate presigned URL for ${key}:`, error);
    throw error;
  }
}

import { Readable } from "stream"; // Import Readable from Node.js stream module

export async function getFileStream(
  objectKey: string,
  bucketName: string = bucket
): Promise<Readable | null> {
  // Change return type to Node.js Readable
  const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
  try {
    const response = await minio.send(command);
    // The Body can be a ReadableStream (Web Streams API) or an AsyncIterable.
    // Convert it to a Node.js Readable stream for Sharp.
    if (response.Body) {
      // Check if it's a Web ReadableStream
      if (typeof (response.Body as any).getReader === "function") {
        return Readable.fromWeb(response.Body as any);
      }
      // Otherwise, assume it's an AsyncIterable and use Readable.from
      return Readable.from(response.Body as AsyncIterable<any>);
    }
    return null;
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      console.warn(`File not found in MinIO: ${objectKey}`);
      return null;
    }
    console.error(`Failed to get file stream for ${objectKey}:`, error);
    throw error;
  }
}

export function getPublicUrl(objectKey: string): string {
  const url = `${endpoint}/${bucket}/${objectKey}`;
  return url;
}

export async function listFiles(
  prefix?: string,
  maxKeys: number = 1000
): Promise<ListObjectsV2CommandOutput> {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });
  try {
    const response = await minio.send(command);
    return response;
  } catch (error) {
    console.error("Failed to list files:", error);
    throw error;
  }
}

export async function testMinIOConnection(): Promise<boolean> {
  try {
    console.log("Testing MinIO connection (AWS SDK)...");
    const testKey = "test-connection-aws-sdk.txt";
    const testData = new TextEncoder().encode("AWS SDK Connection test");

    await uploadFile(testKey, testData, "text/plain");
    const exists = await fileExists(testKey);
    if (!exists) {
      throw new Error("File was not created successfully during test");
    }
    const stats = await getFileStats(testKey);
    if (!stats || stats.size !== testData.length) {
      throw new Error("File stats are incorrect or file not found during test");
    }
    await deleteFile(testKey);
    console.log("✅ MinIO connection successful (AWS SDK)");
    return true;
  } catch (error) {
    console.error("❌ MinIO connection failed (AWS SDK):", error);
    return false;
  }
}
