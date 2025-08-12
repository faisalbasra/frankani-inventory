import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { carMakes } from "@/db/schema";

export async function GET() {
  try {
    const makes = await db
      .select()
      .from(carMakes)
      .orderBy(carMakes.name);

    return NextResponse.json(makes);
  } catch (error) {
    console.error("Error fetching car makes:", error);
    return NextResponse.json(
      { error: "Feil ved henting av bilmerker" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const [make] = await db
      .insert(carMakes)
      .values({
        name: data.name,
        country: data.country || null,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .returning();

    return NextResponse.json(make);
  } catch (error) {
    console.error("Error creating car make:", error);
    return NextResponse.json(
      { error: "Feil ved oppretting av bilmerke" },
      { status: 500 }
    );
  }
}