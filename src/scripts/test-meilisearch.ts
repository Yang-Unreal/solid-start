#!/usr/bin/env tsx

// Test script to check Meilisearch functionality
import "dotenv/config";
import { vehiclesIndex } from "../lib/meilisearch";

async function testMeilisearch() {
  console.log("🔍 Testing Meilisearch connection and data...\n");

  try {
    // Test basic search
    console.log("📊 Testing basic search...");
    const searchResult = await vehiclesIndex.search("", {
      limit: 10,
    });

    console.log(`✅ Found ${searchResult.hits.length} vehicles`);
    console.log(`📄 Estimated total hits: ${searchResult.estimatedTotalHits}`);
    console.log(
      `📄 Total pages: ${Math.ceil(searchResult.estimatedTotalHits / 10)}`
    );

    if (searchResult.hits.length > 0) {
      console.log("\n🚗 Sample vehicles:");
      searchResult.hits.slice(0, 2).forEach((vehicle, i) => {
        console.log(
          `${i + 1}. ${vehicle.brand} ${vehicle.model} (${
            vehicle.date_of_manufacture
          })`
        );
      });
    }

    // Test index stats
    console.log("\n📈 Index statistics:");
    const stats = await vehiclesIndex.getStats();
    console.log(`- Documents: ${stats.numberOfDocuments}`);
    console.log(`- Is indexing: ${stats.isIndexing}`);
    console.log(
      `- Field distribution: ${
        Object.keys(stats.fieldDistribution).length
      } fields`
    );

    return true;
  } catch (error: any) {
    console.error("❌ Meilisearch test failed:");
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code || "Unknown"}`);
    return false;
  }
}

testMeilisearch().then((success) => {
  process.exit(success ? 0 : 1);
});
