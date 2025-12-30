import { Badge } from '@/components/ui/badge';
import { getComplianceColor } from '@/lib/utils';

export default function ComplianceStatusBadge({ status }) {
  if (!status) return null;

  return (
    <Badge variant="outline" className={getComplianceColor(status)}>
      {status}
    </Badge>
  );
}