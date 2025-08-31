#!/usr/bin/env tsx

// Test script to verify vehicle creation works without images
import "dotenv/config";

async function testVehicleCreation() {
  console.log("🧪 Testing vehicle creation without images...\n");

  const testVehicle = {
    brand: "Test Brand",
    model: "Test Model",
    price: "50000.00",
    date_of_manufacture: "2023",
    mileage: "10000",
    horsepower: "200",
    top_speed_kph: "220",
    acceleration_0_100_sec: "7.5",
    transmission: "Automatic",
    weight_kg: "1500",
    exterior: "Red",
    interior: "Black",
    seating: "5",
    warranty: "3 years",
    maintenance_booklet: "false",
    powertrain_type: "Gasoline",
    general_description: "Test vehicle description",
  };

  try {
    const formData = new FormData();

    // Add all fields to FormData
    Object.entries(testVehicle).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch("http://localhost:3000/api/vehicles", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Vehicle creation failed:", errorData);
      return false;
    }

    const result = await response.json();
    console.log("✅ Vehicle created successfully:", result);
    return true;
  } catch (error) {
    console.error("💥 Test failed with error:", error);
    return false;
  }
}

testVehicleCreation().then((success) => {
  process.exit(success ? 0 : 1);
});
