import { Request, Response, NextFunction } from 'express';
import { database } from '../database';

// Extend Express Request to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantPool?: any;
    }
  }
}

// Tenant middleware - extracts tenant ID from header and sets up database pool
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID required in x-tenant-id header'
      });
    }

    // Validate tenant exists in master database
    const masterPool = database.getMasterPool();
    const tenantResult = await masterPool.query(
      'SELECT id FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    // Get or create tenant's database pool
    req.tenantPool = await database.getTenantPool(tenantId);
    req.tenantId = tenantId;

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
