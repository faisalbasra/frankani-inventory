import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { compatibleVehicles, carMakes, carModels } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const vehicles = await db
      .select({
        id: compatibleVehicles.id,
        make_name: carMakes.name,
        model_name: carModels.name,
        year_from: compatibleVehicles.year_from,
        year_to: compatibleVehicles.year_to,
        engine_code: compatibleVehicles.engine_code,
        source: compatibleVehicles.source,
        verified: compatibleVehicles.verified,
      })
      .from(compatibleVehicles)
      .leftJoin(carMakes, eq(compatibleVehicles.make_id, carMakes.id))
      .leftJoin(carModels, eq(compatibleVehicles.model_id, carModels.id))
      .where(eq(compatibleVehicles.inventory_item_id, id));

    return NextResponse.json(vehicles);

  } catch (error) {
    console.error("Error fetching compatibility:", error);
    return NextResponse.json(
      { error: "Feil ved henting av kompatibilitet" },
      { status: 500 }
    );
  }
}