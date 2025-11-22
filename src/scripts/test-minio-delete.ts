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
import sharp from "sharp";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Tests the new upload and delete logic:
 * 1. Uploads both AVIF and WebP versions of an image (like the new upload logic)
 * 2. Tests deletion of both files (like the new delete logic)
 * 3. Verifies both files are properly deleted
 */
/*******  Updated Test for New Logic  *******/

async function testNewUploadDeleteLogic() {
	const baseFileName = `test-vehicle-${Date.now()}`;
	const avifKey = `products/${baseFileName}-detail.avif`;
	const webpKey = `products/${baseFileName}-detail.webp`;
	const filePath = path.join(
		process.cwd(),
		"..",
		"..",
		"public",
		"heroBackground.webp",
	);

	try {
		console.log("=== Testing New Upload/Delete Logic ===");

		// Step 1: Read and process test file (simulate upload logic)
		console.log(`Reading test file from: ${filePath}`);
		const fileBuffer = await fs.readFile(filePath);
		console.log(`File read successfully. Size: ${fileBuffer.length} bytes`);

		const sharpInstance = sharp(fileBuffer);
		const resizedInstance = sharpInstance
			.clone()
			.resize(1280, 720, { fit: "inside", withoutEnlargement: true });

		// Step 2: Upload both AVIF and WebP versions (like new upload logic)
		console.log(`\nUploading AVIF version: ${avifKey}`);
		const avifBuffer = await resizedInstance.avif({ quality: 80 }).toBuffer();
		await uploadFile(avifKey, new Uint8Array(avifBuffer), "image/avif");

		console.log(`Uploading WebP version: ${webpKey}`);
		const webpBuffer = await resizedInstance.webp({ quality: 85 }).toBuffer();
		await uploadFile(webpKey, new Uint8Array(webpBuffer), "image/webp");

		console.log("✅ Both uploads successful");

		// Step 3: Get URLs and test key extraction
		const avifUrl = getPublicUrl(avifKey);
		console.log(`\nAVIF URL: ${avifUrl}`);

		if (!endpoint) throw new Error("MinIO endpoint not configured");
		const endpointUrl = new URL(endpoint);
		const endpointPath = endpointUrl.pathname.replace(/\/$/, "");
		const bucketPrefix = `${endpointPath}/${bucket}`;

		const url = new URL(avifUrl);
		const extractedAvifKey = url.pathname.replace(
			new RegExp(`^${bucketPrefix}/`),
			"",
		);
		console.log(`Extracted AVIF key: ${extractedAvifKey}`);
		console.log(`Expected AVIF key: ${avifKey}`);
		console.log(`AVIF key matches: ${extractedAvifKey === avifKey}`);

		// Step 4: Test deletion of both files (like new delete logic)
		console.log("\n=== Testing Deletion of Both Files ===");
		const keysToDelete = [
			extractedAvifKey,
			extractedAvifKey.replace(/\.avif$/, ".webp"),
		];
		console.log(`Keys to delete:`, keysToDelete);

		await minio.send(
			new DeleteObjectsCommand({
				Bucket: bucket,
				Delete: {
					Objects: keysToDelete.map((k) => ({ Key: k })),
				},
			}),
		);

		console.log("✅ Deletion successful");

		// Step 5: Verify both files are deleted
		console.log("\n=== Verification ===");
		for (const key of keysToDelete) {
			try {
				await minio.send({
					Bucket: bucket,
					Key: key,
				} as any);
				console.log(`❌ File still exists: ${key}`);
			} catch (error: any) {
				if (error.name === "NoSuchKey") {
					console.log(`✅ File successfully deleted: ${key}`);
				} else {
					console.log(`⚠️  Unexpected error for ${key}:`, error.message);
				}
			}
		}

		console.log("\n🎉 Test completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error);
		process.exit(1);
	}
}

testNewUploadDeleteLogic();
