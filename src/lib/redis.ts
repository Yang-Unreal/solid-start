import "dotenv/config";
import Redis, { type RedisOptions } from "ioredis";
import fs from "fs";
import { URL } from "url";
import net from "net";
import { type ConnectionOptions as TlsConnectionOptions } from "tls";

declare global {
  var redisClient: Redis | undefined;
}

const getRedisClient = (): Redis => {
  if (global.redisClient) {
    return global.redisClient;
  }

  const dragonflyUriFromEnv = process.env.DRAGONFLY_URI;
  if (!dragonflyUriFromEnv) {
    throw new Error("CRITICAL: DRAGONFLY_URI environment variable is not set.");
  }

  const redisClientOptions: RedisOptions = {
    maxRetriesPerRequest: 3,
  };

  if (dragonflyUriFromEnv.startsWith("rediss://")) {
    const tlsOptions: TlsConnectionOptions = {
      rejectUnauthorized: true,
    };

    const caCertPath = process.env.DRAGONFLY_CA_CERT_PATH;
    const clientCertPath = process.env.DRAGONFLY_CLIENT_CERT_PATH;
    const clientKeyPath = process.env.DRAGONFLY_CLIENT_KEY_PATH;

    let criticalCertLoadFailed = false;

    if (caCertPath) {
      try {
        tlsOptions.ca = [fs.readFileSync(caCertPath)];
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(
          `[Redis Init] CRITICAL_ERROR: Failed to load CA certificate from '${caCertPath}'. Details: ${error.message}`
        );
        criticalCertLoadFailed = true;
      }
    }

    if (clientCertPath && clientKeyPath) {
      try {
        tlsOptions.cert = fs.readFileSync(clientCertPath);
        tlsOptions.key = fs.readFileSync(clientKeyPath);
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(
          `[Redis Init] CRITICAL_ERROR: Failed to load client certificate or key for mTLS. CertPath='${clientCertPath}', KeyPath='${clientKeyPath}'. Details: ${error.message}`
        );
        criticalCertLoadFailed = true;
      }
    } else if (clientCertPath || clientKeyPath) {
      console.warn(
        "[Redis Init] CONFIG_WARNING: Either DRAGONFLY_CLIENT_CERT_PATH or DRAGONFLY_CLIENT_KEY_PATH is missing for mTLS. Proceeding without mTLS client authentication."
      );
    }

    if (criticalCertLoadFailed) {
      throw new Error(
        "Failed to load one or more required TLS certificates for DragonflyDB. Client startup aborted."
      );
    }

    const currentHostForConnection = new URL(dragonflyUriFromEnv).hostname;
    if (!net.isIP(currentHostForConnection)) {
      tlsOptions.servername = currentHostForConnection;
    }
    redisClientOptions.tls = tlsOptions;
  }

  const client = new Redis(dragonflyUriFromEnv, redisClientOptions);

  client.on("error", (err) => {
    console.error("[Redis] Runtime Connection Error:", err.message);
  });

  global.redisClient = client;
  return client;
};

export const kv = getRedisClient();
