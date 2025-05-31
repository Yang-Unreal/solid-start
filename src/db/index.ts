import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";
import fs from "fs";
import { URL } from "url";
import net from "net";
import tls, {
  type PeerCertificate,
  type ConnectionOptions as TlsConnectionOptions,
} from "tls";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const databaseUrlString = process.env.DATABASE_URL;
const dbUrl = new URL(databaseUrlString);
const currentHostForConnection = dbUrl.hostname;
const sslMode = dbUrl.searchParams.get("sslmode");

const poolConfig: PoolConfig = {
  user: dbUrl.username,
  password: dbUrl.password,
  host: currentHostForConnection,
  port: parseInt(dbUrl.port, 10),
  database: dbUrl.pathname.slice(1),
};

if (sslMode === "disable") {
  poolConfig.ssl = false;
} else {
  const sslOptions: TlsConnectionOptions = {
    rejectUnauthorized: true,
    checkServerIdentity: (
      hostnameBeingChecked: string,
      cert: PeerCertificate
    ): Error | undefined => {
      if (hostnameBeingChecked.toLowerCase().startsWith("localhost")) {
        return tls.checkServerIdentity(currentHostForConnection, cert);
      }
      return tls.checkServerIdentity(hostnameBeingChecked, cert);
    },
  };

  if (!net.isIP(currentHostForConnection)) {
    sslOptions.servername = currentHostForConnection;
  }

  if (sslMode === "verify-full") {
    const sslRootCertPath = dbUrl.searchParams.get("sslrootcert");

    if (!sslRootCertPath) {
      throw new Error(
        "sslmode=verify-full requires an sslrootcert parameter in DATABASE_URL for custom CA verification."
      );
    }
    try {
      sslOptions.ca = fs.readFileSync(sslRootCertPath).toString();
    } catch (error) {
      console.error(
        `Critical: Failed to load CA certificate from ${sslRootCertPath}:`,
        error
      );
      throw new Error(
        `Could not load CA certificate: ${sslRootCertPath}. Application startup aborted.`
      );
    }
  }
  poolConfig.ssl = sslOptions;
}

const pool = new Pool(poolConfig);
const db = drizzle(pool, { schema });

export default db;
