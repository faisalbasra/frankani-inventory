import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems, activityLog } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { quantity } = await request.json();

    if (quantity < 0) {
      return NextResponse.json(
        { error: "Antall kan ikke være negativt" },
        { status: 400 }
      );
    }

    const [current] = await db
      .select({ antall: inventoryItems.antall })
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .limit(1);

    if (!current) {
      return NextResponse.json(
        { error: "Del ikke funnet" },
        { status: 404 }
      );
    }

    const [updated] = await db
      .update(inventoryItems)
      .set({
        antall: quantity,
        updated_at: new Date()
      })
      .where(eq(inventoryItems.id, id))
      .returning();

    await db.insert(activityLog).values({
      inventory_item_id: id,
      action_type: "update_quantity",
      old_value: current.antall.toString(),
      new_value: quantity.toString(),
      change_amount: quantity - current.antall,
    });

    return NextResponse.json({ success: true, item: updated });

  } catch (error) {
    console.error("Error updating quantity:", error);
    return NextResponse.json(
      { error: "Feil ved oppdatering av antall" },
      { status: 500 }
    );
  }
}