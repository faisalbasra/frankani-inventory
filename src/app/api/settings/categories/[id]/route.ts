import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const [category] = await db
      .update(partCategories)
      .set({
        name: data.name,
        name_norwegian: data.name_norwegian || null,
        description: data.description || null,
        sort_order: data.sort_order || 0,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .where(eq(partCategories.id, id))
      .returning();

    if (!category) {
      return NextResponse.json(
        { error: "Kategori ikke funnet" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Feil ved oppdatering av kategori" },
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
      .delete(partCategories)
      .where(eq(partCategories.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Kategori ikke funnet" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Feil ved sletting av kategori" },
      { status: 500 }
    );
  }
}