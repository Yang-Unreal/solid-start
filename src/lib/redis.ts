import Redis from "ioredis";

// We use a global variable to ensure the connection is reused across server function calls
// in a single server instance.
declare global {
  // eslint-disable-next-line no-var
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
    // This error will likely prevent server functions relying on 'kv' from working.
    // Depending on your app's needs, you might throw here to halt startup if DB is essential.
    throw new Error(errorMessage);
  }

  console.log(
    "Attempting to create new Redis client connection for DragonflyDB..."
  );
  const client = new Redis(dragonflyUri, {
    maxRetriesPerRequest: null, // Recommended for modern serverless environments / robust connections
    // enableOfflineQueue: false, // Consider if you want commands to fail fast if not connected initially
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

// Export the client instance. 'kv' is a common name for key-value stores.
export const kv = getRedisClient();
