/**
 * @swagger
 * /api/waste:
 *   get:
 *     summary: Get all waste records
 *     tags: [Waste]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: site_name
 *         schema:
 *           type: string
 *       - in: query
 *         name: waste_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: regulatory_compliance
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
 *         description: Waste records retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new waste record
 *     tags: [Waste]
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
 *         description: Waste record created
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
import { validateWasteRecord } from '@/lib/validation';
import { generateWasteRecordId } from '@/lib/recordIdGenerator';

export async function GET(request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const site_name = searchParams.get('site_name');
    const waste_type = searchParams.get('waste_type');
    const regulatory_compliance = searchParams.get('regulatory_compliance');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `
      SELECT w.*, u.name as created_by_name
      FROM waste_records w
      LEFT JOIN users u ON w.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (site_name) {
      paramCount++;
      sql += ` AND w.site_name ILIKE $${paramCount}`;
      params.push(`%${site_name}%`);
    }

    if (waste_type) {
      paramCount++;
      sql += ` AND w.waste_type = $${paramCount}`;
      params.push(waste_type);
    }

    if (regulatory_compliance) {
      paramCount++;
      sql += ` AND w.regulatory_compliance = $${paramCount}`;
      params.push(regulatory_compliance);
    }

    sql += ` ORDER BY w.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query(
      'SELECT COUNT(*) as total FROM waste_records WHERE created_by = $1',
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
    console.error('Error in GET /api/waste:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch waste records' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validationErrors = validateWasteRecord(body);
    if (validationErrors) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }

    const wasteRecordId = await generateWasteRecordId();

    const result = await query(
      `INSERT INTO waste_records (
        waste_record_id, site_name, waste_type, quantity_tons, disposal_method,
        reporting_period_start, reporting_period_end, disposal_date, contractor_name,
        regulatory_compliance, remarks, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        wasteRecordId,
        body.site_name,
        body.waste_type,
        body.quantity_tons,
        body.disposal_method,
        body.reporting_period_start,
        body.reporting_period_end,
        body.disposal_date || null,
        body.contractor_name || null,
        body.regulatory_compliance,
        body.remarks || null,
        user.id
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Waste record created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/waste:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create waste record' },
      { status: 500 }
    );
  }
}