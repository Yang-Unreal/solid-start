// src/routes/api/vehicles/index.ts
import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import {
  vehicles,
  gasoline_powertrains,
  electric_powertrains,
  hybrid_powertrains,
  photos,
  vehicle_features,
  features,
} from "~/db/schema";
import { eq, inArray, and } from "drizzle-orm";
import { z } from "zod";
import { kv } from "~/lib/redis";
import { minio, bucket, endpoint } from "~/lib/minio";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { vehiclesIndex, pollTask } from "~/lib/meilisearch";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;
const CACHE_DURATION_SECONDS = 300;
const FILTER_OPTIONS_CACHE_KEY = "vehicle-filter-options";

async function invalidateVehicleCache() {
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

const NewVehiclePayloadSchema = z.object({
  brand: z.string(),
  model: z.string(),
  price: z.coerce.number(),
  date_of_manufacture: z.coerce.number(),
  mileage: z.coerce.number(),
  horsepower: z.coerce.number(),
  top_speed_kph: z.coerce.number(),
  acceleration_0_100_sec: z.coerce.number(),
  transmission: z.string(),
  weight_kg: z.coerce.number(),
  exterior: z.string(),
  interior: z.string(),
  seating: z.coerce.number(),
  warranty: z.string(),
  maintenance_booklet: z.boolean(),
  powertrain_type: z.enum(["Gasoline", "Hybrid", "Electric"]),
  general_description: z.string().optional(),
  specification_description: z.string().optional(),
  appearance_title: z.string().optional(),
  appearance_description: z.string().optional(),
  feature_description: z.string().optional(),
  photos: z.array(
    z.object({ photo_url: z.string(), display_order: z.number() })
  ),
  features: z
    .array(z.object({ name: z.string(), category: z.string() }))
    .optional(), // array of feature objects
  // Powertrain specific fields
  cylinder_amount: z.coerce.number().optional(),
  cylinder_capacity_cc: z.coerce.number().optional(),
  fuel_type: z.string().optional(),
  battery_capacity_kwh: z.coerce.number().optional(),
  electric_range_km: z.coerce.number().optional(),
  electric_motor_power_kw: z.coerce.number().optional(),
  combustion_engine_power_hp: z.coerce.number().optional(),
});

const UpdateVehiclePayloadSchema = NewVehiclePayloadSchema.partial();

async function handleGetSingleVehicle(vehicleId: string) {
  const idValidationResult = z.string().uuid().safeParse(vehicleId);
  if (!idValidationResult.success) {
    return new Response(
      JSON.stringify({ error: "Invalid vehicle ID format." }),
      { status: 400 }
    );
  }

  const vehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.vehicle_id, idValidationResult.data),
    with: {
      photos: true,
      gasoline_powertrain: true,
      electric_powertrain: true,
      hybrid_powertrain: true,
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

  return new Response(JSON.stringify({ data: [vehicle] }), { status: 200 });
}

async function handleGetVehicleList(url: URL) {
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  let pageSize = parseInt(
    url.searchParams.get("pageSize") || `${DEFAULT_PAGE_SIZE}`,
    10
  );
  pageSize = Math.min(pageSize, MAX_PAGE_SIZE);

  const searchQuery = url.searchParams.get("q") || "";
  const filterQuery = url.searchParams.get("filter") || "";

  try {
    const searchResult = await vehiclesIndex.search(searchQuery, {
      page,
      hitsPerPage: pageSize,
      filter: filterQuery,
      facets: ["brand", "powertrain_type", "fuel_type"],
    });

    const responseBody = {
      data: searchResult.hits,
      pagination: {
        currentPage: searchResult.page,
        pageSize: searchResult.hitsPerPage,
        totalVehicles: searchResult.totalHits,
        totalPages: searchResult.totalPages,
        hasNextPage: searchResult.page < searchResult.totalPages,
        hasPreviousPage: searchResult.page > 1,
      },
      facets: searchResult.facetDistribution,
    };
    return new Response(JSON.stringify(responseBody), { status: 200 });
  } catch (error: any) {
    console.error("MeiliSearch search error:", error);
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
  }

  return handleGetVehicleList(url);
}

export async function POST({ request }: APIEvent) {
  try {
    const body = await request.json();
    const validationResult = NewVehiclePayloadSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input.",
          issues: validationResult.error.flatten(),
        }),
        { status: 400 }
      );
    }

    const {
      photos: photoData,
      features: featureData,
      powertrain_type,
      cylinder_amount,
      cylinder_capacity_cc,
      fuel_type,
      battery_capacity_kwh,
      electric_range_km,
      electric_motor_power_kw,
      combustion_engine_power_hp,
      ...rest
    } = validationResult.data;

    const vehicleData = {
      brand: rest.brand,
      model: rest.model,
      price: rest.price?.toString(),
      date_of_manufacture: rest.date_of_manufacture,
      mileage: rest.mileage,
      horsepower: rest.horsepower,
      top_speed_kph: rest.top_speed_kph,
      acceleration_0_100_sec: rest.acceleration_0_100_sec?.toString(),
      transmission: rest.transmission,
      weight_kg: rest.weight_kg,
      exterior: rest.exterior,
      interior: rest.interior,
      seating: rest.seating,
      warranty: rest.warranty,
      maintenance_booklet: rest.maintenance_booklet,
      powertrain_type: powertrain_type,
      general_description: rest.general_description,
      specification_description: rest.specification_description,
      appearance_title: rest.appearance_title,
      appearance_description: rest.appearance_description,
      feature_description: rest.feature_description,
    };

    const newVehicle = await db.transaction(async (tx) => {
      const [insertedVehicle] = await tx
        .insert(vehicles)
        .values(vehicleData)
        .returning();

      if (!insertedVehicle) {
        tx.rollback();
        return;
      }

      if (powertrain_type === "Gasoline") {
        await tx.insert(gasoline_powertrains).values({
          vehicle_id: insertedVehicle.vehicle_id,
          cylinder_amount,
          cylinder_capacity_cc,
          fuel_type,
        });
      } else if (powertrain_type === "Electric") {
        await tx.insert(electric_powertrains).values({
          vehicle_id: insertedVehicle.vehicle_id,
          battery_capacity_kwh: battery_capacity_kwh?.toString(),
          electric_range_km,
        });
      } else if (powertrain_type === "Hybrid") {
        await tx.insert(hybrid_powertrains).values({
          vehicle_id: insertedVehicle.vehicle_id,
          electric_motor_power_kw,
          combustion_engine_power_hp,
        });
      }

      if (photoData && photoData.length > 0) {
        await tx.insert(photos).values(
          photoData.map((p) => ({
            ...p,
            vehicle_id: insertedVehicle.vehicle_id,
          }))
        );
      }

      if (featureData && featureData.length > 0) {
        const featureIds: string[] = [];
        for (const feature of featureData) {
          const existing = await tx.query.features.findFirst({
            where: and(
              eq(features.feature_name, feature.name),
              eq(features.feature_category, feature.category as any)
            ),
          });
          if (existing) {
            featureIds.push(existing.feature_id);
          } else {
            const [inserted] = await tx
              .insert(features)
              .values({
                feature_name: feature.name,
                feature_category: feature.category as any,
              })
              .returning({ feature_id: features.feature_id });
            if (inserted) {
              featureIds.push(inserted.feature_id);
            }
          }
        }
        await tx.insert(vehicle_features).values(
          featureIds.map((feature_id) => ({
            vehicle_id: insertedVehicle.vehicle_id,
            feature_id,
          }))
        );
      }

      return insertedVehicle;
    });

    if (!newVehicle) {
      throw new Error("Failed to create vehicle");
    }

    await invalidateVehicleCache();

    // Sync with MeiliSearch
    const fullVehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.vehicle_id, newVehicle.vehicle_id),
      with: {
        photos: true,
        gasoline_powertrain: true,
        electric_powertrain: true,
        hybrid_powertrain: true,
        features: {
          with: {
            feature: true,
          },
        },
      },
    });

    if (fullVehicle) {
      const task = await vehiclesIndex.addDocuments([fullVehicle]);
      await pollTask(task.taskUid);
    }

    return new Response(JSON.stringify(newVehicle), { status: 201 });
  } catch (error) {
    console.error("Failed to create vehicle:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create vehicle." }),
      { status: 500 }
    );
  }
}

