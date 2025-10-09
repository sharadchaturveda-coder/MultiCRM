import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { database } from './database';
import tenantRoutes from './routes/tenants';
import { tenantMiddleware } from './middleware/tenant';
const app = express();
const port = config.port;
// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
// Health check endpoint
app.get('/health', async (_req, res) => {
    const dbHealthy = await database.healthCheck();
    res.json({
        status: dbHealthy ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        database: dbHealthy ? 'connected' : 'disconnected'
    });
});
// Routes
app.use('/api/tenants', tenantRoutes);
// Tenant-scoped routes (require x-tenant-id header)
app.use('/api/tenant/*', tenantMiddleware, (req, res) => {
    res.json({ success: true, tenantId: req.tenantId });
});
// Start server
app.listen(port, () => {
    console.log(`🚀 MultiCRM Backend running on port ${port}`);
    console.log(`📊 Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
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
