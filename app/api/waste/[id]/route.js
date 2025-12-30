/**
 * @swagger
 * /api/waste/{id}:
 *   get:
 *     summary: Get waste record by ID
 *     tags: [Waste]
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
 *         description: Waste record retrieved
 *       404:
 *         description: Waste record not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update waste record
 *     tags: [Waste]
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
 *         description: Waste record updated
 *       404:
 *         description: Waste record not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete waste record
 *     tags: [Waste]
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
 *         description: Waste record deleted
 *       404:
 *         description: Waste record not found
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';
import { validateWasteRecord } from '@/lib/validation';

export async function GET(request, { params }) {
  try {
    await requireAuth();
    const { id } = await params;

    const result = await query(
      `SELECT w.*, u.name as created_by_name
       FROM waste_records w
       LEFT JOIN users u ON w.created_by = u.id
       WHERE w.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Waste record not found' },
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
    console.error('Error in GET /api/waste/[id]:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch waste record' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    const validationErrors = validateWasteRecord(body);
    if (validationErrors) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }

    const existingRecord = await query(
      'SELECT created_by FROM waste_records WHERE id = $1',
      [id]
    );

    if (existingRecord.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Waste record not found' },
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
      `UPDATE waste_records SET
        site_name = $1,
        waste_type = $2,
        quantity_tons = $3,
        disposal_method = $4,
        reporting_period_start = $5,
        reporting_period_end = $6,
        disposal_date = $7,
        contractor_name = $8,
        regulatory_compliance = $9,
        remarks = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING *`,
      [
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
        id
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'Waste record updated successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/waste/[id]:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update waste record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existingRecord = await query(
      'SELECT created_by FROM waste_records WHERE id = $1',
      [id]
    );

    if (existingRecord.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Waste record not found' },
        { status: 404 }
      );
    }

    if (existingRecord.rows[0].created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own records' },
        { status: 403 }
      );
    }

    await query('DELETE FROM waste_records WHERE id = $1', [id]);

    return NextResponse.json(
      {
        success: true,
        message: 'Waste record deleted successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/waste/[id]:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete waste record' },
      { status: 500 }
    );
  }
}