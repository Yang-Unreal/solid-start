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
import { eq, and } from "drizzle-orm";
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
  }
}

// --- GET Handlers ---

async function handleGetSingleVehicle(vehicleId: string) {
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
  try {
    const cachedVehicle = await kv.get(singleVehicleCacheKey);
    if (cachedVehicle) {
      return new Response(JSON.stringify(cachedVehicle), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Redis cache read error:", error);
  }

  try {
    const vehicle = await db.query.vehicles.findFirst({
      where: eq(vehiclesTable.vehicle_id, parsedId),
      with: {
        engineDetails: true,
        electricDetails: true,
        photos: true,
        features: {
          with: {
            feature: true,
          },
        },
      },
    });

    if (!vehicle) {
      return new Response(JSON.stringify({ error: "Vehicle not found." }), {
        status: 404,
      });
    }

    const responseBody = {
      data: [vehicle],
      pagination: {
        currentPage: 1,
        pageSize: 1,
        totalItems: 1,
        totalPages: 1,
      },
    };

    try {
      await kv.set(
        singleVehicleCacheKey,
        JSON.stringify(responseBody),
        "EX",
        3600
      ); // Cache for 1 hour
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

async function handleGetVehicleList(url: URL) {
  const listCacheKey = `vehicles:list:${url.searchParams.toString()}`;
  try {
    const cachedList = await kv.get(listCacheKey);
    if (cachedList) {
      return new Response(JSON.stringify(cachedList), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Redis cache read error:", error);
  }

  try {
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "30", 10);
    const searchQuery = url.searchParams.get("search") || "";

    const searchResult = await vehiclesIndex.search(searchQuery, {
      page,
      hitsPerPage: pageSize,
    });

    const responseBody = {
      data: searchResult.hits,
      pagination: {
        currentPage: searchResult.page,
        pageSize: searchResult.hitsPerPage,
        totalItems: searchResult.totalHits,
        totalPages: searchResult.totalPages,
      },
    };

    try {
      await kv.set(listCacheKey, JSON.stringify(responseBody), "EX", 600); // Cache for 10 minutes
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

  if (vehicleId) {
    return handleGetSingleVehicle(vehicleId);
  } else {
    return handleGetVehicleList(url);
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

    const task = await vehiclesIndex.addDocuments([newVehicle]);
    await pollTask(task.taskUid);
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
    const validationResult = updateVehicleSchema.safeParse(body);

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

    const updatedVehicles = await db
      .update(vehiclesTable)
      .set(dataToUpdate)
      .where(eq(vehiclesTable.vehicle_id, parsedId))
      .returning();

    const updatedVehicle = updatedVehicles[0]!;

    const task = await vehiclesIndex.updateDocuments([updatedVehicle]);
    await pollTask(task.taskUid);

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

    const task = await vehiclesIndex.deleteDocument(parsedId);
    await pollTask(task.taskUid);

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
