'use client';

import { useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import DeleteConfirmation from '@/components/shared/DeleteConfirmation';
import ExportButton from '@/components/shared/ExportButton';
import ComplianceStatusBadge from '@/components/shared/ComplianceStatusBadge';
import { formatDate, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function WasteTable({ records, onEdit, onDelete }) {
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/waste/${deleteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      toast.success('Waste record deleted successfully');
      setDeleteId(null);
      onDelete();
    } catch (err) {
      console.error('Error deleting record:', err);
      toast.error('Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'waste_record_id',
      label: 'Record ID',
      sortable: true
    },
    {
      key: 'site_name',
      label: 'Site',
      sortable: true
    },
    {
      key: 'waste_type',
      label: 'Waste Type',
      sortable: true
    },
    {
      key: 'quantity_tons',
      label: 'Quantity (tons)',
      sortable: true,
      render: (value) => formatNumber(value)
    },
    {
      key: 'disposal_method',
      label: 'Disposal Method',
      sortable: true
    },
    {
      key: 'regulatory_compliance',
      label: 'Compliance',
      sortable: true,
      render: (value) => <ComplianceStatusBadge status={value} />
    },
    {
      key: 'disposal_date',
      label: 'Disposal Date',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(record)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteId(record.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <ExportButton data={records} filename="waste-records" />
      </div>
      
      <DataTable
        data={records}
        columns={columns}
        searchable
        searchPlaceholder="Search by site or record ID..."
      />

      <DeleteConfirmation
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Waste Record"
        description="Are you sure you want to delete this waste record? This action cannot be undone."
      />
    </>
  );
}