import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { partCategories } from "@/db/schema";

export async function GET() {
  try {
    const categories = await db
      .select()
      .from(partCategories)
      .orderBy(partCategories.sort_order, partCategories.name);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Feil ved henting av kategorier" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const [category] = await db
      .insert(partCategories)
      .values({
        name: data.name,
        name_norwegian: data.name_norwegian || null,
        description: data.description || null,
        sort_order: data.sort_order || 0,
        is_active: data.is_active !== undefined ? data.is_active : true,
      })
      .returning();

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Feil ved oppretting av kategori" },
      { status: 500 }
    );
  }
}