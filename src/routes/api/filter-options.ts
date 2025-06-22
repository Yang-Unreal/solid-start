import { type APIEvent } from "@solidjs/start/server";
import { productsIndex } from "~/lib/meilisearch";
import { kv } from "~/lib/redis";

const CACHE_KEY = "filter-options"; // Keep the key for potential future use, but remove caching logic for now

export async function GET({ request }: APIEvent) {
  try {
    // Always fetch from MeiliSearch to ensure the freshest data
    const searchResult = await productsIndex.search("", {
      facets: ["brand", "category", "fuelType"],
      limit: 0, // We only need facets, no hits
    });

    const filterOptions = searchResult.facetDistribution;
    const jsonBody = JSON.stringify(filterOptions);

    return new Response(jsonBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate", // Prevent all caching
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    console.error("Error fetching filter options from MeiliSearch:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch filter options." }),
      { status: 500 }
    );
  }
}
