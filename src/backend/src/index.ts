/*
 * @context: backend-entry
 * @depends: shared/types, backend/config, backend/database, backend/middleware/tenant, backend/routes/tenants
 * @exports: express server instance, health check endpoint, tenant-scoped routes, tenant management API
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; // ✅ ESM-safe way to get __dirname

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { database } from './database.js';
import tenantRoutes from './routes/tenants.js';
import { tenantMiddleware } from './middleware/tenant.js';

// ✅ Recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Force-load the .env file from the backend root, not dist/
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('🌍 Loaded environment from:', path.resolve(__dirname, '../.env'));
console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL);

const app = express();
const port = config.server.port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  const dbHealthy = await database.healthCheck();
  res.json({
    status: dbHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected',
  });
});

// Routes
app.use('/api/tenants', tenantRoutes);

// Tenant-scoped routes (require x-tenant-id header)
app.use('/api/tenant/*', tenantMiddleware, (req, res) => {
  res.json({ success: true, tenantId: req.tenantId });
});

// Start server
app.get('/', (_req, res) => {
  res.send('🚀 MultiCRM Backend is running!');
});

app.listen(port, () => {
  console.log(`🚀 MultiCRM Backend running on port ${port}`);
  console.log(`📊 Database: ${config.database.connectionString}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await database.close();
  process.exit(0);
});
