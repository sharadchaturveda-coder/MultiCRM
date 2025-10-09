import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { database } from '../database.js';
import { Tenant } from '@shared/index.js';


const router = Router();

// Create tenant
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, domain }: { name: string; domain: string } = req.body;

    if (!name || !domain) {
      return res.status(400).json({
        success: false,
        error: 'Name and domain are required'
      });
    }

    const tenantId = uuidv4();

    // Insert tenant into main tenants table
    const masterPool = database.getMasterPool();
    await masterPool.query(
      'INSERT INTO tenants (id, name, domain) VALUES ($1, $2, $3)',
      [tenantId, name, domain]
    );

    // Initialize tenant's database schema
    await database.getTenantPool(tenantId);

    const tenant: Tenant = {
      id: tenantId,
      name,
      domain,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: tenant,
      message: 'Tenant created successfully'
    });

  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get tenant by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.id;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }

    const masterPool = database.getMasterPool();
    const result = await masterPool.query(
      'SELECT * FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// List tenants
router.get('/', async (req: Request, res: Response) => {
  try {
    const masterPool = database.getMasterPool();
    const result = await masterPool.query(
      'SELECT * FROM tenants ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error listing tenants:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
