import { createAuthClient } from "better-auth/solid";
import { adminClient } from "better-auth/client/plugins";

const baseURL = process.env.VITE_BASE_URL;
export const authClient = createAuthClient({
	baseURL: baseURL,
	plugins: [adminClient()],
});
