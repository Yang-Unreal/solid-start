import { type APIEvent } from "@solidjs/start/server";
import db from "~/db/index";
import { photos } from "~/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function GET({ params }: APIEvent) {
	const vehicleId = params.id;

	const idValidationResult = z.string().uuid().safeParse(vehicleId);
	if (!idValidationResult.success) {
		return new Response(
			JSON.stringify({ error: "Invalid vehicle ID format." }),
			{ status: 400 },
		);
	}

	try {
		const vehiclePhotos = await db.query.photos.findMany({
			where: eq(photos.vehicle_id, idValidationResult.data),
			orderBy: photos.display_order,
		});

		return new Response(JSON.stringify(vehiclePhotos), { status: 200 });
	} catch (error) {
		console.error("Failed to fetch vehicle photos:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch vehicle photos." }),
			{ status: 500 },
		);
	}
}
