import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryItems, carMakes, compatibleVehicles } from "@/db/schema";
import { sql, eq, isNull, isNotNull } from "drizzle-orm";

export async function GET() {
  try {
    // Get total parts count
    const totalPartsQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryItems);

    // Get low stock parts count (≤ 2)
    const lowStockQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryItems)
      .where(sql`${inventoryItems.antall} <= 2`);

    // Get unchecked parts count
    const uncheckedPartsQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryItems)
      .where(eq(inventoryItems.compatibility_status, "unchecked"));

    // Get total car makes count
    const totalMakesQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(carMakes)
      .where(eq(carMakes.is_active, true));

    // Get top car make by finding most common make name in inventory model field
    const topMakeQuery = await db
      .select({
        make: sql<string>`CASE 
          WHEN ${inventoryItems.model} LIKE '%Toyota%' THEN 'Toyota'
          WHEN ${inventoryItems.model} LIKE '%BMW%' THEN 'BMW'
          WHEN ${inventoryItems.model} LIKE '%Mercedes%' THEN 'Mercedes'
          WHEN ${inventoryItems.model} LIKE '%Audi%' THEN 'Audi'
          WHEN ${inventoryItems.model} LIKE '%Volkswagen%' OR ${inventoryItems.model} LIKE '%VW%' THEN 'Volkswagen'
          WHEN ${inventoryItems.model} LIKE '%Ford%' THEN 'Ford'
          WHEN ${inventoryItems.model} LIKE '%Opel%' THEN 'Opel'
          WHEN ${inventoryItems.model} LIKE '%Volvo%' THEN 'Volvo'
          WHEN ${inventoryItems.model} LIKE '%Peugeot%' THEN 'Peugeot'
          WHEN ${inventoryItems.model} LIKE '%Renault%' THEN 'Renault'
          ELSE 'Andre'
        END`,
        count: sql<number>`count(*)`
      })
      .from(inventoryItems)
      .where(sql`${inventoryItems.model} IS NOT NULL`)
      .groupBy(sql`CASE 
        WHEN ${inventoryItems.model} LIKE '%Toyota%' THEN 'Toyota'
        WHEN ${inventoryItems.model} LIKE '%BMW%' THEN 'BMW'
        WHEN ${inventoryItems.model} LIKE '%Mercedes%' THEN 'Mercedes'
        WHEN ${inventoryItems.model} LIKE '%Audi%' THEN 'Audi'
        WHEN ${inventoryItems.model} LIKE '%Volkswagen%' OR ${inventoryItems.model} LIKE '%VW%' THEN 'Volkswagen'
        WHEN ${inventoryItems.model} LIKE '%Ford%' THEN 'Ford'
        WHEN ${inventoryItems.model} LIKE '%Opel%' THEN 'Opel'
        WHEN ${inventoryItems.model} LIKE '%Volvo%' THEN 'Volvo'
        WHEN ${inventoryItems.model} LIKE '%Peugeot%' THEN 'Peugeot'
        WHEN ${inventoryItems.model} LIKE '%Renault%' THEN 'Renault'
        ELSE 'Andre'
      END`)
      .orderBy(sql`count(*) DESC`)
      .limit(1);

    const [totalParts, lowStockParts, uncheckedParts, totalMakes, topMakeResult] = await Promise.all([
      totalPartsQuery,
      lowStockQuery,
      uncheckedPartsQuery,
      totalMakesQuery,
      topMakeQuery
    ]);

    // Enhanced Business Intelligence Stats
    
    // Financial Overview
    const totalInventoryValueQuery = await db
      .select({ 
        totalValue: sql<number>`COALESCE(SUM(${inventoryItems.antall} * ${inventoryItems.utpris_m_mva}), 0)`,
        avgValue: sql<number>`COALESCE(AVG(${inventoryItems.utpris_m_mva}), 0)`,
        zeroPriceParts: sql<number>`COUNT(CASE WHEN ${inventoryItems.utpris_m_mva} IS NULL OR ${inventoryItems.utpris_m_mva} = 0 THEN 1 END)`,
        highValueParts: sql<number>`COUNT(CASE WHEN ${inventoryItems.utpris_m_mva} > 1000 THEN 1 END)`
      })
      .from(inventoryItems);

    // Top Categories
    const topCategoriesQuery = await db
      .select({
        category: inventoryItems.category,
        count: sql<number>`COUNT(*)`,
        totalValue: sql<number>`COALESCE(SUM(${inventoryItems.antall} * ${inventoryItems.utpris_m_mva}), 0)`
      })
      .from(inventoryItems)
      .where(isNotNull(inventoryItems.category))
      .groupBy(inventoryItems.category)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(3);

    // Top Suppliers
    const topSuppliersQuery = await db
      .select({
        supplier: inventoryItems.leverandor,
        count: sql<number>`COUNT(*)`,
        totalValue: sql<number>`COALESCE(SUM(${inventoryItems.antall} * ${inventoryItems.utpris_m_mva}), 0)`
      })
      .from(inventoryItems)
      .where(isNotNull(inventoryItems.leverandor))
      .groupBy(inventoryItems.leverandor)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(3);

    // Missing Data Counts
    const missingDataQuery = await db
      .select({
        noCategoryCount: sql<number>`COUNT(CASE WHEN ${inventoryItems.category} IS NULL THEN 1 END)`,
        noSupplierCount: sql<number>`COUNT(CASE WHEN ${inventoryItems.leverandor} IS NULL THEN 1 END)`,
        noOEMCount: sql<number>`COUNT(CASE WHEN ${inventoryItems.delenummer_oem} IS NULL OR ${inventoryItems.delenummer_oem} = '' THEN 1 END)`,
        noModelCount: sql<number>`COUNT(CASE WHEN ${inventoryItems.model} IS NULL OR ${inventoryItems.model} = '' THEN 1 END)`
      })
      .from(inventoryItems);

    // Stock Distribution
    const stockDistributionQuery = await db
      .select({
        zeroStock: sql<number>`COUNT(CASE WHEN ${inventoryItems.antall} = 0 THEN 1 END)`,
        lowStock: sql<number>`COUNT(CASE WHEN ${inventoryItems.antall} BETWEEN 1 AND 5 THEN 1 END)`,
        goodStock: sql<number>`COUNT(CASE WHEN ${inventoryItems.antall} > 5 THEN 1 END)`
      })
      .from(inventoryItems);

    // Vehicle Compatibility Stats
    const compatibilityStatsQuery = await db
      .select({
        totalCompatibleParts: sql<number>`COUNT(DISTINCT ${compatibleVehicles.inventory_item_id})`,
        totalCompatibilityRecords: sql<number>`COUNT(*)`,
        manualRecords: sql<number>`COUNT(CASE WHEN ${compatibleVehicles.source} = 'manual' THEN 1 END)`,
        polcarRecords: sql<number>`COUNT(CASE WHEN ${compatibleVehicles.source} = 'polcar_auto' THEN 1 END)`
      })
      .from(compatibleVehicles);

    // Execute all queries in parallel
    const [
      financialData,
      topCategories,
      topSuppliers,
      missingData,
      stockDistribution,
      compatibilityStats
    ] = await Promise.all([
      totalInventoryValueQuery,
      topCategoriesQuery,
      topSuppliersQuery,
      missingDataQuery,
      stockDistributionQuery,
      compatibilityStatsQuery
    ]);

    const basicStats = {
      totalParts: totalParts[0]?.count || 0,
      lowStockParts: lowStockParts[0]?.count || 0,
      uncheckedParts: uncheckedParts[0]?.count || 0,
      totalMakes: totalMakes[0]?.count || 0,
      topMake: topMakeResult[0]?.make && topMakeResult[0].make !== 'Andre' ? topMakeResult[0].make : undefined
    };

    const enhancedStats = {
      ...basicStats,
      // Financial Card Data
      financial: {
        totalInventoryValue: Math.round(financialData[0]?.totalValue || 0),
        averagePartValue: Math.round(financialData[0]?.avgValue || 0),
        zeroPriceParts: financialData[0]?.zeroPriceParts || 0,
        highValueParts: financialData[0]?.highValueParts || 0
      },
      // Categories & Suppliers Card Data
      distribution: {
        topCategories: topCategories.map(c => ({
          name: c.category,
          count: c.count,
          value: Math.round(c.totalValue),
          percentage: Math.round((c.count / (totalParts[0]?.count || 1)) * 100)
        })),
        topSuppliers: topSuppliers.map(s => ({
          name: s.supplier,
          count: s.count,
          value: Math.round(s.totalValue),
          percentage: Math.round((s.count / (totalParts[0]?.count || 1)) * 100)
        })),
        missingData: {
          noCategory: missingData[0]?.noCategoryCount || 0,
          noSupplier: missingData[0]?.noSupplierCount || 0,
          noOEM: missingData[0]?.noOEMCount || 0,
          noModel: missingData[0]?.noModelCount || 0
        }
      },
      // Vehicle Compatibility Card Data
      compatibility: {
        stockDistribution: {
          zeroStock: stockDistribution[0]?.zeroStock || 0,
          lowStock: stockDistribution[0]?.lowStock || 0,
          goodStock: stockDistribution[0]?.goodStock || 0
        },
        vehicleData: {
          partsWithCompatibility: compatibilityStats[0]?.totalCompatibleParts || 0,
          totalCompatibilityRecords: compatibilityStats[0]?.totalCompatibilityRecords || 0,
          manualRecords: compatibilityStats[0]?.manualRecords || 0,
          polcarRecords: compatibilityStats[0]?.polcarRecords || 0
        }
      }
    };

    return NextResponse.json(enhancedStats);

  } catch (error) {
    console.error("Error loading dashboard stats:", error);
    return NextResponse.json(
      { 
        totalParts: 0,
        lowStockParts: 0,
        uncheckedParts: 0,
        totalMakes: 0
      },
      { status: 500 }
    );
  }
}