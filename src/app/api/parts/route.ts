import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems, activityLog } from "@/db/schema";
import { lte, eq, or, like, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    
    const offset = (page - 1) * limit;
    
    let whereConditions: any[] = [];
    
    // Apply filter conditions
    if (filter === "low_stock") {
      whereConditions.push(lte(inventoryItems.antall, 2));
    } else if (filter === "no_stock") {
      whereConditions.push(eq(inventoryItems.antall, 0));
    }
    
    // Apply search conditions
    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(
        or(
          like(inventoryItems.deler, searchTerm),
          like(inventoryItems.delenummer_oem, searchTerm),
          like(inventoryItems.category, searchTerm),
          like(inventoryItems.leverandor, searchTerm),
          like(inventoryItems.model, searchTerm),
          like(inventoryItems.lagerkode, searchTerm)
        )
      );
    }
    
    // Build the where clause
    const whereClause = whereConditions.length > 0 
      ? sql`${whereConditions.reduce((acc, condition, index) => 
          index === 0 ? condition : sql`${acc} AND ${condition}`
        )}`
      : undefined;
    
    // Get total count
    const countQuery = whereClause 
      ? db.select({ count: sql<number>`count(*)` }).from(inventoryItems).where(whereClause)
      : db.select({ count: sql<number>`count(*)` }).from(inventoryItems);
    
    const [{ count: totalCount }] = await countQuery;
    
    // Get paginated items
    let itemsQuery = db.select().from(inventoryItems);
    
    if (whereClause) {
      itemsQuery = itemsQuery.where(whereClause);
    }
    
    const items = await itemsQuery
      .orderBy(inventoryItems.updated_at)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      items,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1,
    });

  } catch (error) {
    console.error("Error fetching parts:", error);
    return NextResponse.json(
      { 
        error: "Feil ved henting av deler",
        items: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.deler || data.antall === undefined) {
      return NextResponse.json(
        { error: "Delnavn og antall er påkrevd" },
        { status: 400 }
      );
    }

    // Create new part
    const [newPart] = await db
      .insert(inventoryItems)
      .values({
        deler: data.deler,
        delenummer_oem: data.delenummer_oem || null,
        category: data.category || null,
        leverandor: data.leverandor || null,
        model: data.model || null,
        antall: data.antall,
        utpris_m_mva: data.utpris_m_mva || null,
        lagerplass: data.plassering || null, // Use lagerplass from schema
        compatibility_status: "unchecked",
      })
      .returning();

    // Log the activity
    await db.insert(activityLog).values({
      inventory_item_id: newPart.id,
      action_type: "create_part",
      new_value: `Ny del lagt til: ${data.deler}`,
    });

    return NextResponse.json(newPart, { status: 201 });
  } catch (error) {
    console.error("Error creating part:", error);
    return NextResponse.json(
      { error: "Feil ved oppretting av del" },
      { status: 500 }
    );
  }
}