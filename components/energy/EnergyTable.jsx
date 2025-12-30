'use client';

import { useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import DeleteConfirmation from '@/components/shared/DeleteConfirmation';
import ExportButton from '@/components/shared/ExportButton';
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EnergyTable({ records, onEdit, onDelete }) {
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/energy/${deleteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete record');
      }

      toast.success('Energy record deleted successfully');
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
      key: 'energy_record_id',
      label: 'Record ID',
      sortable: true
    },
    {
      key: 'site_name',
      label: 'Site',
      sortable: true
    },
    {
      key: 'energy_type',
      label: 'Energy Type',
      sortable: true
    },
    {
      key: 'consumption_mwh',
      label: 'Consumption (MWh)',
      sortable: true,
      render: (value) => formatNumber(value)
    },
    {
      key: 'cost',
      label: 'Cost',
      sortable: true,
      render: (value) => formatCurrency(value)
    },
    {
      key: 'reporting_period_start',
      label: 'Period Start',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'reporting_period_end',
      label: 'Period End',
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
        <ExportButton data={records} filename="energy-records" />
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
        title="Delete Energy Record"
        description="Are you sure you want to delete this energy record? This action cannot be undone."
      />
    </>
  );
}