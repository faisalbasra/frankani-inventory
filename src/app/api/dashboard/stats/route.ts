import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems, carMakes } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Get total parts count
    const totalPartsQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryItems);

    // Get low stock parts count (≤ 2)
    const lowStockQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryItems)
      .where(sql`${inventoryItems.antall} <= 2`);

    // Get unchecked parts count
    const uncheckedPartsQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryItems)
      .where(eq(inventoryItems.compatibility_status, "unchecked"));

    // Get total car makes count
    const totalMakesQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(carMakes)
      .where(eq(carMakes.is_active, true));

    // Get top car make by finding most common make name in inventory model field
    const topMakeQuery = await db
      .select({
        make: sql<string>`CASE 
          WHEN ${inventoryItems.model} LIKE '%Toyota%' THEN 'Toyota'
          WHEN ${inventoryItems.model} LIKE '%BMW%' THEN 'BMW'
          WHEN ${inventoryItems.model} LIKE '%Mercedes%' THEN 'Mercedes'
          WHEN ${inventoryItems.model} LIKE '%Audi%' THEN 'Audi'
          WHEN ${inventoryItems.model} LIKE '%Volkswagen%' OR ${inventoryItems.model} LIKE '%VW%' THEN 'Volkswagen'
          WHEN ${inventoryItems.model} LIKE '%Ford%' THEN 'Ford'
          WHEN ${inventoryItems.model} LIKE '%Opel%' THEN 'Opel'
          WHEN ${inventoryItems.model} LIKE '%Volvo%' THEN 'Volvo'
          WHEN ${inventoryItems.model} LIKE '%Peugeot%' THEN 'Peugeot'
          WHEN ${inventoryItems.model} LIKE '%Renault%' THEN 'Renault'
          ELSE 'Andre'
        END`,
        count: sql<number>`count(*)`
      })
      .from(inventoryItems)
      .where(sql`${inventoryItems.model} IS NOT NULL`)
      .groupBy(sql`CASE 
        WHEN ${inventoryItems.model} LIKE '%Toyota%' THEN 'Toyota'
        WHEN ${inventoryItems.model} LIKE '%BMW%' THEN 'BMW'
        WHEN ${inventoryItems.model} LIKE '%Mercedes%' THEN 'Mercedes'
        WHEN ${inventoryItems.model} LIKE '%Audi%' THEN 'Audi'
        WHEN ${inventoryItems.model} LIKE '%Volkswagen%' OR ${inventoryItems.model} LIKE '%VW%' THEN 'Volkswagen'
        WHEN ${inventoryItems.model} LIKE '%Ford%' THEN 'Ford'
        WHEN ${inventoryItems.model} LIKE '%Opel%' THEN 'Opel'
        WHEN ${inventoryItems.model} LIKE '%Volvo%' THEN 'Volvo'
        WHEN ${inventoryItems.model} LIKE '%Peugeot%' THEN 'Peugeot'
        WHEN ${inventoryItems.model} LIKE '%Renault%' THEN 'Renault'
        ELSE 'Andre'
      END`)
      .orderBy(sql`count(*) DESC`)
      .limit(1);

    const [totalParts, lowStockParts, uncheckedParts, totalMakes, topMakeResult] = await Promise.all([
      totalPartsQuery,
      lowStockQuery,
      uncheckedPartsQuery,
      totalMakesQuery,
      topMakeQuery
    ]);

    const stats = {
      totalParts: totalParts[0]?.count || 0,
      lowStockParts: lowStockParts[0]?.count || 0,
      uncheckedParts: uncheckedParts[0]?.count || 0,
      totalMakes: totalMakes[0]?.count || 0,
      topMake: topMakeResult[0]?.make && topMakeResult[0].make !== 'Andre' ? topMakeResult[0].make : undefined
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    return NextResponse.json(
      { 
        totalParts: 0,
        lowStockParts: 0,
        uncheckedParts: 0,
        totalMakes: 0
      },
      { status: 500 }
    );
  }
}