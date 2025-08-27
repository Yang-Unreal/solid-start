import { writeFileSync } from 'fs';
import { glob } from 'glob';
import { SitemapStream, streamToPromise } from 'sitemap';

// The base URL of your site
const hostname = 'https://limingcn.com';

// The directory where your routes are located
const routesDir = 'src/routes';

async function generateSitemap() {
  try {
    console.log('Starting sitemap generation from routes...');

    // Find all .tsx files in the routes directory
    const files = await glob('**/*.tsx', {
      cwd: routesDir,
      ignore: [
        'api/**/*.tsx', // Exclude API routes
        '\[...404\].tsx', // Exclude 404 page (escaped for glob)
      ],
    });

    if (files.length === 0) {
      console.log('No route files found. Aborting sitemap generation.');
      return;
    }

    const sitemapStream = new SitemapStream({ hostname });

    // Create a promise that resolves when the stream is finished
    const promise = streamToPromise(sitemapStream).then((data) => data.toString());

    // Add each route to the sitemap
    files.forEach((file) => {
      let url = file
        .replace(/index\.tsx$/, '') // Remove index.tsx
        .replace(/\.tsx$/, '') // Remove .tsx extension
        .replace(/\[\w+\]\.tsx$/, ''); // Remove dynamic segments like [id].tsx or [...slug].tsx

      // Handle root route
      if (url === '') {
        url = '/';
      }

      // Ensure leading slash
      if (!url.startsWith('/')) {
        url = '/' + url;
      }

      sitemapStream.write({ url: `${url}` });
    });

    sitemapStream.end();

    const sitemap = await promise;

    // Write the sitemap to a file in the .output/public directory
    const outputPath = '.output/public/sitemap.xml';
    writeFileSync(outputPath, sitemap);

    console.log(`Sitemap successfully generated at ${outputPath}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
