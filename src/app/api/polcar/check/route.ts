import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { 
  inventoryItems, 
  polcarLookupHistory, 
  compatibleVehicles, 
  carMakes, 
  carModels, 
  activityLog 
} from "@/db/schema";
import { eq } from "drizzle-orm";

interface PolcarVehicle {
  make: string;
  model: string;
  yearFrom?: number;
  yearTo?: number;
  engineCode?: string;
  bodyType?: string;
}

async function parsePolcarResponse(html: string): Promise<PolcarVehicle[]> {
  const vehicles: PolcarVehicle[] = [];
  
  try {
    const vehicleRegex = /<tr[^>]*class="[^"]*vehicle[^"]*"[^>]*>.*?<\/tr>/gis;
    const matches = html.match(vehicleRegex) || [];
    
    for (const match of matches) {
      const makeMatch = match.match(/<td[^>]*class="[^"]*make[^"]*"[^>]*>([^<]+)<\/td>/i);
      const modelMatch = match.match(/<td[^>]*class="[^"]*model[^"]*"[^>]*>([^<]+)<\/td>/i);
      const yearMatch = match.match(/<td[^>]*class="[^"]*year[^"]*"[^>]*>([^<]+)<\/td>/i);
      const engineMatch = match.match(/<td[^>]*class="[^"]*engine[^"]*"[^>]*>([^<]+)<\/td>/i);
      
      if (makeMatch && modelMatch) {
        const make = makeMatch[1].trim();
        const model = modelMatch[1].trim();
        
        let yearFrom: number | undefined;
        let yearTo: number | undefined;
        
        if (yearMatch) {
          const yearText = yearMatch[1].trim();
          const yearRangeMatch = yearText.match(/(\d{4})\s*-\s*(\d{4})/);
          const singleYearMatch = yearText.match(/(\d{4})/);
          
          if (yearRangeMatch) {
            yearFrom = parseInt(yearRangeMatch[1]);
            yearTo = parseInt(yearRangeMatch[2]);
          } else if (singleYearMatch) {
            yearFrom = parseInt(singleYearMatch[1]);
          }
        }
        
        vehicles.push({
          make,
          model,
          yearFrom,
          yearTo,
          engineCode: engineMatch ? engineMatch[1].trim() : undefined,
        });
      }
    }
  } catch (error) {
    console.error("Error parsing Polcar response:", error);
  }
  
  return vehicles;
}

async function ensureCarMakeAndModel(make: string, model: string): Promise<{ makeId: number; modelId: number }> {
  let makeId: number;
  const existingMake = await db.select().from(carMakes).where(eq(carMakes.name, make)).limit(1);
  
  if (existingMake.length > 0) {
    makeId = existingMake[0].id;
  } else {
    const [insertedMake] = await db.insert(carMakes).values({
      name: make,
      is_active: true,
    }).returning();
    makeId = insertedMake.id;
  }
  
  const existingModel = await db.select().from(carModels)
    .where(eq(carModels.make_id, makeId))
    .where(eq(carModels.name, model))
    .limit(1);
  
  if (existingModel.length > 0) {
    return { makeId, modelId: existingModel[0].id };
  }
  
  const [insertedModel] = await db.insert(carModels).values({
    make_id: makeId,
    name: model,
    full_name: model,
    is_active: true,
  }).returning();
  
  return { makeId, modelId: insertedModel.id };
}

let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 2500; // 2.5 seconds between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
  
  return fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    },
    redirect: 'follow',
  });
}

