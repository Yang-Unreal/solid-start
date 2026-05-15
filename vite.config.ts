import { solidStart } from "@solidjs/start/config";
import { nitroV2Plugin } from "@solidjs/vite-plugin-nitro-2";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(() => {
	return {
		server: {
			port: 3000,
			host: true,
		},
		preview: {
			port: 3000,
			host: true,
		},
		plugins: [solidStart(), nitroV2Plugin(), tailwindcss()],
	};
});