export async function PUT({ request }: APIEvent) {
  const url = new URL(request.url);
  const vehicleId = url.searchParams.get("id");
  const idValidationResult = z.string().uuid().safeParse(vehicleId);
  if (!idValidationResult.success) {
    return new Response(JSON.stringify({ error: "Invalid vehicle ID." }), {
      status: 400,
    });
  }

  try {
    const body = await request.json();
    const validationResult = UpdateVehiclePayloadSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid input for vehicle update.",
          issues: validationResult.error.flatten(),
        }),
        { status: 400 }
      );
    }

    const {
      photos: photoData,
      features: featureData,
      powertrain_type,
      cylinder_amount,
      cylinder_capacity_cc,
      fuel_type,
      battery_capacity_kwh,
      electric_range_km,
      electric_motor_power_kw,
      combustion_engine_power_hp,
      ...rest
    } = validationResult.data;

    const vehicleData = {
      brand: rest.brand,
      model: rest.model,
      price: rest.price?.toString(),
      date_of_manufacture: rest.date_of_manufacture,
      mileage: rest.mileage,
      horsepower: rest.horsepower,
      top_speed_kph: rest.top_speed_kph,
      acceleration_0_100_sec: rest.acceleration_0_100_sec?.toString(),
      transmission: rest.transmission,
      weight_kg: rest.weight_kg,
      exterior: rest.exterior,
      interior: rest.interior,
      seating: rest.seating,
      warranty: rest.warranty,
      maintenance_booklet: rest.maintenance_booklet,
      powertrain_type: powertrain_type,
      general_description: rest.general_description,
      specification_description: rest.specification_description,
      appearance_title: rest.appearance_title,
      appearance_description: rest.appearance_description,
      feature_description: rest.feature_description,
    };

    const updatedVehicle = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(vehicles)
        .set(vehicleData)
        .where(eq(vehicles.vehicle_id, idValidationResult.data))
        .returning();

      if (!updated) {
        tx.rollback();
        return;
      }

      if (powertrain_type) {
        // Delete existing powertrain data
        await tx
          .delete(gasoline_powertrains)
          .where(eq(gasoline_powertrains.vehicle_id, idValidationResult.data));
        await tx
          .delete(electric_powertrains)
          .where(eq(electric_powertrains.vehicle_id, idValidationResult.data));
        await tx
          .delete(hybrid_powertrains)
          .where(eq(hybrid_powertrains.vehicle_id, idValidationResult.data));

        // Insert new powertrain data
        if (powertrain_type === "Gasoline") {
          await tx.insert(gasoline_powertrains).values({
            vehicle_id: idValidationResult.data,
            cylinder_amount,
            cylinder_capacity_cc,
            fuel_type,
          });
        } else if (powertrain_type === "Electric") {
          await tx.insert(electric_powertrains).values({
            vehicle_id: idValidationResult.data,
            battery_capacity_kwh: battery_capacity_kwh?.toString(),
            electric_range_km,
          });
        } else if (powertrain_type === "Hybrid") {
          await tx.insert(hybrid_powertrains).values({
            vehicle_id: idValidationResult.data,
            electric_motor_power_kw,
            combustion_engine_power_hp,
          });
        }
      }

      if (photoData) {
        // Get existing photos before deleting them (for MinIO cleanup)
        const existingPhotos = await tx.query.photos.findMany({
          where: eq(photos.vehicle_id, idValidationResult.data),
        });

        // Delete existing photos from database
        await tx
          .delete(photos)
          .where(eq(photos.vehicle_id, idValidationResult.data));

        // Delete old images from MinIO that are not in the new photo data
        if (existingPhotos.length > 0) {
          const existingPhotoUrls = existingPhotos
            .filter((p) => p.photo_url)
            .map((p) => p.photo_url!);

          const newPhotoUrls = photoData.map((p) => p.photo_url);

          // Find photos that are being removed/replaced
          const photosToDeleteFromMinio = existingPhotoUrls.filter(
            (existingUrl) => !newPhotoUrls.includes(existingUrl)
          );

          if (photosToDeleteFromMinio.length > 0) {
            try {
              const photoKeysToDelete = photosToDeleteFromMinio.map((url) => {
                const photoUrl = new URL(url);
                if (!endpoint) throw new Error("MinIO endpoint not configured");
                const endpointUrl = new URL(endpoint);
                const endpointPath = endpointUrl.pathname.replace(/\/$/, "");
                const bucketPrefix = `${endpointPath}/${bucket}`;
                return photoUrl.pathname.replace(
                  new RegExp(`^${bucketPrefix}/`),
                  ""
                );
              });

              await minio.send(
                new DeleteObjectsCommand({
                  Bucket: bucket,
                  Delete: {
                    Objects: photoKeysToDelete.map((k) => ({ Key: k })),
                  },
                })
              );
              console.log(
                `Deleted ${photosToDeleteFromMinio.length} old images from MinIO`
              );
            } catch (minioError) {
              console.error(
                "Failed to delete old images from MinIO:",
                minioError
              );
              // Continue with the update even if MinIO deletion fails
            }
          }
        }

        // Insert new photos
        await tx.insert(photos).values(
          photoData.map((p) => ({
            ...p,
            vehicle_id: idValidationResult.data,
          }))
        );
      }

      if (featureData) {
        await tx
          .delete(vehicle_features)
          .where(eq(vehicle_features.vehicle_id, idValidationResult.data));
        if (featureData.length > 0) {
          const featureIds: string[] = [];
          for (const feature of featureData) {
            const existing = await tx.query.features.findFirst({
              where: and(
                eq(features.feature_name, feature.name),
                eq(features.feature_category, feature.category as any)
              ),
            });
            if (existing) {
              featureIds.push(existing.feature_id);
            } else {
              const [inserted] = await tx
                .insert(features)
                .values({
                  feature_name: feature.name,
                  feature_category: feature.category as any,
                })
                .returning({ feature_id: features.feature_id });
              if (inserted) {
                featureIds.push(inserted.feature_id);
              }
            }
          }
          await tx.insert(vehicle_features).values(
            featureIds.map((feature_id) => ({
              vehicle_id: idValidationResult.data,
              feature_id,
            }))
          );
        }
      }

      return updated;
    });

    if (!updatedVehicle) {
      throw new Error("Failed to update vehicle");
    }

    await invalidateVehicleCache();

    // Sync with MeiliSearch
    const fullUpdatedVehicle = await db.query.vehicles.findFirst({
      where: eq(vehicles.vehicle_id, updatedVehicle.vehicle_id),
      with: {
        photos: true,
        gasoline_powertrain: true,
        electric_powertrain: true,
        hybrid_powertrain: true,
        features: {
          with: {
            feature: true,
          },
        },
      },
    });

    if (fullUpdatedVehicle) {
      const task = await vehiclesIndex.updateDocuments([fullUpdatedVehicle]);
      await pollTask(task.taskUid);
    }

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

