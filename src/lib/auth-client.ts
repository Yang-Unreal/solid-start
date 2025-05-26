import { createAuthClient } from "better-auth/solid";

const baseURL = process.env.BASE_URL;
export const authClient = createAuthClient({
  baseURL: baseURL,
});
