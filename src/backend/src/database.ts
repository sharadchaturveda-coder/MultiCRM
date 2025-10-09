import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private pools: Map<string, Pool> = new Map();
  private masterPool: Pool;

  constructor() {
    // use the verified connection string
    this.masterPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.initializeMasterConnection();
  }

  private async initializeMasterConnection() {
    try {
      await this.masterPool.query('SELECT 1');
      console.log('✅ Master database connection established');
    } catch (error) {
      console.error('❌ Master database connection failed:', error);
      process.exit(1);
    }
  }

  async getTenantPool(tenantId: string): Promise<Pool> {
    if (this.pools.has(tenantId)) {
      return this.pools.get(tenantId)!;
    }

    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    try {
      await this.masterPool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
      await this.createTenantTables(schemaName);

      const tenantPool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      await tenantPool.query(`SET search_path TO ${schemaName}`);

      this.pools.set(tenantId, tenantPool);
      console.log(`✅ Created tenant pool for ${tenantId}`);
      return tenantPool;
    } catch (error) {
      console.error(`❌ Failed to create tenant pool for ${tenantId}:`, error);
      throw error;
    }
  }

  private async createTenantTables(schemaName: string) {
    const queries = [
      `CREATE TABLE IF NOT EXISTS ${schemaName}.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
      // ... keep the rest of your table creation statements unchanged
    ];
    for (const q of queries) await this.masterPool.query(q);
  }

  getMasterPool(): Pool {
    return this.masterPool;
  }

  async close() {
    await Promise.all([
      this.masterPool.end(),
      ...Array.from(this.pools.values()).map(pool => pool.end())
    ]);
  }

  async healthCheck() {
    try {
      await this.masterPool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

export const database = new Database();
