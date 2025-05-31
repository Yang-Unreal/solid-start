// import "dotenv/config";
// import { drizzle } from "drizzle-orm/node-postgres";
// import { Pool } from "pg";
// import * as schema from "./schema";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL environment variable is not set.");
// }

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// const db = drizzle(pool, { schema });

// export default db;
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";
import fs from "fs";
import { URL } from "url";
import net from "net"; // Import the Node.js 'net' module to check for IP addresses

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const databaseUrlString = process.env.DATABASE_URL;
const dbUrl = new URL(databaseUrlString);
const currentHost = dbUrl.hostname; // This will be the IP or hostname from DATABASE_URL

const poolConfig: PoolConfig = {
  user: dbUrl.username,
  password: dbUrl.password,
  host: currentHost, // Use the host from DATABASE_URL for the connection
  port: parseInt(dbUrl.port, 10),
  database: dbUrl.pathname.slice(1),
  ssl: {
    // Initialize SSL object
    rejectUnauthorized: true,
  },
};

// Conditionally set servername ONLY if the host is not an IP address
if (!net.isIP(currentHost)) {
  // It's a hostname, so set servername (RFC 6066 compliant)
  if (typeof poolConfig.ssl === "object" && poolConfig.ssl !== null) {
    poolConfig.ssl.servername = currentHost;
  }
} else {
  // It's an IP address. Do NOT set servername to avoid the deprecation warning.
  // Node.js will validate the certificate against the host IP by default.
  console.log(
    `[DB_SSL_INFO] Host '${currentHost}' is an IP address. Not setting ssl.servername to avoid RFC 6066 warning.`
  );
}

const sslRootCertPath = dbUrl.searchParams.get("sslrootcert");
const sslMode = dbUrl.searchParams.get("sslmode");

if (sslMode === "verify-full" && sslRootCertPath) {
  try {
    // Ensure poolConfig.ssl is an object before assigning 'ca'
    if (typeof poolConfig.ssl !== "object" || poolConfig.ssl === null) {
      poolConfig.ssl = { rejectUnauthorized: true }; // Base SSL config
      // Re-apply servername logic if ssl was initially null/false and currentHost is not an IP
      if (!net.isIP(currentHost)) {
        poolConfig.ssl.servername = currentHost;
      }
    }
    (poolConfig.ssl as any).ca = fs.readFileSync(sslRootCertPath).toString();
  } catch (error) {
    console.error(
      `[DB_SSL_ERROR] Failed to read SSL root certificate from ${sslRootCertPath}:`,
      error
    );
    throw new Error(
      `Could not load CA certificate: ${sslRootCertPath}. Ensure file exists and is accessible.`
    );
  }
} else if (sslMode === "disable") {
  poolConfig.ssl = false;
} else if (sslMode && ["require", "prefer", "allow"].includes(sslMode)) {
  if (typeof poolConfig.ssl !== "object" || poolConfig.ssl === null) {
    poolConfig.ssl = { rejectUnauthorized: sslMode === "require" };
    if (!net.isIP(currentHost)) {
      // Also apply servername if it's a hostname
      poolConfig.ssl.servername = currentHost;
    }
  }
}

console.log("--- DATABASE CONNECTION ATTEMPT DEBUG (IP Handling) ---");
console.log("Raw DATABASE_URL from env:", databaseUrlString);
console.log("Resolved Host for connection:", currentHost);
console.log("Is host an IP address?", net.isIP(currentHost) !== 0); // net.isIP returns 0 if not IP, 4 or 6 if IP.
console.log(
  "Explicit Pool Config being passed to new Pool():",
  JSON.stringify(
    poolConfig,
    (key, value) => {
      if (key === "ca" && typeof value === "string" && value.length > 100) {
        return value.substring(0, 70) + "... (CA cert content truncated)";
      }
      return value;
    },
    2
  )
);

const pool = new Pool(poolConfig);

const db = drizzle(pool, { schema });

export default db;
