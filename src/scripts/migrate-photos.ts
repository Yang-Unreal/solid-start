import db from "~/db/index";
import { photos } from "~/db/schema";
import { eq, like } from "drizzle-orm";
import { faker } from "@faker-js/faker";

async function migratePhotoUrls() {
  console.log("Starting photo URL migration...");

  try {
    // Find all photos with loremflickr URLs
    const loremflickrPhotos = await db.query.photos.findMany({
      where: like(photos.photo_url, "%loremflickr%"),
    });

    console.log(
      `Found ${loremflickrPhotos.length} photos with loremflickr URLs`
    );

    if (loremflickrPhotos.length === 0) {
      console.log("No loremflickr URLs found. Migration complete.");
      return;
    }

    // Update each photo with a new Unsplash URL
    for (const photo of loremflickrPhotos) {
      const seed = faker.string.alphanumeric(10);
      const newUrl = `https://source.unsplash.com/random/800x600?car,vehicle&auto=format&fit=crop&w=800&h=600&q=80&sig=${seed}`;

      await db
        .update(photos)
        .set({ photo_url: newUrl })
        .where(eq(photos.photo_id, photo.photo_id));

      console.log(`Updated photo ${photo.photo_id}`);
    }

    console.log("Photo URL migration completed successfully!");
  } catch (error) {
    console.error("Error during photo URL migration:", error);
    process.exit(1);
  }
}

migratePhotoUrls();
