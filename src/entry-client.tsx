// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

if (history.scrollRestoration) {
	history.scrollRestoration = "manual";
}

mount(() => {
	return <StartClient />;
}, document.getElementById("app")!);
