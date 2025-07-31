import { uploadFile } from '../lib/minio';
import fs from 'fs/promises';
import path from 'path';

const fontDir = path.join(process.cwd(), 'public', 'fonts');

async function uploadFonts() {
  try {
    const files = await fs.readdir(fontDir);
    for (const file of files) {
      const filePath = path.join(fontDir, file);
      const fileData = await fs.readFile(filePath);
      const objectName = `fonts/${file}`;

      await uploadFile(objectName, fileData, 'font/woff2');
      console.log(`Successfully uploaded ${file} to Minio.`);
    }
  } catch (error) {
    console.error('Error uploading fonts:', error);
  }
}

uploadFonts();
