import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems, compatibleVehicles } from "@/db/schema";
import { eq, like, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  // Skip during build time if environment variables are not available
  if (!process.env.TURSO_DATABASE_URL) {
    return NextResponse.json([]);
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    let whereConditions: any[] = [];

    // Apply filter conditions
    if (filter !== "all") {
      whereConditions.push(eq(inventoryItems.compatibility_status, filter));
    }

    // Apply search conditions
    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(
        or(
          like(inventoryItems.deler, searchTerm),
          like(inventoryItems.delenummer_oem, searchTerm),
          like(inventoryItems.category, searchTerm),
          like(inventoryItems.leverandor, searchTerm)
        )
      );
    }

    // Build the where clause
    const whereClause = whereConditions.length > 0 
      ? sql`${whereConditions.reduce((acc, condition, index) => 
          index === 0 ? condition : sql`${acc} AND ${condition}`
        )}`
      : undefined;

    // Get items with their compatibility info
    let itemsQuery = db
      .select({
        id: inventoryItems.id,
        deler: inventoryItems.deler,
        delenummer_oem: inventoryItems.delenummer_oem,
        category: inventoryItems.category,
        leverandor: inventoryItems.leverandor,
        antall: inventoryItems.antall,
        compatibility_status: inventoryItems.compatibility_status,
        last_compatibility_check: inventoryItems.last_compatibility_check,
      })
      .from(inventoryItems);

    if (whereClause) {
      itemsQuery = itemsQuery.where(whereClause);
    }

    const items = await itemsQuery.orderBy(inventoryItems.updated_at);

    // For each item, count compatible vehicles
    const itemsWithCompatibilityCount = await Promise.all(
      items.map(async (item) => {
        const compatibilityCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(compatibleVehicles)
          .where(eq(compatibleVehicles.inventory_item_id, item.id));

        return {
          ...item,
          compatible_count: compatibilityCount[0]?.count || 0,
        };
      })
    );

    return NextResponse.json(itemsWithCompatibilityCount);

  } catch (error) {
    console.error("Error fetching compatibility data:", error);
    return NextResponse.json(
      { error: "Feil ved henting av kompatibilitetsdata" },
      { status: 500 }
    );
  }
}