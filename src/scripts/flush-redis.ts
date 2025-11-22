import { kv } from "../lib/redis";

async function flushRedisCache() {
	try {
		await kv.flushdb();
		console.log("Redis cache flushed successfully for development.");
	} catch (error) {
		console.error("Failed to flush Redis cache:", error);
	} finally {
		await kv.quit();
	}
}

flushRedisCache();
