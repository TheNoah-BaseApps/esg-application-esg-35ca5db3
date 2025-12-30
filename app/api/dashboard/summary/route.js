/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved
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

    const energyStatsResult = await query(
      `SELECT 
        COALESCE(SUM(consumption_mwh), 0) as total_consumption,
        COALESCE(SUM(cost), 0) as total_cost,
        COUNT(*) as total_records,
        COUNT(DISTINCT site_name) as site_count
       FROM energy_records`
    );

    const wasteStatsResult = await query(
      `SELECT 
        COALESCE(SUM(quantity_tons), 0) as total_quantity,
        COUNT(*) as total_records
       FROM waste_records`
    );

    const wasteComplianceResult = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN regulatory_compliance = 'Compliant' THEN 1 ELSE 0 END) as compliant
       FROM waste_records`
    );

    const sitesResult = await query(
      `SELECT COUNT(DISTINCT site_name) as total_sites
       FROM (
         SELECT site_name FROM energy_records
         UNION
         SELECT site_name FROM waste_records
       ) as all_sites`
    );

    const recentEnergyResult = await query(
      `SELECT energy_record_id, site_name, consumption_mwh, created_at
       FROM energy_records
       ORDER BY created_at DESC
       LIMIT 5`
    );

    const recentWasteResult = await query(
      `SELECT waste_record_id, site_name, quantity_tons, regulatory_compliance, created_at
       FROM waste_records
       ORDER BY created_at DESC
       LIMIT 5`
    );

    const energyStats = energyStatsResult.rows[0];
    const wasteStats = wasteStatsResult.rows[0];
    const wasteCompliance = wasteComplianceResult.rows[0];
    const sites = sitesResult.rows[0];

    const complianceRate = parseInt(wasteCompliance.total) > 0
      ? (parseInt(wasteCompliance.compliant) / parseInt(wasteCompliance.total)) * 100
      : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          energy: {
            total_consumption: parseFloat(energyStats.total_consumption),
            total_cost: parseFloat(energyStats.total_cost),
            total_records: parseInt(energyStats.total_records)
          },
          waste: {
            total_quantity: parseFloat(wasteStats.total_quantity),
            total_records: parseInt(wasteStats.total_records),
            compliance_rate: complianceRate
          },
          sites: {
            total_sites: parseInt(sites.total_sites)
          },
          recent_energy: recentEnergyResult.rows.map(row => ({
            id: row.energy_record_id,
            site_name: row.site_name,
            consumption: parseFloat(row.consumption_mwh),
            created_at: row.created_at
          })),
          recent_waste: recentWasteResult.rows.map(row => ({
            id: row.waste_record_id,
            site_name: row.site_name,
            quantity: parseFloat(row.quantity_tons),
            compliance: row.regulatory_compliance,
            created_at: row.created_at
          }))
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/dashboard/summary:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}