import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const [supplier] = await db
      .update(suppliers)
      .set({
        name: data.name,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        website_url: data.website_url || null,
        notes: data.notes || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .where(eq(suppliers.id, id))
      .returning();

    if (!supplier) {
      return NextResponse.json(
        { error: "Leverandør ikke funnet" },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Feil ved oppdatering av leverandør" },
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

    const [deleted] = await db
      .delete(suppliers)
      .where(eq(suppliers.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Leverandør ikke funnet" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Feil ved sletting av leverandør" },
      { status: 500 }
    );
  }
}