/**
 * @swagger
 * /api/energy/{id}:
 *   get:
 *     summary: Get energy record by ID
 *     tags: [Energy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Energy record retrieved
 *       404:
 *         description: Energy record not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update energy record
 *     tags: [Energy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Energy record updated
 *       404:
 *         description: Energy record not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete energy record
 *     tags: [Energy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Energy record deleted
 *       404:
 *         description: Energy record not found
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateEnergyRecord } from '@/lib/validation';

export async function GET(request, { params }) {
  try {
    await requireAuth();
    const { id } = await params;

    const result = await query(
      `SELECT e.*, u.name as created_by_name
       FROM energy_records e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Energy record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/energy/[id]:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch energy record' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const validationErrors = validateEnergyRecord(body);
    if (validationErrors) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }

    const existingRecord = await query(
      'SELECT created_by FROM energy_records WHERE id = $1',
      [id]
    );

    if (existingRecord.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Energy record not found' },
        { status: 404 }
      );
    }

    if (existingRecord.rows[0].created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only modify your own records' },
        { status: 403 }
      );
    }

    const result = await query(
      `UPDATE energy_records SET
        site_name = $1,
        reporting_period_start = $2,
        reporting_period_end = $3,
        energy_type = $4,
        consumption_mwh = $5,
        cost = $6,
        supplier_name = $7,
        energy_source_mix = $8,
        reduction_target_mwh = $9,
        remarks = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING *`,
      [
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
        id
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Energy record updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/energy/[id]:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update energy record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existingRecord = await query(
      'SELECT created_by FROM energy_records WHERE id = $1',
      [id]
    );

    if (existingRecord.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Energy record not found' },
        { status: 404 }
      );
    }

    if (existingRecord.rows[0].created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own records' },
        { status: 403 }
      );
    }

    await query('DELETE FROM energy_records WHERE id = $1', [id]);

    return NextResponse.json(
      {
        success: true,
        message: 'Energy record deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/energy/[id]:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete energy record' },
      { status: 500 }
    );
  }
}