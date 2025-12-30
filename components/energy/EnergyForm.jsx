'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ENERGY_TYPES } from '@/lib/validation';
import { toast } from 'sonner';

export default function EnergyForm({ record, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    site_name: '',
    reporting_period_start: '',
    reporting_period_end: '',
    energy_type: '',
    consumption_mwh: '',
    cost: '',
    supplier_name: '',
    energy_source_mix: '',
    reduction_target_mwh: '',
    remarks: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        site_name: record.site_name || '',
        reporting_period_start: record.reporting_period_start || '',
        reporting_period_end: record.reporting_period_end || '',
        energy_type: record.energy_type || '',
        consumption_mwh: record.consumption_mwh?.toString() || '',
        cost: record.cost?.toString() || '',
        supplier_name: record.supplier_name || '',
        energy_source_mix: record.energy_source_mix || '',
        reduction_target_mwh: record.reduction_target_mwh?.toString() || '',
        remarks: record.remarks || ''
      });
    }
  }, [record]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const url = record ? `/api/energy/${record.id}` : '/api/energy';
      const method = record ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          toast.error(result.error || 'Failed to save record');
        }
        setLoading(false);
        return;
      }

      toast.success(record ? 'Energy record updated successfully' : 'Energy record created successfully');
      onSuccess();
    } catch (err) {
      console.error('Error saving record:', err);
      toast.error('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="site_name">Site Name *</Label>
          <Input
            id="site_name"
            value={formData.site_name}
            onChange={(e) => handleChange('site_name', e.target.value)}
            disabled={loading}
          />
          {errors.site_name && (
            <p className="text-sm text-red-600">{errors.site_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="energy_type">Energy Type *</Label>
          <Select
            value={formData.energy_type}
            onValueChange={(value) => handleChange('energy_type', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select energy type" />
            </SelectTrigger>
            <SelectContent>
              {ENERGY_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.energy_type && (
            <p className="text-sm text-red-600">{errors.energy_type}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporting_period_start">Reporting Period Start *</Label>
          <Input
            id="reporting_period_start"
            type="date"
            value={formData.reporting_period_start}
            onChange={(e) => handleChange('reporting_period_start', e.target.value)}
            disabled={loading}
          />
          {errors.reporting_period_start && (
            <p className="text-sm text-red-600">{errors.reporting_period_start}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reporting_period_end">Reporting Period End *</Label>
          <Input
            id="reporting_period_end"
            type="date"
            value={formData.reporting_period_end}
            onChange={(e) => handleChange('reporting_period_end', e.target.value)}
            disabled={loading}
          />
          {errors.reporting_period_end && (
            <p className="text-sm text-red-600">{errors.reporting_period_end}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="consumption_mwh">Consumption (MWh) *</Label>
          <Input
            id="consumption_mwh"
            type="number"
            step="0.01"
            value={formData.consumption_mwh}
            onChange={(e) => handleChange('consumption_mwh', e.target.value)}
            disabled={loading}
          />
          {errors.consumption_mwh && (
            <p className="text-sm text-red-600">{errors.consumption_mwh}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Cost</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            disabled={loading}
          />
          {errors.cost && (
            <p className="text-sm text-red-600">{errors.cost}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier_name">Supplier Name</Label>
          <Input
            id="supplier_name"
            value={formData.supplier_name}
            onChange={(e) => handleChange('supplier_name', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="energy_source_mix">Energy Source Mix</Label>
          <Input
            id="energy_source_mix"
            value={formData.energy_source_mix}
            onChange={(e) => handleChange('energy_source_mix', e.target.value)}
            disabled={loading}
            placeholder="e.g., 60% renewable, 40% fossil"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reduction_target_mwh">Reduction Target (MWh)</Label>
          <Input
            id="reduction_target_mwh"
            type="number"
            step="0.01"
            value={formData.reduction_target_mwh}
            onChange={(e) => handleChange('reduction_target_mwh', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={(e) => handleChange('remarks', e.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (record ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
}