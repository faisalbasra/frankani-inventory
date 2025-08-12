import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems } from "@/db/schema";
import { lte } from "drizzle-orm";

export async function GET() {
  try {
    const lowStockItems = await db
      .select({
        id: inventoryItems.id,
        deler: inventoryItems.deler,
        delenummer_oem: inventoryItems.delenummer_oem,
        category: inventoryItems.category,
        leverandor: inventoryItems.leverandor,
        antall: inventoryItems.antall,
        lagerplass: inventoryItems.lagerplass,
        utpris_m_mva: inventoryItems.utpris_m_mva,
        evt_bestilltid: inventoryItems.evt_bestilltid,
      })
      .from(inventoryItems)
      .where(lte(inventoryItems.antall, 2))
      .orderBy(inventoryItems.antall, inventoryItems.deler);

    return NextResponse.json(lowStockItems);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return NextResponse.json(
      { error: "Feil ved henting av lav beholdning" },
      { status: 500 }
    );
  }
}