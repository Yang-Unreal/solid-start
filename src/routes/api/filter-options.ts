import { type APIEvent } from "@solidjs/start/server";
import { vehiclesIndex } from "~/lib/meilisearch";
import { kv } from "~/lib/redis";
import type { GranularFilterableAttribute } from "meilisearch";

const CACHE_KEY = "filter-options"; // Keep the key for potential future use, but remove caching logic for now

export async function GET({ request }: APIEvent) {
  try {
    // Get the filterable attributes from the index settings
    const settings = await vehiclesIndex.getSettings();
    const filterableAttributes = (settings.filterableAttributes || [])
      .flat()
      .map((attr) => (typeof attr === "string" ? attr : Object.keys(attr)[0]));

    // Then, use those attributes to get the facet distribution
    const searchResult = await vehiclesIndex.search("", {
      facets: filterableAttributes as string[],
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
