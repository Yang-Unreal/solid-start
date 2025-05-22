import { createHandler, StartServer } from "@solidjs/start/server";
import { themeInitializerScript } from "./scripts/theme-initializer";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
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
));
