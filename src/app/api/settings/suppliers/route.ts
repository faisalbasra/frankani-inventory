import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { suppliers } from "@/db/schema";

export async function GET() {
  try {
    const suppliersList = await db
      .select()
      .from(suppliers)
      .orderBy(suppliers.name);

    return NextResponse.json(suppliersList);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Feil ved henting av leverandører" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const [supplier] = await db
      .insert(suppliers)
      .values({
        name: data.name,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        website_url: data.website_url || null,
        notes: data.notes || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .returning();

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Feil ved oppretting av leverandør" },
      { status: 500 }
    );
  }
}