'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import ChartWidget from '@/components/dashboard/ChartWidget';
import { Zap, Trash2, Building2, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/summary');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your ESG performance and environmental metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Energy Consumption"
          value={`${formatNumber(data?.energy?.total_consumption || 0)} MWh`}
          icon={Zap}
          trend="+12.5%"
          trendUp={false}
        />
        <StatCard
          title="Energy Cost"
          value={formatCurrency(data?.energy?.total_cost || 0)}
          icon={DollarSign}
          trend="+8.2%"
          trendUp={false}
        />
        <StatCard
          title="Waste Generated"
          value={`${formatNumber(data?.waste?.total_quantity || 0)} tons`}
          icon={Trash2}
          trend="-5.3%"
          trendUp={true}
        />
        <StatCard
          title="Compliance Rate"
          value={`${formatNumber(data?.waste?.compliance_rate || 0, 1)}%`}
          icon={CheckCircle2}
          trend="+3.1%"
          trendUp={true}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Total Sites"
          value={data?.sites?.total_sites || 0}
          icon={Building2}
        />
        <StatCard
          title="Energy Records"
          value={data?.energy?.total_records || 0}
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Recent Energy Records"
          data={data?.recent_energy || []}
          type="energy"
        />
        <ChartWidget
          title="Recent Waste Records"
          data={data?.recent_waste || []}
          type="waste"
        />
      </div>
    </div>
  );
}