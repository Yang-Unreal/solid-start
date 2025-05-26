import Redis from "ioredis";

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
  const client = new Redis(dragonflyUri, {
    maxRetriesPerRequest: null,
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

export const kv = getRedisClient();
