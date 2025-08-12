import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { parse } from 'csv-parse/sync';

config({ path: '.env.local' });

interface CSVRow {
  model: string;
  category: string;
  deler: string;
  lagerplass: string;
  antall: string;
  lagerkode: string;
  utpris_m_mva: string;
  evt_bestilltid: string;
  leverandor: string;
  delenummer_oem: string;
  leverandor_pa_lager: string;
  oem_alt: string;
  link: string;
  webshop_done: string;
  compatibility_status: string;
  manual_compatibility_override: string;
  created_at: string;
  updated_at: string;
}

// Utility functions for data cleaning
function cleanPrice(priceStr: string): number | null {
  if (!priceStr || priceStr.trim() === '') return null;
  
  // Remove Norwegian currency formatting and convert to number
  const cleaned = priceStr.replace(/[^\d,.-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function cleanText(text: string): string | null {
  if (!text || text.trim() === '' || text.trim() === 'NULL') return null;
  return text.trim();
}

function standardizeSupplier(supplier: string): string | null {
  if (!supplier) return null;
  
  return supplier
    .trim()
    .replace(/\//g, '/') // Normalize slashes
    .replace(/blic\/rhibo/gi, 'Blic/Rhibo')
    .replace(/srl\/max\/technorot/gi, 'SRL/Max/Technorot')
    .replace(/tekno\/srl\/lemf\/max/gi, 'Tekno/SRL/Lemf/Max')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function parseCarModel(modelStr: string): { make: string; model: string } | null {
  if (!modelStr) return null;
  
  const parts = modelStr.trim().split(/\s+/);
  if (parts.length >= 2) {
    const make = parts[0];
    const model = parts.slice(1).join(' ');
    return { make, model };
  }
  return null;
}

function cleanQuantity(quantityStr: string): number {
  const parsed = parseInt(quantityStr || '0');
  return isNaN(parsed) ? 0 : Math.max(0, parsed);
}

async function importData() {
  console.log('🚀 Starting data import...');
  
  try {
    // Connect to database
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    console.log('📖 Reading CSV file...');
    const csvContent = readFileSync('./data/inventory_data.csv', 'utf8');
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`📊 Found ${records.length} records to process`);

    // Step 1: Extract and normalize lookup values
    console.log('\n🔄 Step 1: Extracting and normalizing lookup values...');
    
    const categories = new Set<string>();
    const suppliers = new Set<string>();
    const carData = new Set<{make: string, model: string}>();

    records.forEach(record => {
      // Extract categories
      if (record.category && record.category.trim()) {
        categories.add(record.category.trim());
      }
      
      // Extract and normalize suppliers
      const supplier = standardizeSupplier(record.leverandor);
      if (supplier) {
        suppliers.add(supplier);
      }
      
      // Extract car makes/models
      const carModel = parseCarModel(record.model);
      if (carModel) {
        carData.add(carModel);
      }
    });

    console.log(`   ✓ Found ${categories.size} unique categories`);
    console.log(`   ✓ Found ${suppliers.size} unique suppliers`);
    console.log(`   ✓ Found ${carData.size} unique car makes/models`);

    // Step 2: Insert categories
    console.log('\n📝 Step 2: Inserting categories...');
    let categoryCount = 0;
    for (const category of categories) {
      try {
        await client.execute({
          sql: `INSERT OR IGNORE INTO part_categories (name, name_norwegian, is_active) VALUES (?, ?, ?)`,
          args: [category, category, true]
        });
        categoryCount++;
      } catch (error) {
        console.warn(`   ⚠️ Failed to insert category "${category}":`, error);
      }
    }
    console.log(`   ✅ Inserted ${categoryCount} categories`);

    // Step 3: Insert suppliers
    console.log('\n🏢 Step 3: Inserting suppliers...');
    let supplierCount = 0;
    for (const supplier of suppliers) {
      try {
        await client.execute({
          sql: `INSERT OR IGNORE INTO suppliers (name, is_active) VALUES (?, ?)`,
          args: [supplier, true]
        });
        supplierCount++;
      } catch (error) {
        console.warn(`   ⚠️ Failed to insert supplier "${supplier}":`, error);
      }
    }
    console.log(`   ✅ Inserted ${supplierCount} suppliers`);

    // Step 4: Insert car makes and models
    console.log('\n🚗 Step 4: Inserting car makes and models...');
    const makeModelMap = new Map<string, number>();
    let makeCount = 0;
    let modelCount = 0;

    for (const {make, model} of carData) {
      try {
        // Insert or get make
        const makeResult = await client.execute({
          sql: `INSERT OR IGNORE INTO car_makes (name, is_active) VALUES (?, ?)`,
          args: [make, true]
        });
        
        const makeIdResult = await client.execute({
          sql: `SELECT id FROM car_makes WHERE name = ?`,
          args: [make]
        });
        
        if (makeIdResult.rows.length > 0) {
          const makeId = makeIdResult.rows[0].id as number;
          
          // Insert model
          await client.execute({
            sql: `INSERT OR IGNORE INTO car_models (make_id, name, full_name, is_active) VALUES (?, ?, ?, ?)`,
            args: [makeId, model, model, true]
          });
          
          makeModelMap.set(`${make}:${model}`, makeId);
          modelCount++;
        }
        makeCount++;
      } catch (error) {
        console.warn(`   ⚠️ Failed to insert car make/model "${make} ${model}":`, error);
      }
    }
    console.log(`   ✅ Processed ${makeCount} car makes and ${modelCount} models`);

    // Step 5: Insert inventory items
    console.log('\n📦 Step 5: Inserting inventory items...');
    let itemCount = 0;
    let errorCount = 0;

    for (const record of records) {
      try {
        const cleanedRecord = {
          model: cleanText(record.model),
          category: cleanText(record.category),
          deler: cleanText(record.deler),
          lagerplass: cleanText(record.lagerplass),
          antall: cleanQuantity(record.antall),
          lagerkode: cleanText(record.lagerkode),
          utpris_m_mva: cleanPrice(record.utpris_m_mva),
          evt_bestilltid: cleanText(record.evt_bestilltid),
          leverandor: standardizeSupplier(record.leverandor),
          delenummer_oem: cleanText(record.delenummer_oem),
          leverandor_pa_lager: cleanText(record.leverandor_pa_lager),
          oem_alt: cleanText(record.oem_alt),
          link: cleanText(record.link),
          webshop_done: record.webshop_done === 'true' || record.webshop_done === '1',
          compatibility_status: 'unchecked',
          manual_compatibility_override: false,
        };

        await client.execute({
          sql: `INSERT INTO inventory_items (
            model, category, deler, lagerplass, antall, lagerkode, utpris_m_mva,
            evt_bestilltid, leverandor, delenummer_oem, leverandor_pa_lager,
            oem_alt, link, webshop_done, compatibility_status, manual_compatibility_override,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          args: [
            cleanedRecord.model, cleanedRecord.category, cleanedRecord.deler,
            cleanedRecord.lagerplass, cleanedRecord.antall, cleanedRecord.lagerkode,
            cleanedRecord.utpris_m_mva, cleanedRecord.evt_bestilltid, cleanedRecord.leverandor,
            cleanedRecord.delenummer_oem, cleanedRecord.leverandor_pa_lager, cleanedRecord.oem_alt,
            cleanedRecord.link, cleanedRecord.webshop_done, cleanedRecord.compatibility_status,
            cleanedRecord.manual_compatibility_override
          ]
        });
        
        itemCount++;
        
        if (itemCount % 10 === 0) {
          console.log(`   📊 Processed ${itemCount}/${records.length} items...`);
        }
        
      } catch (error) {
        errorCount++;
        console.warn(`   ⚠️ Failed to insert item "${record.deler}":`, error);
      }
    }

    console.log(`   ✅ Successfully inserted ${itemCount} inventory items`);
    if (errorCount > 0) {
      console.log(`   ⚠️ ${errorCount} items failed to import`);
    }

    // Step 6: Generate summary
    console.log('\n📊 Step 6: Import Summary');
    const stats = await Promise.all([
      client.execute('SELECT COUNT(*) as count FROM inventory_items'),
      client.execute('SELECT COUNT(*) as count FROM part_categories'),
      client.execute('SELECT COUNT(*) as count FROM suppliers'),
      client.execute('SELECT COUNT(*) as count FROM car_makes'),
      client.execute('SELECT COUNT(*) as count FROM car_models'),
      client.execute('SELECT COUNT(*) as count FROM inventory_items WHERE antall <= 2'),
      client.execute('SELECT COUNT(*) as count FROM inventory_items WHERE antall = 0'),
    ]);

    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   📦 Total inventory items: ${stats[0].rows[0].count}`);
    console.log(`   🏷️  Total categories: ${stats[1].rows[0].count}`);
    console.log(`   🏢 Total suppliers: ${stats[2].rows[0].count}`);
    console.log(`   🚗 Total car makes: ${stats[3].rows[0].count}`);
    console.log(`   🚙 Total car models: ${stats[4].rows[0].count}`);
    console.log(`   ⚠️  Low stock items (≤2): ${stats[5].rows[0].count}`);
    console.log(`   🚨 Out of stock items (0): ${stats[6].rows[0].count}`);
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🎉 Data import completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Visit http://localhost:3000/parts to view all imported parts');
    console.log('   2. Visit http://localhost:3000/search to test search functionality');
    console.log('   3. Visit http://localhost:3000/low-stock to see critical items');
    console.log('   4. Visit http://localhost:3000/settings to manage categories and suppliers');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importData();