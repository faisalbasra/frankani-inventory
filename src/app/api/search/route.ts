import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems } from "@/db/schema";
import { like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "all";

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const searchTerm = `%${query}%`;
    let whereConditions: unknown[] = [];

    switch (type) {
      case "oem":
        whereConditions = [
          like(inventoryItems.delenummer_oem, searchTerm),
          like(inventoryItems.oem_alt, searchTerm)
        ];
        break;
      
      case "car":
        whereConditions = [
          like(inventoryItems.model, searchTerm)
        ];
        break;
      
      case "supplier":
        whereConditions = [
          like(inventoryItems.leverandor, searchTerm)
        ];
        break;
      
      case "category":
        whereConditions = [
          like(inventoryItems.category, searchTerm)
        ];
        break;
      
      case "make":
        // Search for car make within the model field
        whereConditions = [
          like(inventoryItems.model, searchTerm)
        ];
        break;
      
      case "all":
      default:
        whereConditions = [
          like(inventoryItems.delenummer_oem, searchTerm),
          like(inventoryItems.oem_alt, searchTerm),
          like(inventoryItems.deler, searchTerm),
          like(inventoryItems.model, searchTerm),
          like(inventoryItems.leverandor, searchTerm),
          like(inventoryItems.category, searchTerm),
          like(inventoryItems.lagerkode, searchTerm)
        ];
        break;
    }

    const results = await db
      .select()
      .from(inventoryItems)
      .where(or(...whereConditions))
      .orderBy(inventoryItems.updated_at)
      .limit(50);

    return NextResponse.json(results);

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Søkefeil oppstod" },
      { status: 500 }
    );
  }
}