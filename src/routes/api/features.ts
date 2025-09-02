import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { features } from "~/db/schema";

export async function GET({ request }: APIEvent) {
  try {
    const allFeatures = await db.query.features.findMany({
      orderBy: (features, { asc }) => [
        asc(features.feature_category),
        asc(features.feature_name),
      ],
    });

    // If no features in database, return default features
    if (allFeatures.length === 0) {
      const defaultFeatures = [
        {
          feature_id: "default-1",
          feature_name: "Air Conditioning",
          feature_category: "Comfort and convenience",
        },
        {
          feature_id: "default-2",
          feature_name: "Bluetooth",
          feature_category: "Entertainment and Media",
        },
        {
          feature_id: "default-3",
          feature_name: "ABS",
          feature_category: "Safety and security",
        },
        {
          feature_id: "default-4",
          feature_name: "Alloy Wheels",
          feature_category: "Additional",
        },
        {
          feature_id: "default-5",
          feature_name: "Cruise Control",
          feature_category: "Comfort and convenience",
        },
        {
          feature_id: "default-6",
          feature_name: "Leather Seats",
          feature_category: "Comfort and convenience",
        },
        {
          feature_id: "default-7",
          feature_name: "Navigation System",
          feature_category: "Entertainment and Media",
        },
        {
          feature_id: "default-8",
          feature_name: "Rear Camera",
          feature_category: "Safety and security",
        },
        {
          feature_id: "default-9",
          feature_name: "Sunroof",
          feature_category: "Additional",
        },
        {
          feature_id: "default-10",
          feature_name: "Heated Seats",
          feature_category: "Comfort and convenience",
        },
      ];
      return new Response(JSON.stringify({ data: defaultFeatures }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ data: allFeatures }), { status: 200 });
  } catch (error: any) {
    console.error("Error fetching features:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch features." }),
      { status: 500 }
    );
  }
}
