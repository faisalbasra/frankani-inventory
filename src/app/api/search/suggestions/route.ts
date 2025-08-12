import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems, partCategories, suppliers, carMakes } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const [categories, suppliersData, carModels, carMakesData] = await Promise.all([
      db
        .select({ name: partCategories.name })
        .from(partCategories)
        .where(sql`${partCategories.is_active} = true`)
        .orderBy(partCategories.name),
      
      db
        .select({ name: suppliers.name })
        .from(suppliers)
        .where(sql`${suppliers.is_active} = true`)
        .orderBy(suppliers.name),
      
      db
        .select({ model: inventoryItems.model })
        .from(inventoryItems)
        .where(sql`${inventoryItems.model} IS NOT NULL`)
        .groupBy(inventoryItems.model)
        .orderBy(inventoryItems.model),

      db
        .select({ name: carMakes.name })
        .from(carMakes)
        .where(sql`${carMakes.is_active} = true`)
        .orderBy(carMakes.name)
    ]);

    return NextResponse.json({
      categories: categories.map(c => c.name).filter(Boolean),
      suppliers: suppliersData.map(s => s.name).filter(Boolean),
      carModels: carModels.map(m => m.model).filter(Boolean),
      carMakes: carMakesData.map(m => m.name).filter(Boolean)
    });

  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json(
      { 
        categories: [], 
        suppliers: [], 
        carModels: [],
        carMakes: []
      }
    );
  }
}