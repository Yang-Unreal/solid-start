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

            <link
              rel="preload"
              href="https://minio.limingcn.com/solid-start/fonts/Inconsolata-Regular.woff2"
              as="font"
              type="font/woff2"
              crossorigin=""
            />

            <link
              rel="preload"
              href="https://minio.limingcn.com/solid-start/fonts/FormulaCondensed-Bold.woff2"
              as="font"
              type="font/woff2"
              crossorigin=""
            />
            {/* <link
              rel="preload"
              href="https://minio.limingcn.com/solid-start/fonts/FormulaCondensed-Light.woff2"
              as="font"
              type="font/woff2"
              crossorigin=""
            /> */}
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