export async function POST(request: NextRequest) {
  try {
    const { itemId, oemNumber } = await request.json();
    
    if (!itemId || !oemNumber) {
      return NextResponse.json({
        success: false,
        error: "Mangler påkrevde parametere"
      }, { status: 400 });
    }

    const startTime = Date.now();
    let success = false;
    let errorMessage = "";
    let extractedVehicles: PolcarVehicle[] = [];

    await db
      .update(inventoryItems)
      .set({ compatibility_status: "checking" })
      .where(eq(inventoryItems.id, itemId));

    try {
      const searchUrl = `https://catalog.polcar.com/search?q=${encodeURIComponent(oemNumber)}`;
      
      const response = await rateLimitedFetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      extractedVehicles = await parsePolcarResponse(html);
      
      if (extractedVehicles.length > 0) {
        for (const vehicle of extractedVehicles) {
          const { makeId, modelId } = await ensureCarMakeAndModel(vehicle.make, vehicle.model);
          
          const existingCompatibility = await db
            .select()
            .from(compatibleVehicles)
            .where(eq(compatibleVehicles.inventory_item_id, itemId))
            .where(eq(compatibleVehicles.make_id, makeId))
            .where(eq(compatibleVehicles.model_id, modelId))
            .limit(1);
          
          if (existingCompatibility.length === 0) {
            await db.insert(compatibleVehicles).values({
              inventory_item_id: itemId,
              make_id: makeId,
              model_id: modelId,
              year_from: vehicle.yearFrom || null,
              year_to: vehicle.yearTo || null,
              engine_code: vehicle.engineCode || null,
              source: "polcar_auto",
              confidence_score: 8,
              verified: false,
            });
          }
        }
        
        await db
          .update(inventoryItems)
          .set({ 
            compatibility_status: "found",
            last_compatibility_check: new Date()
          })
          .where(eq(inventoryItems.id, itemId));
        
        success = true;
      } else {
        await db
          .update(inventoryItems)
          .set({ 
            compatibility_status: "not_found",
            last_compatibility_check: new Date()
          })
          .where(eq(inventoryItems.id, itemId));
        
        success = true;
      }
      
      await db.insert(polcarLookupHistory).values({
        inventory_item_id: itemId,
        oem_number: oemNumber,
        search_url: searchUrl,
        polcar_response_html: html.substring(0, 50000), // Limit size
        extracted_vehicles: JSON.stringify(extractedVehicles),
        processing_time_ms: Date.now() - startTime,
        success: true,
      });

      await db.insert(activityLog).values({
        inventory_item_id: itemId,
        action_type: "polcar_lookup",
        new_value: `${extractedVehicles.length} biler funnet`,
      });
      
    } catch (error) {
      errorMessage = (error as Error).message;
      console.error("Polcar lookup error:", error);
      
      await db
        .update(inventoryItems)
        .set({ compatibility_status: "unchecked" })
        .where(eq(inventoryItems.id, itemId));

      await db.insert(polcarLookupHistory).values({
        inventory_item_id: itemId,
        oem_number: oemNumber,
        search_url: `https://catalog.polcar.com/search?q=${encodeURIComponent(oemNumber)}`,
        processing_time_ms: Date.now() - startTime,
        success: false,
        error_message: errorMessage,
      });
    }

    return NextResponse.json({
      success,
      vehiclesFound: extractedVehicles.length,
      error: success ? undefined : errorMessage,
      processingTime: Date.now() - startTime,
    });

  } catch (error) {
    console.error("Polcar check error:", error);
    return NextResponse.json({
      success: false,
      error: "Intern server feil"
    }, { status: 500 });
  }
}

// Bulk check endpoint
export async function PUT(request: NextRequest) {
  try {
    const { filter = "unchecked" } = await request.json();
    
    // Get items to check based on filter
    const items = await db
      .select({
        id: inventoryItems.id,
        delenummer_oem: inventoryItems.delenummer_oem,
      })
      .from(inventoryItems)
      .where(eq(inventoryItems.compatibility_status, filter))
      .limit(50); // Process in batches to avoid timeouts

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Ingen deler å sjekke",
        processed: 0,
        found: 0,
      });
    }

    let processed = 0;
    let found = 0;
    let errors = 0;

    for (const item of items) {
      if (item.delenummer_oem) {
        try {
          // Call the same POST endpoint internally
          const checkResponse = await POST(
            new NextRequest(`${request.url}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                itemId: item.id,
                oemNumber: item.delenummer_oem,
              }),
            })
          );
          
          const result = await checkResponse.json();
          if (result.success && result.vehiclesFound > 0) {
            found++;
          }
          processed++;
        } catch (error) {
          console.error(`Error checking item ${item.id}:`, error);
          errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Behandlet ${processed} deler, fant kompatibilitet for ${found} deler${errors > 0 ? `, ${errors} feil oppstått` : ''}`,
      processed,
      found,
      errors,
    });

  } catch (error) {
    console.error("Error in bulk Polcar check:", error);
    return NextResponse.json({
      success: false,
      error: "Feil ved massesjekking"
    }, { status: 500 });
  }
}