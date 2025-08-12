import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { compatibleVehicles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; compatibilityId: string } }
) {
  try {
    const compatibilityId = parseInt(params.compatibilityId);

    await db
      .delete(compatibleVehicles)
      .where(eq(compatibleVehicles.id, compatibilityId));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting compatibility:", error);
    return NextResponse.json(
      { error: "Feil ved sletting av kompatibilitet" },
      { status: 500 }
    );
  }
}