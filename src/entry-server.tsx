// // @refresh reload
// import { createHandler, StartServer } from "@solidjs/start/server";

// export default createHandler(() => (
//   <StartServer
//     document={({ assets, children, scripts }) => (
//       <html lang="en">
//         <head>
//           <meta charset="utf-8" />
//           <meta name="viewport" content="width=device-width, initial-scale=1" />
//           <link rel="icon" href="/favicon.ico" />
//           {assets}
//         </head>
//         <body>
//           <div id="app">{children}</div>
//           {scripts}
//         </body>
//       </html>
//     )}
//   />
// ));
// entry-server.tsx
// @refresh reload

import { createHandler, StartServer } from "@solidjs/start/server";

// Define the inline script to be injected into the <head>
const themeInitializerScript = `
  (function() {
    // Attempt to retrieve the user's explicitly chosen theme from localStorage.
    // This value can be 'light', 'dark', or 'system'.
    const storedUserChoice = localStorage.getItem('theme');

    // Check the system's preference for dark mode.
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let applyDarkClass = false;

    if (storedUserChoice === 'dark') {
      applyDarkClass = true;
    } else if (storedUserChoice === 'light') {
      applyDarkClass = false;
    } else {
      // If 'system' is chosen, or if no theme is set yet (null),
      // defer to the system's preference.
      applyDarkClass = systemPrefersDark;
    }

    // Apply or remove the 'dark' class on the <html> element.
    if (applyDarkClass) {
      document.documentElement.classList.add('dark');
    } else {
      // It's important to remove the class if dark mode is not active,
      // especially if it was set on a previous visit.
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {/* SolidStart will inject its assets here */}
          {assets}
          {/* 👇 Inject our theme initialization script */}
          <script innerHTML={themeInitializerScript} />
        </head>
        {/* Apply base transitionable background and text colors to the body */}
        <body class="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
          <div id="app">{children}</div>
          {/* SolidStart will inject its scripts here */}
          {scripts}
        </body>
      </html>
    )}
  />
));
