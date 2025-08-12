import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems } from "@/db/schema";
import { like, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { make: string } }
) {
  try {
    const makeName = decodeURIComponent(params.make);

    // Get all parts that match this car make
    const parts = await db
      .select({
        id: inventoryItems.id,
        model: inventoryItems.model,
        deler: inventoryItems.deler,
        delenummer_oem: inventoryItems.delenummer_oem,
        antall: inventoryItems.antall,
        utpris_m_mva: inventoryItems.utpris_m_mva,
        category: inventoryItems.category,
        leverandor: inventoryItems.leverandor,
      })
      .from(inventoryItems)
      .where(like(inventoryItems.model, `%${makeName}%`))
      .orderBy(inventoryItems.model, inventoryItems.deler);

    // Group parts by model
    const groupedParts: { [key: string]: any[] } = {};
    
    parts.forEach((part) => {
      const modelKey = part.model || "Unknown";
      if (!groupedParts[modelKey]) {
        groupedParts[modelKey] = [];
      }
      groupedParts[modelKey].push(part);
    });

    // Convert to array format expected by frontend
    const vehicleParts = Object.entries(groupedParts).map(([modelName, modelParts]) => {
      // Extract make and model from the model string (e.g., "Audi 80 B2")
      const parts = modelName.split(' ');
      const make = parts[0];
      const model = parts.slice(1).join(' ');

      return {
        make_name: make,
        model_name: model,
        part_count: modelParts.length,
        parts: modelParts.map(part => ({
          id: part.id,
          deler: part.deler,
          delenummer_oem: part.delenummer_oem,
          antall: part.antall,
          utpris_m_mva: part.utpris_m_mva,
        })),
      };
    });

    return NextResponse.json(vehicleParts);
  } catch (error) {
    console.error("Error fetching vehicle parts:", error);
    return NextResponse.json(
      { error: "Feil ved henting av bildeler" },
      { status: 500 }
    );
  }
}