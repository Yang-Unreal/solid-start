import "dotenv/config"; // Ensures .env variables are loaded early
import Redis, { type RedisOptions } from "ioredis";
import fs from "fs";
import { URL } from "url";
import net from "net";
import tls from "tls"; // Import Node.js tls module for ConnectionOptions type

// Define a global variable for the Redis client singleton
declare global {
  // eslint-disable-next-line no-var
  var redisClient: Redis | undefined;
}

const getRedisClient = (): Redis => {
  if (global.redisClient) {
    return global.redisClient;
  }

  const dragonflyUriFromEnv = process.env.DRAGONFLY_URI;
  if (!dragonflyUriFromEnv) {
    const errorMessage =
      "CRITICAL: DRAGONFLY_URI environment variable is not set.";
    console.error(`[Redis Init] ${errorMessage}`);
    throw new Error(errorMessage);
  }
  console.log(`[Redis Init] Effective DRAGONFLY_URI: ${dragonflyUriFromEnv}`);

  const redisClientOptions: RedisOptions = {
    maxRetriesPerRequest: 3,
  };

  if (dragonflyUriFromEnv.startsWith("rediss://")) {
    const tlsOptions: tls.ConnectionOptions = {
      // Use Node.js tls.ConnectionOptions type
      rejectUnauthorized: true,
    };

    const caCertPath = process.env.DRAGONFLY_CA_CERT_PATH;
    const clientCertPath = process.env.DRAGONFLY_CLIENT_CERT_PATH;
    const clientKeyPath = process.env.DRAGONFLY_CLIENT_KEY_PATH;

    let tlsSetupSuccessful = true;

    if (caCertPath) {
      try {
        tlsOptions.ca = [fs.readFileSync(caCertPath)];
        console.log(`[Redis Init] CA certificate loaded from: ${caCertPath}`);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(
          `[Redis Init] CRITICAL: Failed to load CA certificate from '${caCertPath}'. Error: ${error.message}`
        );
        tlsSetupSuccessful = false;
      }
    } else {
      // If no CA path is provided, TLS will try to use system CAs.
      // For custom CAs like Coolify's, this usually means DRAGONFLY_CA_CERT_PATH is required.
      console.warn(
        "[Redis Init] DRAGONFLY_CA_CERT_PATH not set. Server certificate will be verified against system CAs (if rejectUnauthorized is true). This might fail with custom CAs."
      );
    }

    // Handle mTLS (client certificate and key) only if both paths are provided
    if (clientCertPath && clientKeyPath) {
      try {
        tlsOptions.cert = fs.readFileSync(clientCertPath);
        tlsOptions.key = fs.readFileSync(clientKeyPath);
        console.log(
          `[Redis Init] Client certificate and key loaded for mTLS from: Cert='${clientCertPath}', Key='${clientKeyPath}'`
        );
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(
          `[Redis Init] CRITICAL: Failed to load client certificate or key for mTLS. CertPath='${clientCertPath}', KeyPath='${clientKeyPath}'. Error: ${error.message}`
        );
        tlsSetupSuccessful = false;
      }
    } else if (clientCertPath || clientKeyPath) {
      // Only one of client cert/key path is provided, which is an invalid mTLS setup
      console.warn(
        "[Redis Init] Either DRAGONFLY_CLIENT_CERT_PATH or DRAGONFLY_CLIENT_KEY_PATH is missing for mTLS. Both are required if one is set. Proceeding without mTLS client authentication."
      );
    } else {
      console.log(
        "[Redis Init] Client certificate and key paths not provided. Proceeding without mTLS client authentication."
      );
    }

    if (!tlsSetupSuccessful) {
      throw new Error(
        "Failed to load one or more required TLS certificates for DragonflyDB. Check logs for details."
      );
    }

    const currentHostForConnection = new URL(dragonflyUriFromEnv).hostname;
    if (!net.isIP(currentHostForConnection)) {
      tlsOptions.servername = currentHostForConnection;
    }

    redisClientOptions.tls = tlsOptions;
    console.log("[Redis Init] TLS options prepared.");
  } else {
    console.log(
      "[Redis Init] Connecting to DragonflyDB without SSL (URI does not start with rediss://)."
    );
  }

  const client = new Redis(dragonflyUriFromEnv, redisClientOptions);

  client.on("connect", () =>
    console.log("[Redis] Successfully connected to DragonflyDB!")
  );
  client.on("ready", () =>
    console.log("[Redis] Client is ready to process commands.")
  );
  client.on("error", (err) => console.error("[Redis] Connection Error:", err));
  client.on("reconnecting", () =>
    console.log("[Redis] Reconnecting to DragonflyDB...")
  );
  client.on("close", () =>
    console.log("[Redis] Connection to DragonflyDB closed.")
  );
  client.on("end", () =>
    console.log("[Redis] Connection to DragonflyDB ended.")
  );

  global.redisClient = client;
  return client;
};

export const kv = getRedisClient();
