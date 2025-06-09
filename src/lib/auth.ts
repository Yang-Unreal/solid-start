import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import db from "~/db";
import { kv } from "~/lib/redis"; // Import your configured DragonflyDB client

export const auth = betterAuth({
  // This remains the same. It's for storing user accounts, passwords, etc.
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  // --- START: ADD THIS SECTION ---
  // This tells better-auth to use Redis for sessions, which is much faster.
  secondaryStorage: {
    get: async (key) => {
      const value = await kv.get(key);
      // Ensure the return type is string | null
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        // Use 'EX' for seconds in ioredis
        await kv.set(key, value, "EX", ttl);
      } else {
        await kv.set(key, value);
      }
    },
    delete: async (key) => {
      await kv.del(key);
    },
  },
  // --- END: ADD THIS SECTION ---

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [adminPlugin()],
});
