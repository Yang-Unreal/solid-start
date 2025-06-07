import { createHandler, StartServer } from "@solidjs/start/server";
import { themeInitializerScript } from "./scripts/theme-initializer";

export default createHandler((event) => {
  // Set security headers
  event.response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://minio.limingcn.com; connect-src 'self' https://minio.limingcn.com;"
  );
  event.response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  event.response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  event.response.headers.set("X-Frame-Options", "DENY");

  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <title>SolidStart App</title>
            <meta name="description" content="A SolidStart web application." />
            <link rel="icon" href="/favicon.ico" />
            {assets}
            <script innerHTML={themeInitializerScript} />
          </head>
          <body class="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
