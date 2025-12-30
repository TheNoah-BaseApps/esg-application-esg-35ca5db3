'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TrendChart from '@/components/analytics/TrendChart';
import ComparisonChart from '@/components/analytics/ComparisonChart';
import TargetVsActualChart from '@/components/analytics/TargetVsActualChart';

export default function AnalyticsPage() {
  const [energyStats, setEnergyStats] = useState(null);
  const [wasteStats, setWasteStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [energyResponse, wasteResponse] = await Promise.all([
        fetch('/api/energy/stats'),
        fetch('/api/waste/stats')
      ]);

      if (!energyResponse.ok || !wasteResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const energyData = await energyResponse.json();
      const wasteData = await wasteResponse.json();

      setEnergyStats(energyData.data);
      setWasteStats(wasteData.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
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
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Visualize trends and performance metrics
        </p>
      </div>

      <Tabs defaultValue="energy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="energy">Energy Analytics</TabsTrigger>
          <TabsTrigger value="waste">Waste Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="energy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart
              title="Energy Consumption Trend"
              data={energyStats?.monthly_trend || []}
              dataKey="consumption"
              label="Consumption (MWh)"
            />
            <ComparisonChart
              title="Energy by Type"
              data={energyStats?.by_type || []}
              dataKey="consumption"
              nameKey="energy_type"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComparisonChart
              title="Energy Cost by Type"
              data={energyStats?.by_type || []}
              dataKey="cost"
              nameKey="energy_type"
            />
            <TargetVsActualChart
              title="Reduction Targets Achievement"
              data={energyStats?.reduction_targets || {}}
            />
          </div>
        </TabsContent>

        <TabsContent value="waste" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart
              title="Waste Generation Trend"
              data={wasteStats?.monthly_trend || []}
              dataKey="quantity"
              label="Quantity (tons)"
            />
            <ComparisonChart
              title="Waste by Type"
              data={wasteStats?.by_type || []}
              dataKey="quantity"
              nameKey="waste_type"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComparisonChart
              title="Waste by Disposal Method"
              data={wasteStats?.by_disposal_method || []}
              dataKey="quantity"
              nameKey="disposal_method"
            />
            <ComparisonChart
              title="Compliance Status"
              data={wasteStats?.compliance || []}
              dataKey="count"
              nameKey="status"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}