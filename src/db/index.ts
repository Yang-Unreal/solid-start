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
import tls, { type PeerCertificate } from "tls";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const databaseUrlString = process.env.DATABASE_URL;
const dbUrl = new URL(databaseUrlString);
const currentHostForConnection = dbUrl.hostname;

const poolConfig: PoolConfig = {
  user: dbUrl.username,
  password: dbUrl.password,
  host: currentHostForConnection,
  port: parseInt(dbUrl.port, 10),
  database: dbUrl.pathname.slice(1),
  ssl: {
    rejectUnauthorized: true,
    checkServerIdentity: (
      hostnameBeingChecked: string,
      cert: PeerCertificate
    ): Error | undefined => {
      if (hostnameBeingChecked.toLowerCase().startsWith("localhost")) {
        const errorForActualHost = tls.checkServerIdentity(
          currentHostForConnection,
          cert
        );
        return errorForActualHost;
      }
      return tls.checkServerIdentity(hostnameBeingChecked, cert);
    },
  },
};

if (!net.isIP(currentHostForConnection)) {
  if (typeof poolConfig.ssl === "object" && poolConfig.ssl !== null) {
    poolConfig.ssl.servername = currentHostForConnection;
  }
}

const sslRootCertPath = dbUrl.searchParams.get("sslrootcert");
const sslMode = dbUrl.searchParams.get("sslmode");

if (sslMode === "verify-full" && sslRootCertPath) {
  try {
    if (typeof poolConfig.ssl === "object" && poolConfig.ssl !== null) {
      poolConfig.ssl.ca = fs.readFileSync(sslRootCertPath).toString();
    }
  } catch (error) {
    console.error(
      `Failed to load CA certificate from ${sslRootCertPath}: ${error}`
    );
    throw new Error(`Could not load CA certificate: ${sslRootCertPath}.`);
  }
} else if (sslMode === "disable") {
  poolConfig.ssl = false;
}

const pool = new Pool(poolConfig);
const db = drizzle(pool, { schema });

export default db;
