import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { carMakes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    const [carMake] = await db
      .update(carMakes)
      .set({
        name: data.name,
        country: data.country || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .where(eq(carMakes.id, id))
      .returning();

    if (!carMake) {
      return NextResponse.json(
        { error: "Bilmerke ikke funnet" },
        { status: 404 }
      );
    }

    return NextResponse.json(carMake);
  } catch (error) {
    console.error("Error updating car make:", error);
    return NextResponse.json(
      { error: "Feil ved oppdatering av bilmerke" },
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
      .delete(carMakes)
      .where(eq(carMakes.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Bilmerke ikke funnet" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting car make:", error);
    return NextResponse.json(
      { error: "Feil ved sletting av bilmerke" },
      { status: 500 }
    );
  }
}