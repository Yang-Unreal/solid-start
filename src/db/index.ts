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
import net from "net";
import tls from "tls"; // Import the Node.js 'tls' module for PeerCertificate and default check

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const databaseUrlString = process.env.DATABASE_URL;
const dbUrl = new URL(databaseUrlString);
const currentHostForConnection = dbUrl.hostname; // This is the host we are connecting to (IP or DNS name)

const poolConfig: PoolConfig = {
  user: dbUrl.username,
  password: dbUrl.password,
  host: currentHostForConnection,
  port: parseInt(dbUrl.port, 10),
  database: dbUrl.pathname.slice(1),
  ssl: {
    rejectUnauthorized: true,
    checkServerIdentity: (hostnameBeingChecked, cert: tls.PeerCertificate) => {
      console.log(
        `[DB_SSL_checkServerIdentity] Verifying hostname: '${hostnameBeingChecked}'`
      );
      console.log(
        `[DB_SSL_checkServerIdentity] Cert SAN: '${cert.subjectaltname}', Cert CN: '${cert.subject.CN}'`
      );
      console.log(
        `[DB_SSL_checkServerIdentity] Actual connection host: '${currentHostForConnection}'`
      );

      // If the TLS stack is trying to verify 'localhost'
      if (hostnameBeingChecked.toLowerCase().startsWith("localhost")) {
        console.warn(
          `[DB_SSL_checkServerIdentity] Hostname being checked is '${hostnameBeingChecked}'. Overriding to check against actual connection host ('${currentHostForConnection}').`
        );

        // Perform the check against the actual host we connected to
        const errorForActualHost = tls.checkServerIdentity(
          currentHostForConnection,
          cert
        );
        if (!errorForActualHost) {
          console.log(
            `[DB_SSL_checkServerIdentity] SUCCESS (override): Certificate is valid for actual connection host '${currentHostForConnection}'.`
          );
          return undefined; // No error, identity is valid
        }
        // If the override check itself fails, return that specific error
        console.error(
          `[DB_SSL_checkServerIdentity] OVERRIDE FAILED: Certificate NOT valid for actual connection host '${currentHostForConnection}'. Error: ${errorForActualHost.message}`
        );
        return errorForActualHost;
      }

      // If not 'localhost', perform the default check provided by Node.js
      const defaultError = tls.checkServerIdentity(hostnameBeingChecked, cert);
      if (defaultError) {
        console.error(
          `[DB_SSL_checkServerIdentity] Default check failed for '${hostnameBeingChecked}': ${defaultError.message}`
        );
      } else {
        console.log(
          `[DB_SSL_checkServerIdentity] Default check succeeded for '${hostnameBeingChecked}'.`
        );
      }
      return defaultError;
    },
  },
};

// Conditionally set servername ONLY if the host is a hostname (not an IP)
// This is primarily to avoid the RFC 6066 deprecation warning.
// The checkServerIdentity function will handle the actual validation logic.
if (!net.isIP(currentHostForConnection)) {
  if (typeof poolConfig.ssl === "object" && poolConfig.ssl !== null) {
    poolConfig.ssl.servername = currentHostForConnection;
  }
} else {
  console.log(
    `[DB_SSL_INFO] Host '${currentHostForConnection}' is an IP address. Not setting ssl.servername.`
  );
}

const sslRootCertPath = dbUrl.searchParams.get("sslrootcert");
const sslMode = dbUrl.searchParams.get("sslmode");

if (sslMode === "verify-full" && sslRootCertPath) {
  try {
    if (typeof poolConfig.ssl === "object" && poolConfig.ssl !== null) {
      (poolConfig.ssl as any).ca = fs.readFileSync(sslRootCertPath).toString();
    } else {
      // Should not happen if ssl object is initialized above
      console.error(
        "[DB_SSL_ERROR] SSL config object was unexpectedly null when trying to set CA."
      );
    }
  } catch (error) {
    console.error(
      `[DB_SSL_ERROR] Failed to read SSL root certificate from ${sslRootCertPath}:`,
      error
    );
    throw new Error(`Could not load CA certificate: ${sslRootCertPath}.`);
  }
} else if (sslMode === "disable") {
  poolConfig.ssl = false;
}
// Other sslModes like 'require' will use the SSL object with checkServerIdentity

console.log(
  "--- DATABASE CONNECTION ATTEMPT DEBUG (Custom checkServerIdentity) ---"
);
console.log("Raw DATABASE_URL from env:", databaseUrlString);
console.log(
  "Explicit Pool Config being passed to new Pool():",
  JSON.stringify(
    poolConfig,
    (key, value) => {
      if (key === "ca" && typeof value === "string" && value.length > 100) {
        return value.substring(0, 70) + "... (CA cert content truncated)";
      }
      if (key === "checkServerIdentity")
        return "[Function: checkServerIdentity]"; // Don't log the function body
      return value;
    },
    2
  )
);

const pool = new Pool(poolConfig);
const db = drizzle(pool, { schema });
export default db;
