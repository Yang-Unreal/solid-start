import { createHandler, StartServer } from "@solidjs/start/server";
export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>SolidStart App</title>
          <meta name="description" content="A SolidStart web application." />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body class="bg-slate-100 text-slate-900 min-h-screen">
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
