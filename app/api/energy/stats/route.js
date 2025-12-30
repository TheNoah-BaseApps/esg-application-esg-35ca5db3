/**
 * @swagger
 * /api/energy/stats:
 *   get:
 *     summary: Get energy statistics and analytics
 *     tags: [Energy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Energy statistics retrieved
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

    const totalConsumptionResult = await query(
      `SELECT 
        COALESCE(SUM(consumption_mwh), 0) as total_consumption,
        COALESCE(SUM(cost), 0) as total_cost,
        COUNT(*) as total_records
       FROM energy_records`
    );

    const byTypeResult = await query(
      `SELECT 
        energy_type,
        COALESCE(SUM(consumption_mwh), 0) as consumption,
        COALESCE(SUM(cost), 0) as cost,
        COUNT(*) as count
       FROM energy_records
       GROUP BY energy_type
       ORDER BY consumption DESC`
    );

    const bySiteResult = await query(
      `SELECT 
        site_name,
        COALESCE(SUM(consumption_mwh), 0) as consumption,
        COALESCE(SUM(cost), 0) as cost,
        COUNT(*) as count
       FROM energy_records
       GROUP BY site_name
       ORDER BY consumption DESC
       LIMIT 10`
    );

    const reductionTargetsResult = await query(
      `SELECT 
        COUNT(*) as total_with_targets,
        COALESCE(SUM(reduction_target_mwh), 0) as total_target,
        COALESCE(SUM(consumption_mwh), 0) as total_consumption,
        COALESCE(SUM(CASE 
          WHEN reduction_target_mwh > 0 AND consumption_mwh <= reduction_target_mwh 
          THEN 1 ELSE 0 
        END), 0) as targets_met
       FROM energy_records
       WHERE reduction_target_mwh IS NOT NULL AND reduction_target_mwh > 0`
    );

    const monthlyTrendResult = await query(
      `SELECT 
        DATE_TRUNC('month', reporting_period_start) as month,
        COALESCE(SUM(consumption_mwh), 0) as consumption,
        COALESCE(SUM(cost), 0) as cost
       FROM energy_records
       WHERE reporting_period_start >= NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', reporting_period_start)
       ORDER BY month ASC`
    );

    const stats = totalConsumptionResult.rows[0];
    const reductionStats = reductionTargetsResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          overview: {
            total_consumption: parseFloat(stats.total_consumption),
            total_cost: parseFloat(stats.total_cost),
            total_records: parseInt(stats.total_records),
            average_cost_per_mwh: stats.total_consumption > 0 
              ? parseFloat(stats.total_cost) / parseFloat(stats.total_consumption)
              : 0
          },
          by_type: byTypeResult.rows.map(row => ({
            energy_type: row.energy_type,
            consumption: parseFloat(row.consumption),
            cost: parseFloat(row.cost),
            count: parseInt(row.count)
          })),
          by_site: bySiteResult.rows.map(row => ({
            site_name: row.site_name,
            consumption: parseFloat(row.consumption),
            cost: parseFloat(row.cost),
            count: parseInt(row.count)
          })),
          reduction_targets: {
            total_with_targets: parseInt(reductionStats.total_with_targets),
            total_target: parseFloat(reductionStats.total_target),
            total_consumption: parseFloat(reductionStats.total_consumption),
            targets_met: parseInt(reductionStats.targets_met),
            achievement_rate: reductionStats.total_with_targets > 0
              ? (parseInt(reductionStats.targets_met) / parseInt(reductionStats.total_with_targets)) * 100
              : 0
          },
          monthly_trend: monthlyTrendResult.rows.map(row => ({
            month: row.month,
            consumption: parseFloat(row.consumption),
            cost: parseFloat(row.cost)
          }))
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/energy/stats:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch energy statistics' },
      { status: 500 }
    );
  }
}