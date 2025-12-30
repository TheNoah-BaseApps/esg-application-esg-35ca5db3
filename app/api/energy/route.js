/**
 * @swagger
 * /api/energy:
 *   get:
 *     summary: Get all energy records
 *     tags: [Energy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: site_name
 *         schema:
 *           type: string
 *       - in: query
 *         name: energy_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Energy records retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new energy record
 *     tags: [Energy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Energy record created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateEnergyRecord } from '@/lib/validation';
import { generateEnergyRecordId } from '@/lib/recordIdGenerator';

export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const site_name = searchParams.get('site_name');
    const energy_type = searchParams.get('energy_type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT e.*, u.name as created_by_name
      FROM energy_records e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (site_name) {
      paramCount++;
      sql += ` AND e.site_name ILIKE $${paramCount}`;
      params.push(`%${site_name}%`);
    }

    if (energy_type) {
      paramCount++;
      sql += ` AND e.energy_type = $${paramCount}`;
      params.push(energy_type);
    }

    sql += ` ORDER BY e.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query(
      'SELECT COUNT(*) as total FROM energy_records WHERE created_by = $1',
      [user.id]
    );
    const total = parseInt(countResult.rows[0]?.total || 0);

    return NextResponse.json(
      {
        success: true,
        data: {
          records: result.rows,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/energy:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch energy records' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validationErrors = validateEnergyRecord(body);
    if (validationErrors) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }

    const energyRecordId = await generateEnergyRecordId();

    const result = await query(
      `INSERT INTO energy_records (
        energy_record_id, site_name, reporting_period_start, reporting_period_end,
        energy_type, consumption_mwh, cost, supplier_name, energy_source_mix,
        reduction_target_mwh, remarks, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        energyRecordId,
        body.site_name,
        body.reporting_period_start,
        body.reporting_period_end,
        body.energy_type,
        body.consumption_mwh,
        body.cost || null,
        body.supplier_name || null,
        body.energy_source_mix || null,
        body.reduction_target_mwh || null,
        body.remarks || null,
        user.id
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Energy record created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/energy:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create energy record' },
      { status: 500 }
    );
  }
}