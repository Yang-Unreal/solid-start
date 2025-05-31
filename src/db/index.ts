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
import { Pool, type PoolConfig } from "pg"; // Import PoolConfig
import * as schema from "./schema";
import fs from "fs";
import { URL } from "url";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const databaseUrlString = process.env.DATABASE_URL;
const dbUrl = new URL(databaseUrlString);

// Explicitly extract all parts from the URL to build PoolConfig
// This gives us more control than relying solely on connectionString for these parts
const poolConfig: PoolConfig = {
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname, // Explicitly set the host for the connection
  port: parseInt(dbUrl.port, 10),
  database: dbUrl.pathname.slice(1), // Remove leading '/' from pathname
  ssl: {
    // Initialize SSL object
    rejectUnauthorized: true, // Default to true for security
    // Critical: Set servername to the hostname from the URL
    // This is what the TLS layer will use to verify the certificate against
    servername: dbUrl.hostname,
  },
};

const sslRootCertPath = dbUrl.searchParams.get("sslrootcert");
const sslMode = dbUrl.searchParams.get("sslmode");

// Only proceed to load CA if sslmode indicates verification and path is provided
if (sslMode === "verify-full" && sslRootCertPath) {
  try {
    // Ensure poolConfig.ssl is an object before assigning 'ca'
    if (typeof poolConfig.ssl !== "object" || poolConfig.ssl === null) {
      poolConfig.ssl = { rejectUnauthorized: true, servername: dbUrl.hostname };
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
  poolConfig.ssl = false; // Explicitly disable SSL
} else if (sslMode && ["require", "prefer", "allow"].includes(sslMode)) {
  // For modes like 'require', 'prefer', 'allow', ensure SSL is enabled.
  // servername is already set. If a custom CA is needed but not verify-full,
  // this might need more specific handling if connection issues arise.
  if (typeof poolConfig.ssl !== "object" || poolConfig.ssl === null) {
    poolConfig.ssl = {
      rejectUnauthorized: sslMode === "require",
      servername: dbUrl.hostname,
    };
  }
}
// If no sslMode is in URL, pg might try PGSSLMODE env var or default to no SSL.
// Our explicit poolConfig.ssl setup should take precedence.

// --- DETAILED LOGGING ---
console.log("--- DATABASE CONNECTION ATTEMPT DEBUG ---");
console.log("Raw DATABASE_URL from env:", databaseUrlString);
console.log(
  "Explicit Pool Config being passed to new Pool():",
  JSON.stringify(
    poolConfig,
    (key, value) => {
      // Avoid printing the full CA cert in logs, just an indicator
      if (key === "ca" && typeof value === "string" && value.length > 100) {
        return value.substring(0, 70) + "... (CA cert content truncated)";
      }
      return value;
    },
    2
  )
);
if (poolConfig.ssl && (poolConfig.ssl as any).ca) {
  console.log("[DB_SSL_INFO] CA certificate appears to be loaded into config.");
} else if (poolConfig.ssl && sslMode === "verify-full") {
  console.warn(
    "[DB_SSL_WARN] SSL mode is verify-full but CA certificate was not loaded into config. Check path and permissions for: " +
      sslRootCertPath
  );
} else if (poolConfig.ssl) {
  console.log(
    "[DB_SSL_INFO] SSL config is present, but CA content not shown (or not verify-full mode with CA path)."
  );
} else {
  console.log(
    "[DB_SSL_INFO] SSL does not appear to be configured in poolConfig."
  );
}
// --- END LOGGING ---

const pool = new Pool(poolConfig); // Use the fully deconstructed and logged config

const db = drizzle(pool, { schema });

export default db;
