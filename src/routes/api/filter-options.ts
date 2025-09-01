import { type APIEvent } from "@solidjs/start/server";
import { vehiclesIndex } from "~/lib/meilisearch";
import { kv } from "~/lib/redis";

const CACHE_KEY = "vehicle-filter-options";

export async function GET({ request }: APIEvent) {
  try {
    const searchResult = await vehiclesIndex.search("", {
      facets: ["brand", "powertrain_type", "fuel_type"],
      limit: 0,
    });

    const filterOptions = searchResult.facetDistribution;
    const jsonBody = JSON.stringify(filterOptions);

    return new Response(jsonBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
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