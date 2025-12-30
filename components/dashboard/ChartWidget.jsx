import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatNumber } from '@/lib/utils';
import ComplianceStatusBadge from '@/components/shared/ComplianceStatusBadge';

export default function ChartWidget({ title, data, type }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((record, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {record.site_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {record.id} • {formatDate(record.created_at)}
                </p>
              </div>
              <div className="text-right ml-4">
                {type === 'energy' ? (
                  <p className="text-sm font-semibold text-gray-900">
                    {formatNumber(record.consumption)} MWh
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatNumber(record.quantity)} tons
                    </p>
                    <ComplianceStatusBadge status={record.compliance} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}