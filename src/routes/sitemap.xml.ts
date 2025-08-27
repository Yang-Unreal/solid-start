import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the absolute path to the .output/public directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '../../.output/public'); // Adjust path as needed

export function GET() {
  try {
    const sitemapPath = join(publicDir, 'sitemap.xml');
    const sitemapContent = readFileSync(sitemapPath, 'utf-8');

    return new Response(sitemapContent, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error serving sitemap.xml:', error);
    return new Response('Sitemap not found', { status: 404 });
  }
}
