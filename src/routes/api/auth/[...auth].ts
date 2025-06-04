// src/routes/api/auth/[...solidauth].ts
import { auth } from "~/lib/auth"; // path to your server auth file
import { toSolidStartHandler } from "better-auth/solid-start";

export const { GET, POST } = toSolidStartHandler(auth);
