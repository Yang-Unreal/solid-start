// src/routes/api/vehicles/index.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import {
  vehicles as vehiclesTable,
  engineDetails as engineDetailsTable,
  electricDetails as electricDetailsTable,
  photos as photosTable,
  vehicleFeaturesLink,
  features,
} from "~/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { z } from "zod";
import {
  minio,
  deleteFile,
  listFiles,
  uploadFile,
  getPublicUrl,
} from "~/lib/minio";
import { kv } from "~/lib/redis";
import { vehiclesIndex, pollTask } from "~/lib/meilisearch";
import crypto from "node:crypto";

const FILTER_OPTIONS_CACHE_KEY = "filter-options";

async function invalidateCache() {
  try {
    const keys = await kv.keys("vehicles:*");
    if (keys.length > 0) {
      await kv.del(...keys);
    }
    await kv.del(FILTER_OPTIONS_CACHE_KEY);
    console.log("Successfully invalidated vehicle and filter options cache.");
  } catch (error) {
    console.error("Failed to invalidate vehicle cache:", error);
    // Continue without cache invalidation if Redis fails
  }
}

// --- GET Handlers ---

async function handleGetSingleVehicle(
  vehicleId: string,
  fresh: boolean = false
) {
  const idValidationResult = z.string().regex(/^\d+$/).safeParse(vehicleId);
  if (!idValidationResult.success) {
    return new Response(
      JSON.stringify({ error: "Invalid vehicle ID format." }),
      {
        status: 400,
      }
    );
  }
  const parsedId = parseInt(idValidationResult.data, 10);

  const singleVehicleCacheKey = `vehicle:${parsedId}`;
  let cachedVehicle = null;

  // Skip cache if fresh data is requested
  if (!fresh) {
    try {
      cachedVehicle = await kv.get(singleVehicleCacheKey);
    } catch (error) {
      console.error("Redis cache read error:", error);
    }

    if (cachedVehicle) {
      return new Response(cachedVehicle, {
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    // First fetch the basic vehicle data
    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehiclesTable.vehicle_id, parsedId),
    });

    if (!vehicle) {
      return new Response(JSON.stringify({ error: "Vehicle not found." }), {
        status: 404,
      });
    }

    // Fetch related data separately to avoid relationship issues
    let photos: any[] = [];
    let engineDetails: any[] = [];
    let electricDetails: any[] = [];

    try {
      const [photosResult, engineDetailsResult, electricDetailsResult] =
        await Promise.all([
          db
            .select()
            .from(photosTable)
            .where(eq(photosTable.vehicle_id, parsedId)),
          db
            .select()
            .from(engineDetailsTable)
            .where(eq(engineDetailsTable.vehicle_id, parsedId)),
          db
            .select()
            .from(electricDetailsTable)
            .where(eq(electricDetailsTable.vehicle_id, parsedId)),
        ]);

      photos = photosResult || [];
      engineDetails = engineDetailsResult || [];
      electricDetails = electricDetailsResult || [];
    } catch (error) {
      console.error("Error fetching related data:", error);
      // Continue with empty arrays if related data fetch fails
    }

    // Combine the data
    const vehicleWithRelations = {
      ...vehicle,
      photos: Array.isArray(photos) ? photos : [],
      engineDetails:
        Array.isArray(engineDetails) && engineDetails.length > 0
          ? engineDetails[0]
          : null,
      electricDetails:
        Array.isArray(electricDetails) && electricDetails.length > 0
          ? electricDetails[0]
          : null,
    };

    if (!vehicle) {
      return new Response(JSON.stringify({ error: "Vehicle not found." }), {
        status: 404,
      });
    }

    const responseBody = {
      data: [vehicleWithRelations],
      pagination: {
        currentPage: 1,
        pageSize: 1,
        totalItems: 1,
        totalPages: 1,
      },
    };

    try {
      kv.set(
        singleVehicleCacheKey,
        JSON.stringify(responseBody),
        "EX",
        3600
      ).catch((error) => {
        console.error("Redis cache write error:", error);
      });
    } catch (error) {
      console.error("Redis cache write error:", error);
    }

    return new Response(JSON.stringify(responseBody), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Error fetching vehicle by ID ${parsedId}:`, error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch vehicle by ID." }),
      { status: 500 }
    );
  }
}

async function handleGetVehicleList(url: URL, fresh: boolean = false) {
  const listCacheKey = `vehicles:list:${url.searchParams.toString()}`;
  let cachedList = null;

  // Skip cache if fresh data is requested
  if (!fresh) {
    try {
      cachedList = await kv.get(listCacheKey);
    } catch (error) {
      console.error("Redis cache read error:", error);
    }

    if (cachedList) {
      return new Response(cachedList, {
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "30", 10);
    const searchQuery = url.searchParams.get("q") || "";
    const sortParam = url.searchParams.get("sort") || "vehicle_id:asc";

    // Parse sort parameter (e.g., "price:asc" -> ["price", "asc"])
    const [sortBy, sortOrder] = sortParam.split(":");

    const searchOptions: any = {
      page,
      hitsPerPage: pageSize,
      sort: [`${sortBy}:${sortOrder}`],
    };

    const filterParam = url.searchParams.get("filter");
    if (filterParam && filterParam.length > 0) {
      searchOptions.filter = filterParam;
    }
    // If no filter, don't set it - Meilisearch will return all documents

    const searchResult = await vehiclesIndex.search(searchQuery, searchOptions);

    // Extract vehicle IDs from the search results
    const vehicleIds = searchResult.hits.map((hit) => hit.vehicle_id);

    let photos: any[] = [];
    if (vehicleIds.length > 0) {
      // Fetch photos for all vehicles in a single query
      photos = await db
        .select()
        .from(photosTable)
        .where(inArray(photosTable.vehicle_id, vehicleIds));
    }

    // Create a map of vehicleId to photos for efficient lookup
    const photosMap = photos.reduce((acc, photo) => {
      if (!acc[photo.vehicle_id]) {
        acc[photo.vehicle_id] = [];
      }
      acc[photo.vehicle_id].push(photo);
      return acc;
    }, {});

    // Attach photos to each vehicle
    const vehiclesWithPhotos = searchResult.hits.map((vehicle) => ({
      ...vehicle,
      photos: photosMap[vehicle.vehicle_id] || [],
    }));

    const responseBody = {
      data: vehiclesWithPhotos,
      pagination: {
        currentPage: searchResult.page,
        pageSize: searchResult.hitsPerPage,
        totalItems: searchResult.totalHits,
        totalPages: searchResult.totalPages,
      },
    };

    try {
      kv.set(listCacheKey, JSON.stringify(responseBody), "EX", 600).catch(
        (error) => {
          console.error("Redis cache write error:", error);
        }
      );
    } catch (error) {
      console.error("Redis cache write error:", error);
    }

    return new Response(JSON.stringify(responseBody), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error searching for vehicles:", error);
    return new Response(
      JSON.stringify({ error: "Failed to search for vehicles." }),
      { status: 500 }
    );
  }
}

export async function GET({ request }: APIEvent) {
  const url = new URL(request.url);
  const vehicleId = url.searchParams.get("id");
  const fresh = url.searchParams.get("fresh") === "true";

  if (vehicleId) {
    return handleGetSingleVehicle(vehicleId, fresh);
  } else {
    return handleGetVehicleList(url, fresh);
  }
}

// --- POST Handler (Create) ---
const createVehicleSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  price: z.string(),
  date_of_manufacture: z.coerce.number(),
  mileage: z.coerce.number(),
  horsepower: z.coerce.number(),
  top_speed_kph: z.coerce.number(),
  acceleration_0_100_sec: z.string(),
  transmission: z.string().min(1),
  weight_kg: z.coerce.number(),
  exterior: z.string().min(1),
  interior: z.string().min(1),
  seating: z.coerce.number(),
  warranty: z.string().optional(),
  maintenance_booklet: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  powertrain_type: z.enum(["Gasoline", "Hybrid", "Electric"]),
  general_description: z.string().optional(),
  specification_description: z.string().optional(),
  appearance_title: z.string().optional(),
  appearance_description: z.string().optional(),
  feature_description: z.string().optional(),
});

export async function POST({ request }: APIEvent) {
  try {
    const formData = await request.formData();
    const photos = formData
      .getAll("photos")
      .filter((p): p is File => p instanceof File && p.size > 0);
    const vehicleData: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "photos") {
        vehicleData[key] = value;
      }
    }

    const validationResult = createVehicleSchema.safeParse(vehicleData);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input for vehicle creation.",
          issues: validationResult.error.flatten(),
        }),
        { status: 400 }
      );
    }

    const newVehicle = await db.transaction(async (tx) => {
      const [insertedVehicle] = await tx
        .insert(vehiclesTable)
        .values(validationResult.data)
        .returning();

      if (!insertedVehicle) {
        tx.rollback();
        throw new Error("Failed to insert vehicle into database.");
      }

      const vehicleId = insertedVehicle.vehicle_id;

      if (photos.length > 0) {
        const photoInsertPromises = photos.map(async (photo, i) => {
          if (!photo) return null;
          const fileExtension = photo.name.split(".").pop() || "jpg";
          const randomBytes = crypto.randomBytes(8).toString("hex");
          const objectName = `vehicles/${vehicleId}-${randomBytes}-${
            i + 1
          }.${fileExtension}`;

          await uploadFile(
            objectName,
            Buffer.from(await photo.arrayBuffer()),
            photo.type
          );

          return {
            vehicle_id: vehicleId,
            photo_url: getPublicUrl(objectName),
            display_order: i + 1,
          };
        });

        const photoUrls = (await Promise.all(photoInsertPromises)).filter(
          (p): p is NonNullable<typeof p> => p !== null
        );

        if (photoUrls.length > 0) {
          await tx.insert(photosTable).values(photoUrls);
        }
      }
      return insertedVehicle;
    });

    if (!newVehicle) {
      throw new Error("Transaction failed and vehicle was not created.");
    }

    // Update Meilisearch index and wait for completion
    try {
      const addTask = await vehiclesIndex.addDocuments([newVehicle]);
      if (addTask.taskUid) {
        await pollTask(addTask.taskUid);
      }
    } catch (err) {
      console.error("Meilisearch add error:", err);
      // Don't fail the entire creation if MeiliSearch fails
    }

    await invalidateCache();

    return new Response(
      JSON.stringify({
        message: "Vehicle created successfully.",
        vehicle: newVehicle,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create vehicle:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create vehicle." }),
      { status: 500 }
    );
  }
}

// --- PUT Handler (Update) ---
const updateVehicleSchema = createVehicleSchema.partial();

export async function PUT({ request }: APIEvent) {
  const url = new URL(request.url);
  const vehicleId = url.searchParams.get("id");
  const idValidationResult = z.string().regex(/^\d+$/).safeParse(vehicleId);

  if (!idValidationResult.success) {
    return new Response(JSON.stringify({ error: "Invalid vehicle ID." }), {
      status: 400,
    });
  }
  const parsedId = parseInt(idValidationResult.data, 10);

  try {
    const body = await request.json();
    const { photosToDelete, newPhotoUrls, ...vehicleData } = body;

    const validationResult = updateVehicleSchema.safeParse(vehicleData);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input for vehicle update.",
          issues: validationResult.error.flatten(),
        }),
        { status: 400 }
      );
    }

    const dataToUpdate = validationResult.data;

    await db.transaction(async (tx) => {
      // Update vehicle data
      await tx
        .update(vehiclesTable)
        .set(dataToUpdate)
        .where(eq(vehiclesTable.vehicle_id, parsedId));

      // Delete marked photos
      if (photosToDelete && photosToDelete.length > 0) {
        // Get photo URLs for deletion from MinIO
        const photosToDeleteRecords = await tx
          .select({ photo_url: photosTable.photo_url })
          .from(photosTable)
          .where(
            and(
              eq(photosTable.vehicle_id, parsedId),
              inArray(photosTable.photo_id, photosToDelete)
            )
          );

        // Delete from MinIO
        for (const photo of photosToDeleteRecords) {
          const key = photo.photo_url.split("/").pop();
          if (key) {
            try {
              await deleteFile(`vehicles/${key}`);
            } catch (error) {
              console.error("Error deleting file from MinIO:", error);
            }
          }
        }

        // Delete from database
        await tx
          .delete(photosTable)
          .where(
            and(
              eq(photosTable.vehicle_id, parsedId),
              inArray(photosTable.photo_id, photosToDelete)
            )
          );
      }

      // Add new photos
      if (newPhotoUrls && newPhotoUrls.length > 0) {
        // Get the maximum display_order for this vehicle
        const maxDisplayOrderResult = await tx
          .select({ display_order: photosTable.display_order })
          .from(photosTable)
          .where(eq(photosTable.vehicle_id, parsedId))
          .orderBy(desc(photosTable.display_order))
          .limit(1);

        let nextDisplayOrder = 1;
        if (maxDisplayOrderResult.length > 0 && maxDisplayOrderResult[0]) {
          nextDisplayOrder = maxDisplayOrderResult[0].display_order + 1;
        }

        const newPhotos = newPhotoUrls.map((url: string, index: number) => ({
          vehicle_id: parsedId,
          photo_url: url,
          display_order: nextDisplayOrder + index,
        }));

        await tx.insert(photosTable).values(newPhotos);
      }
    });

    // Get updated vehicle
    const updatedVehicle = await db.query.vehicles.findFirst({
      where: eq(vehiclesTable.vehicle_id, parsedId),
    });

    if (updatedVehicle) {
      // Update Meilisearch index and wait for completion
      try {
        const deleteTask = await vehiclesIndex.deleteDocument(
          updatedVehicle.vehicle_id
        );
        if (deleteTask.taskUid) {
          await pollTask(deleteTask.taskUid);
        }
      } catch (err) {
        console.error("Meilisearch delete error:", err);
        // Continue with add operation even if delete fails
      }

      try {
        const addTask = await vehiclesIndex.addDocuments([updatedVehicle]);
        if (addTask.taskUid) {
          await pollTask(addTask.taskUid);
        }
      } catch (err) {
        console.error("Meilisearch add error:", err);
        // Don't fail the entire update if MeiliSearch fails
      }
    }

    await invalidateCache();

    return new Response(
      JSON.stringify({
        message: "Vehicle updated successfully.",
        vehicle: updatedVehicle,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update vehicle." }),
      { status: 500 }
    );
  }
}

// --- DELETE Handler ---
export async function DELETE({ request }: APIEvent) {
  const url = new URL(request.url);
  const vehicleId = url.searchParams.get("id");
  const idValidationResult = z.string().regex(/^\d+$/).safeParse(vehicleId);

  if (!idValidationResult.success) {
    return new Response(JSON.stringify({ error: "Invalid vehicle ID." }), {
      status: 400,
    });
  }
  const parsedId = parseInt(idValidationResult.data, 10);

  try {
    const photosToDelete = await db
      .select({ photo_url: photosTable.photo_url })
      .from(photosTable)
      .where(eq(photosTable.vehicle_id, parsedId));

    if (photosToDelete.length > 0) {
      const bucket = process.env.MINIO_BUCKET_NAME!;
      for (const photo of photosToDelete) {
        const key = photo.photo_url.split("/").pop(); // Basic key extraction
        if (key) {
          await deleteFile(`vehicles/${key}`); // Assuming a vehicles folder
        }
      }
    }

    const deletedVehicle = await db
      .delete(vehiclesTable)
      .where(eq(vehiclesTable.vehicle_id, parsedId))
      .returning();

    if (deletedVehicle.length === 0) {
      return new Response(JSON.stringify({ error: "Vehicle not found." }), {
        status: 404,
      });
    }

    // Update Meilisearch index and wait for completion
    try {
      const deleteTask = await vehiclesIndex.deleteDocument(parsedId);
      if (deleteTask.taskUid) {
        await pollTask(deleteTask.taskUid);
      }
    } catch (err) {
      console.error("Meilisearch delete error:", err);
      // Don't fail the entire deletion if MeiliSearch fails
    }

    await invalidateCache();

    return new Response(
      JSON.stringify({
        message: "Vehicle and associated images deleted.",
        vehicle: deletedVehicle[0],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete vehicle." }),
      { status: 500 }
    );
  }
}
