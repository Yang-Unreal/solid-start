// @refresh reload

import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler((event) => {
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

            <link
              rel="icon"
              href="/icon.svg"
              media="(prefers-color-scheme: light)"
            />
            <link
              rel="icon"
              href="/icon-dark.svg"
              media="(prefers-color-scheme: dark)"
            />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossorigin=""
            />
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Inconsolata&display=swap"
            />
            <link
              rel="preload"
              href="https://minio.limingcn.com/solid-start/fonts/PermanentMarker-Regular.woff2"
              as="font"
              type="font/woff2"
              crossorigin=""
            />
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap"
            />
            <link
              rel="preload"
              href="https://minio.limingcn.com/solid-start/fonts/FormulaCondensed-Bold.woff2"
              as="font"
              type="font/woff2"
              crossorigin=""
            />
            <link
              rel="preload"
              href="https://minio.limingcn.com/solid-start/fonts/FormulaCondensed-Light.woff2"
              as="font"
              type="font/woff2"
              crossorigin=""
            />
            {assets}
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
