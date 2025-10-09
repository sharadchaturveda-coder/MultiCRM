import { Pool } from 'pg';
import { config } from '../src/config.js';

async function initializeDatabase() {
  console.log('🗄️  Initializing MultiCRM database...');

  const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name || 'postgres',
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl || false
  });

  try {
    // Create database if it doesn't exist
    console.log('📦 Creating database...');
    await pool.query(`CREATE DATABASE ${config.database.name} WITH OWNER = $1`, [config.database.user]);

    console.log('✅ Database created successfully');

    // Create tenants table in the new database
    const dbPool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl || false
    });

    console.log('🏢 Creating tenants table...');
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
      CREATE INDEX IF NOT EXISTS idx_tenants_created ON tenants(created_at);
    `);

    await dbPool.end();
    console.log('✅ Tenants table created successfully');

  } catch (error: any) {
    if (error.code === '42P04') {
      console.log('ℹ️  Database already exists, skipping creation');
    } else {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  } finally {
    await pool.end();
  }

  console.log('🎉 Database initialization complete!');
}

// Run if called directly
if (process.argv[1]?.endsWith('init.ts')) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { initializeDatabase };