export async function DELETE({ request }: APIEvent) {
  const url = new URL(request.url);
  const vehicleId = url.searchParams.get("id");
  const idValidationResult = z.string().uuid().safeParse(vehicleId);
  if (!idValidationResult.success) {
    return new Response(JSON.stringify({ error: "Invalid vehicle ID." }), {
      status: 400,
    });
  }

  try {
    // Fetch the vehicle data before deleting it
    const vehicleToDelete = await db.query.vehicles.findFirst({
      where: eq(vehicles.vehicle_id, idValidationResult.data),
    });

    if (!vehicleToDelete) {
      return new Response(JSON.stringify({ error: "Vehicle not found." }), {
        status: 404,
      });
    }

    await db.transaction(async (tx) => {
      const photosToDelete = await tx.query.photos.findMany({
        where: eq(photos.vehicle_id, idValidationResult.data),
      });

      if (photosToDelete.length > 0) {
        const validPhotos = photosToDelete.filter((p) => p.photo_url !== null);
        if (validPhotos.length > 0) {
          const photoKeysToDelete = validPhotos.map((p) => {
            const url = new URL(p.photo_url!);
            if (!endpoint) throw new Error("MinIO endpoint not configured");
            const endpointUrl = new URL(endpoint);
            const endpointPath = endpointUrl.pathname.replace(/\/$/, "");
            const bucketPrefix = `${endpointPath}/${bucket}`;
            return url.pathname.replace(new RegExp(`^${bucketPrefix}/`), "");
          });
          await minio.send(
            new DeleteObjectsCommand({
              Bucket: bucket,
              Delete: { Objects: photoKeysToDelete.map((k) => ({ Key: k })) },
            })
          );
          console.log(
            `Deleted ${validPhotos.length} images from MinIO during vehicle deletion`
          );
        }
      }

      await tx
        .delete(vehicles)
        .where(eq(vehicles.vehicle_id, idValidationResult.data));
    });

    const task = await vehiclesIndex.deleteDocument(idValidationResult.data);
    await pollTask(task.taskUid);

    await invalidateVehicleCache();

    return new Response(
      JSON.stringify({
        message: "Vehicle deleted successfully.",
        vehicle: vehicleToDelete,
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
