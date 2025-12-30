/**
 * @swagger
 * /api/waste/stats:
 *   get:
 *     summary: Get waste statistics and compliance metrics
 *     tags: [Waste]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Waste statistics retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();

    const totalWasteResult = await query(
      `SELECT 
        COALESCE(SUM(quantity_tons), 0) as total_quantity,
        COUNT(*) as total_records
       FROM waste_records`
    );

    const byTypeResult = await query(
      `SELECT 
        waste_type,
        COALESCE(SUM(quantity_tons), 0) as quantity,
        COUNT(*) as count
       FROM waste_records
       GROUP BY waste_type
       ORDER BY quantity DESC`
    );

    const byDisposalMethodResult = await query(
      `SELECT 
        disposal_method,
        COALESCE(SUM(quantity_tons), 0) as quantity,
        COUNT(*) as count
       FROM waste_records
       GROUP BY disposal_method
       ORDER BY quantity DESC`
    );

    const complianceResult = await query(
      `SELECT 
        regulatory_compliance,
        COUNT(*) as count
       FROM waste_records
       GROUP BY regulatory_compliance`
    );

    const bySiteResult = await query(
      `SELECT 
        site_name,
        COALESCE(SUM(quantity_tons), 0) as quantity,
        COUNT(*) as count
       FROM waste_records
       GROUP BY site_name
       ORDER BY quantity DESC
       LIMIT 10`
    );

    const diversionResult = await query(
      `SELECT 
        COALESCE(SUM(CASE 
          WHEN disposal_method IN ('Recycling', 'Composting') 
          THEN quantity_tons ELSE 0 
        END), 0) as diverted,
        COALESCE(SUM(quantity_tons), 0) as total
       FROM waste_records`
    );

    const monthlyTrendResult = await query(
      `SELECT 
        DATE_TRUNC('month', reporting_period_start) as month,
        COALESCE(SUM(quantity_tons), 0) as quantity
       FROM waste_records
       WHERE reporting_period_start >= NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', reporting_period_start)
       ORDER BY month ASC`
    );

    const stats = totalWasteResult.rows[0];
    const diversionStats = diversionResult.rows[0];
    
    const totalRecords = parseInt(stats.total_records);
    const compliantCount = complianceResult.rows.find(r => r.regulatory_compliance === 'Compliant')?.count || 0;
    const complianceRate = totalRecords > 0 ? (parseInt(compliantCount) / totalRecords) * 100 : 0;

    const diversionRate = parseFloat(diversionStats.total) > 0
      ? (parseFloat(diversionStats.diverted) / parseFloat(diversionStats.total)) * 100
      : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          overview: {
            total_quantity: parseFloat(stats.total_quantity),
            total_records: totalRecords,
            compliance_rate: complianceRate,
            diversion_rate: diversionRate
          },
          by_type: byTypeResult.rows.map(row => ({
            waste_type: row.waste_type,
            quantity: parseFloat(row.quantity),
            count: parseInt(row.count)
          })),
          by_disposal_method: byDisposalMethodResult.rows.map(row => ({
            disposal_method: row.disposal_method,
            quantity: parseFloat(row.quantity),
            count: parseInt(row.count)
          })),
          compliance: complianceResult.rows.map(row => ({
            status: row.regulatory_compliance,
            count: parseInt(row.count)
          })),
          by_site: bySiteResult.rows.map(row => ({
            site_name: row.site_name,
            quantity: parseFloat(row.quantity),
            count: parseInt(row.count)
          })),
          monthly_trend: monthlyTrendResult.rows.map(row => ({
            month: row.month,
            quantity: parseFloat(row.quantity)
          }))
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/waste/stats:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch waste statistics' },
      { status: 500 }
    );
  }
}