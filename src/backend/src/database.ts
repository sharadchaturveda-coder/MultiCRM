import { Pool, PoolConfig } from 'pg';
import { config } from './config';

class Database {
  private pools: Map<string, Pool> = new Map();
  private masterPool: Pool;

  constructor() {
    this.masterPool = new Pool(this.getPoolConfig('multicrm'));
    this.initializeMasterConnection();
  }

  private getPoolConfig(databaseName: string): PoolConfig {
    return {
      host: config.database.host,
      port: config.database.port,
      database: databaseName,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl,
      max: 20,
      idleTimeoutMillis: 30000,
    };
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

  // Create tenant-specific schema and database connection
  async getTenantPool(tenantId: string): Promise<Pool> {
    if (this.pools.has(tenantId)) {
      return this.pools.get(tenantId)!;
    }

    // Create schema-specific database for tenant
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;

    try {
      // Create schema if it doesn't exist
      await this.masterPool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

      // Create tables in the new schema (this would be migration scripts)
      await this.createTenantTables(schemaName);

      // Create a pool for this tenant's schema
      const tenantPool = new Pool({
        ...this.getPoolConfig('multicrm'),
        schema: schemaName,
        searchPath: schemaName,
      });

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
      // Users table
      `CREATE TABLE IF NOT EXISTS ${schemaName}.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Contacts table
      `CREATE TABLE IF NOT EXISTS ${schemaName}.contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES ${schemaName}.users(id),
        organization_id UUID,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Organizations table
      `CREATE TABLE IF NOT EXISTS ${schemaName}.organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        industry TEXT,
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Update contacts to reference organizations
      `ALTER TABLE ${schemaName}.contacts
       ADD CONSTRAINT fk_contacts_organization
       FOREIGN KEY (organization_id) REFERENCES ${schemaName}.organizations(id)`,

      // Leads table
      `CREATE TABLE IF NOT EXISTS ${schemaName}.leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID REFERENCES ${schemaName}.organizations(id),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        status TEXT DEFAULT 'new',
        source TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Tasks table
      `CREATE TABLE IF NOT EXISTS ${schemaName}.tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES ${schemaName}.users(id),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo',
        due_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_users_email ON ${schemaName}.users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_contacts_user ON ${schemaName}.contacts(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_leads_organization ON ${schemaName}.leads(organization_id)`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_user ON ${schemaName}.tasks(user_id)`,
    ];

    for (const query of queries) {
      await this.masterPool.query(query);
    }
  }

  // Get master pool for cross-tenant operations
  getMasterPool(): Pool {
    return this.masterPool;
  }

  // Cleanup method
  async close() {
    await Promise.all([
      this.masterPool.end(),
      ...Array.from(this.pools.values()).map(pool => pool.end())
    ]);
  }

  // Health check
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
