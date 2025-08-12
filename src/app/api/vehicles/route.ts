import { NextResponse } from "next/server";
import { db } from "@/db";
import { carMakes, carModels, inventoryItems } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get all car makes with their models and part counts
    const makes = await db
      .select({
        id: carMakes.id,
        name: carMakes.name,
        country: carMakes.country,
      })
      .from(carMakes)
      .where(eq(carMakes.is_active, true))
      .orderBy(carMakes.name);

    // For each make, get the models and count parts
    const makesWithModels = await Promise.all(
      makes.map(async (make) => {
        const models = await db
          .select({
            id: carModels.id,
            make_id: carModels.make_id,
            name: carModels.name,
            full_name: carModels.full_name,
            year_from: carModels.year_from,
            year_to: carModels.year_to,
          })
          .from(carModels)
          .where(eq(carModels.make_id, make.id))
          .where(eq(carModels.is_active, true))
          .orderBy(carModels.name);

        // Count parts for this make
        const partCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(inventoryItems)
          .where(sql`${inventoryItems.model} LIKE ${`%${make.name}%`}`);

        return {
          ...make,
          models: await Promise.all(
            models.map(async (model) => {
              // Count parts for each model
              const modelPartCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(inventoryItems)
                .where(sql`${inventoryItems.model} LIKE ${`%${make.name}%${model.name}%`}`);

              return {
                ...model,
                part_count: modelPartCount[0]?.count || 0,
              };
            })
          ),
          total_parts: partCount[0]?.count || 0,
        };
      })
    );

    return NextResponse.json(makesWithModels);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Feil ved henting av bilmodeller" },
      { status: 500 }
    );
  }
}