'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import EnergyTable from '@/components/energy/EnergyTable';
import EnergyFormDialog from '@/components/energy/EnergyFormDialog';
import { Plus } from 'lucide-react';

export default function EnergyPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/energy');
      
      if (!response.ok) {
        throw new Error('Failed to fetch energy records');
      }

      const result = await response.json();
      setRecords(result.data?.records || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setShowDialog(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowDialog(true);
  };

  const handleSuccess = () => {
    setShowDialog(false);
    setEditingRecord(null);
    fetchRecords();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Energy Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage energy consumption across all sites
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Energy Record
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <EnergyTable 
        records={records}
        onEdit={handleEdit}
        onDelete={fetchRecords}
      />

      <EnergyFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        record={editingRecord}
        onSuccess={handleSuccess}
      />
    </div>
  );
}