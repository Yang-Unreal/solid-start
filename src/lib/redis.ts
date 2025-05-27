import Redis from "ioredis";
import fs from "fs"; // Import Node.js file system module

declare global {
  var redisClient: Redis | undefined;
}

const getRedisClient = (): Redis => {
  if (global.redisClient) {
    return global.redisClient;
  }

  const dragonflyUri = process.env.DRAGONFLY_URI;

  if (!dragonflyUri) {
    const errorMessage =
      "CRITICAL: DRAGONFLY_URI environment variable is not set. DragonflyDB client cannot be initialized.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  console.log(
    "Attempting to create new Redis client connection for DragonflyDB..."
  );

  let tlsOptions = {};
  const caCertPath = "/etc/ssl/certs/coolify-ca.crt"; // Define the path to your mounted CA cert

  // Check if the URI is for SSL and if the CA cert file exists
  if (dragonflyUri.startsWith("rediss://")) {
    try {
      const caCert = fs.readFileSync(caCertPath);
      tlsOptions = {
        tls: {
          ca: [caCert],
          // Important: If you continue to face hostname issues despite providing the correct internal URL,
          // and you've verified the cert doesn't contain the specific internal hostname,
          // you *might* need to override checkServerIdentity for self-signed CAs.
          // Use with extreme caution and only if you fully understand the security implications.
          // For example:
          // checkServerIdentity: (host, cert) => true,
        },
      };
      console.log(`Loaded CA certificate from ${caCertPath}`);
    } catch (error) {
      console.warn(
        `WARNING: Could not load CA certificate from ${caCertPath}. Connection might fail without it.`,
        error
      );
      // Decide if you want to throw an error here, or allow the connection to proceed without CA validation (not recommended for production)
    }
  }

  const client = new Redis(dragonflyUri, {
    maxRetriesPerRequest: null,
    // enableOfflineQueue: false, // Consider if you want commands to fail fast if not connected initially
    ...tlsOptions, // Spread the TLS options here
  });

  client.on("connect", () =>
    console.log("Successfully connected to DragonflyDB!")
  );
  client.on("ready", () =>
    console.log("DragonflyDB client is ready to process commands.")
  );
  client.on("error", (err) =>
    console.error("DragonflyDB Connection Error:", err)
  );
  client.on("reconnecting", () =>
    console.log("Reconnecting to DragonflyDB...")
  );
  client.on("close", () => console.log("Connection to DragonflyDB closed."));
  client.on("end", () =>
    console.log(
      "Connection to DragonflyDB ended. Client will not try to reconnect."
    )
  );

  global.redisClient = client;
  return client;
};

export const kv = getRedisClient();
