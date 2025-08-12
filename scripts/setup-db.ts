import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to Turso database...');
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });

    console.log('📖 Reading migration file...');
    const migration = readFileSync('./drizzle/0000_closed_exodus.sql', 'utf8');
    
    // Split the migration into individual statements
    const statements = migration
      .split('--> statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('-->'));

    console.log(`🚀 Executing ${statements.length} migration statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        await client.execute(statement);
      }
    }

    console.log('✅ Database setup completed successfully!');
    console.log('📊 Created tables:');
    console.log('   • inventory_items (main parts table)');
    console.log('   • part_categories (standardized categories)');
    console.log('   • suppliers (contact information)');
    console.log('   • car_makes (vehicle manufacturers)');
    console.log('   • car_models (vehicle models)');
    console.log('   • compatible_vehicles (parts-to-vehicle mapping)');
    console.log('   • polcar_lookup_history (API call audit trail)');
    console.log('   • activity_log (user actions tracking)');
    console.log('   • system_settings (application configuration)');

    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    const result = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    console.log('📋 Tables in database:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.name}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();