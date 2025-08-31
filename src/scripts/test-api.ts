#!/usr/bin/env tsx

// Test script to check the vehicles API endpoint
import "dotenv/config";

async function testVehiclesAPI() {
  console.log("🔍 Testing vehicles API endpoint...\n");

  try {
    const response = await fetch(
      "http://localhost:3000/api/vehicles?pageSize=10"
    );

    if (!response.ok) {
      console.error(
        `❌ API request failed: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      return false;
    }

    const data = await response.json();
    console.log("✅ API response received");
    console.log(`📊 Data structure:`, {
      dataLength: data.data?.length || 0,
      pagination: data.pagination,
      hasError: !!data.error,
    });

    if (data.data && data.data.length > 0) {
      console.log("\n🚗 Vehicles found:");
      data.data.slice(0, 2).forEach((vehicle: any, i: number) => {
        console.log(
          `${i + 1}. ${vehicle.brand} ${vehicle.model} (${
            vehicle.date_of_manufacture
          })`
        );
      });
    } else {
      console.log("⚠️  No vehicles returned from API");
    }

    return true;
  } catch (error: any) {
    console.error("💥 API test failed:");
    console.error(`Error: ${error.message}`);
    return false;
  }
}

testVehiclesAPI().then((success) => {
  process.exit(success ? 0 : 1);
});
