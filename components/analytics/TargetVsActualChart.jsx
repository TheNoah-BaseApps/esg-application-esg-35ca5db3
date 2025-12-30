'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function TargetVsActualChart({ title, data }) {
  if (!data || !data.total_with_targets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No target data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const achievementRate = data.achievement_rate || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Achievement Rate</span>
            <span className="font-semibold">{formatNumber(achievementRate, 1)}%</span>
          </div>
          <Progress value={achievementRate} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Target</p>
            <p className="text-2xl font-bold">{formatNumber(data.total_target)} MWh</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Actual Consumption</p>
            <p className="text-2xl font-bold">{formatNumber(data.total_consumption)} MWh</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Records with Targets</p>
            <p className="text-lg font-semibold">{data.total_with_targets}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Targets Met</p>
            <p className="text-lg font-semibold">{data.targets_met}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}