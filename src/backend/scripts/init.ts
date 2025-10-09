import { Pool } from 'pg';
import { config } from '../src/config.js';

async function initializeDatabase() {
  console.log('🗄️  Initializing MultiCRM database...');

  const pool = new Pool({
    connectionString: config.database.connectionString,
    ssl: config.database.ssl,
  });

  try {
    // Basic connectivity check
    console.log('📦 Checking database connection...');
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');

    // Ensure the "tenants" table exists
    console.log('🏢 Creating tenants table (if missing)...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        domain TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
      CREATE INDEX IF NOT EXISTS idx_tenants_created ON tenants(created_at);
    `);

    console.log('✅ Tenants table ready');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log('🎉 Database initialization complete!');
}

// Run directly via `npm run migrate` or similar
if (process.argv[1]?.endsWith('init.ts')) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { initializeDatabase };
