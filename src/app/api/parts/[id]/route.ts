import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems, activityLog, compatibleVehicles, polcarLookupHistory } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    const item = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { error: "Del ikke funnet" },
        { status: 404 }
      );
    }

    return NextResponse.json(item[0]);

  } catch (error) {
    console.error("Error fetching part:", error);
    return NextResponse.json(
      { error: "Feil ved henting av del" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const updates = await request.json();

    const [updated] = await db
      .update(inventoryItems)
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where(eq(inventoryItems.id, id))
      .returning();

    await db.insert(activityLog).values({
      inventory_item_id: id,
      action_type: "update_info",
      new_value: JSON.stringify(updates),
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Error updating part:", error);
    return NextResponse.json(
      { error: "Feil ved oppdatering av del" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // First, get the part details for logging
    const [partToDelete] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .limit(1);

    if (!partToDelete) {
      return NextResponse.json(
        { error: "Del ikke funnet" },
        { status: 404 }
      );
    }

    // Delete related records first (foreign key constraints)
    await db.delete(compatibleVehicles).where(eq(compatibleVehicles.inventory_item_id, id));
    await db.delete(polcarLookupHistory).where(eq(polcarLookupHistory.inventory_item_id, id));
    await db.delete(activityLog).where(eq(activityLog.inventory_item_id, id));

    // Delete the main inventory item
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));

    // Log the deletion (separate activity log entry not tied to the deleted item)
    await db.insert(activityLog).values({
      inventory_item_id: null, // No longer tied to the deleted item
      action_type: "delete_part",
      old_value: `Slettet del: ${partToDelete.deler} (ID: ${id}, OEM: ${partToDelete.delenummer_oem})`,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Del "${partToDelete.deler}" ble slettet permanent` 
    });

  } catch (error) {
    console.error("Error deleting part:", error);
    return NextResponse.json(
      { error: "Feil ved sletting av del" },
      { status: 500 }
    );
  }
}