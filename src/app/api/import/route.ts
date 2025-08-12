import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/db";
import { inventoryItems, partCategories, suppliers, carMakes, carModels } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ExcelRow {
  Model?: string;
  Category?: string;
  Deler?: string;
  Lagerplass?: string;
  Antall?: number;
  Lagerkode?: string;
  "Utpris m/mva"?: number;
  "Evt. bestilltid"?: string;
  Leverandor?: string;
  "Delenummer OEM"?: string;
  "Leverandor på lager"?: string;
  "OEM alt"?: string;
  Link?: string;
  "Webshop done"?: string;
  [key: string]: any;
}

interface ImportStats {
  totalRows: number;
  processed: number;
  newCategories: number;
  newSuppliers: number;
  newCarMakes: number;
  newCarModels: number;
  errors: string[];
}

function parseCarModel(modelString: string): { make: string; model: string } | null {
  if (!modelString) return null;
  
  const cleanModel = modelString.trim();
  const parts = cleanModel.split(/\s+/);
  
  if (parts.length >= 2) {
    const make = parts[0];
    const model = parts.slice(1).join(" ");
    return { make, model };
  }
  
  return null;
}

function standardizeSupplierName(supplier: string): string {
  if (!supplier) return "";
  
  return supplier
    .trim()
    .replace(/\//g, "/")
    .replace(/blic\/rhibo/gi, "Blic")
    .replace(/rhibo/gi, "Rhibo")
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function ensureCategory(categoryName: string): Promise<number> {
  if (!categoryName) return 1; // Default category ID
  
  const existing = await db.select().from(partCategories).where(eq(partCategories.name, categoryName)).limit(1);
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  const [inserted] = await db.insert(partCategories).values({
    name: categoryName,
    name_norwegian: categoryName,
    is_active: true,
  }).returning();
  
  return inserted.id;
}

async function ensureSupplier(supplierName: string): Promise<number | null> {
  if (!supplierName) return null;
  
  const standardized = standardizeSupplierName(supplierName);
  const existing = await db.select().from(suppliers).where(eq(suppliers.name, standardized)).limit(1);
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  const [inserted] = await db.insert(suppliers).values({
    name: standardized,
    is_active: true,
  }).returning();
  
  return inserted.id;
}

async function ensureCarMakeAndModel(modelString: string): Promise<{ makeId: number | null; modelId: number | null }> {
  const parsed = parseCarModel(modelString);
  if (!parsed) return { makeId: null, modelId: null };
  
  let makeId: number;
  const existingMake = await db.select().from(carMakes).where(eq(carMakes.name, parsed.make)).limit(1);
  
  if (existingMake.length > 0) {
    makeId = existingMake[0].id;
  } else {
    const [insertedMake] = await db.insert(carMakes).values({
      name: parsed.make,
      is_active: true,
    }).returning();
    makeId = insertedMake.id;
  }
  
  const existingModel = await db.select().from(carModels)
    .where(eq(carModels.make_id, makeId))
    .where(eq(carModels.name, parsed.model))
    .limit(1);
  
  if (existingModel.length > 0) {
    return { makeId, modelId: existingModel[0].id };
  }
  
  const [insertedModel] = await db.insert(carModels).values({
    make_id: makeId,
    name: parsed.model,
    full_name: parsed.model,
    is_active: true,
  }).returning();
  
  return { makeId, modelId: insertedModel.id };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: "Ingen fil ble lastet opp"
      }, { status: 400 });
    }
    
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
    
    const stats: ImportStats = {
      totalRows: data.length,
      processed: 0,
      newCategories: 0,
      newSuppliers: 0,
      newCarMakes: 0,
      newCarModels: 0,
      errors: []
    };
    
    // Track what we've created to avoid duplicates
    const createdCategories = new Set<string>();
    const createdSuppliers = new Set<string>();
    const createdMakes = new Set<string>();
    const createdModels = new Set<string>();
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Process category
        let categoryId: number | null = null;
        if (row.Category) {
          if (!createdCategories.has(row.Category)) {
            createdCategories.add(row.Category);
            stats.newCategories++;
          }
          categoryId = await ensureCategory(row.Category);
        }
        
        // Process supplier
        let supplierId: number | null = null;
        if (row.Leverandor) {
          const standardized = standardizeSupplierName(row.Leverandor);
          if (!createdSuppliers.has(standardized)) {
            createdSuppliers.add(standardized);
            stats.newSuppliers++;
          }
          supplierId = await ensureSupplier(row.Leverandor);
        }
        
        // Process car make and model
        if (row.Model) {
          const parsed = parseCarModel(row.Model);
          if (parsed) {
            if (!createdMakes.has(parsed.make)) {
              createdMakes.add(parsed.make);
              stats.newCarMakes++;
            }
            const modelKey = `${parsed.make}:${parsed.model}`;
            if (!createdModels.has(modelKey)) {
              createdModels.add(modelKey);
              stats.newCarModels++;
            }
            await ensureCarMakeAndModel(row.Model);
          }
        }
        
        // Insert inventory item
        await db.insert(inventoryItems).values({
          model: row.Model || null,
          category: row.Category || null,
          deler: row.Deler || null,
          lagerplass: row.Lagerplass || null,
          antall: row.Antall || 0,
          lagerkode: row.Lagerkode || null,
          utpris_m_mva: row["Utpris m/mva"] || null,
          evt_bestilltid: row["Evt. bestilltid"] || null,
          leverandor: row.Leverandor || null,
          delenummer_oem: row["Delenummer OEM"] || null,
          leverandor_pa_lager: row["Leverandor på lager"] || null,
          oem_alt: row["OEM alt"] || null,
          link: row.Link || null,
          webshop_done: row["Webshop done"] === "ja" || row["Webshop done"] === "yes" || false,
          compatibility_status: "unchecked",
        });
        
        stats.processed++;
        
      } catch (error) {
        stats.errors.push(`Rad ${i + 2}: ${(error as Error).message}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Import fullført! ${stats.processed} av ${stats.totalRows} rader ble prosessert.`,
      stats
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Feil under import: " + (error as Error).message
    }, { status: 500 });
  }
}