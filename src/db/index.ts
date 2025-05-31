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
import { Pool } from "pg";
import * as schema from "./schema"; // Assuming schema.ts is in the same directory
import fs from "fs"; // Import the Node.js file system module
import { URL } from "url"; // Import the Node.js URL module

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const databaseUrlString = process.env.DATABASE_URL;
const dbUrl = new URL(databaseUrlString);

// Prepare SSL configuration
const sslConfig: import("pg").PoolConfig["ssl"] = {
  rejectUnauthorized: true, // Important for security: verify the CA
};

const sslRootCertPath = dbUrl.searchParams.get("sslrootcert");

if (dbUrl.searchParams.get("sslmode") === "verify-full" && sslRootCertPath) {
  try {
    // Read the CA certificate content from the file specified in the URL
    sslConfig.ca = fs.readFileSync(sslRootCertPath).toString();
    // Explicitly tell Node's TLS layer what hostname to use for verification.
    // This should match one of the names in the certificate's Subject Alternative Name (SAN).
    // dbUrl.hostname will be '5.78.127.238' from your DATABASE_URL
    sslConfig.servername = dbUrl.hostname;
  } catch (error) {
    console.error(
      `Failed to read SSL root certificate from ${sslRootCertPath}:`,
      error
    );
    throw new Error(
      `Could not load CA certificate specified by sslrootcert: ${sslRootCertPath}. Ensure the file exists and is accessible.`
    );
  }
} else if (
  dbUrl.searchParams.get("sslmode") === "require" ||
  dbUrl.searchParams.get("sslmode") === "prefer"
) {
  // For 'require' or 'prefer' without verify-full, you might not need servername or custom CA
  // but if you are using Coolify's CA, you likely still want to provide it if the connection fails.
  // For now, we only explicitly add CA and servername for verify-full.
  // If you encounter issues with 'require', you might need to adjust.
  console.warn(
    `SSL mode is '${dbUrl.searchParams.get(
      "sslmode"
    )}'. Full certificate verification including hostname might not be performed unless servername is explicitly set.`
  );
}

const pool = new Pool({
  connectionString: databaseUrlString, // pg driver uses this for base settings
  ssl: sslConfig, // Override/provide specific SSL options
});

const db = drizzle(pool, { schema });

export default db;
