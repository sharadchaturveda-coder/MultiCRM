import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
class Database {
    pools = new Map();
    masterPool;
    constructor() {
        // ✅ Render requires SSL for hosted Postgres
        this.masterPool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
        });
        this.initializeMasterConnection();
    }
    async initializeMasterConnection() {
        try {
            await this.masterPool.query('SELECT 1');
            console.log(`📊 Database: ${process.env.DATABASE_URL}`);
            console.log('✅ Master database connection established');
        }
        catch (error) {
            console.error('❌ Master database connection failed:', error);
            process.exit(1);
        }
    }
    async getTenantPool(tenantId) {
        if (this.pools.has(tenantId)) {
            return this.pools.get(tenantId);
        }
        const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
        try {
            await this.masterPool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
            await this.createTenantTables(schemaName);
            const tenantPool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false },
            });
            await tenantPool.query(`SET search_path TO ${schemaName}`);
            this.pools.set(tenantId, tenantPool);
            console.log(`✅ Created tenant pool for ${tenantId}`);
            return tenantPool;
        }
        catch (error) {
            console.error(`❌ Failed to create tenant pool for ${tenantId}:`, error);
            throw error;
        }
    }
    async createTenantTables(schemaName) {
        const queries = [
            // 🧱 Users table
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
            // 🧱 Contacts table
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
            // 🧱 Organizations table
            `CREATE TABLE IF NOT EXISTS ${schemaName}.organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        industry TEXT,
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
            // 🧱 Update contacts to reference organizations
            `ALTER TABLE ${schemaName}.contacts
       ADD CONSTRAINT fk_contacts_organization
       FOREIGN KEY (organization_id) REFERENCES ${schemaName}.organizations(id)
       ON DELETE SET NULL`,
            // 🧱 Leads table
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
            // 🧱 Tasks table
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
            // ⚡ Indexes for performance
            `CREATE INDEX IF NOT EXISTS idx_users_email ON ${schemaName}.users(email)`,
            `CREATE INDEX IF NOT EXISTS idx_contacts_user ON ${schemaName}.contacts(user_id)`,
            `CREATE INDEX IF NOT EXISTS idx_leads_organization ON ${schemaName}.leads(organization_id)`,
            `CREATE INDEX IF NOT EXISTS idx_tasks_user ON ${schemaName}.tasks(user_id)`
        ];
        for (const query of queries) {
            await this.masterPool.query(query);
        }
    }
    getMasterPool() {
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
        }
        catch {
            return false;
        }
    }
}
export const database = new Database();
