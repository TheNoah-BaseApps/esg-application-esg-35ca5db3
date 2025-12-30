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
import { WASTE_TYPES, DISPOSAL_METHODS, REGULATORY_COMPLIANCE } from '@/lib/validation';
import { toast } from 'sonner';

export default function WasteForm({ record, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    site_name: '',
    waste_type: '',
    quantity_tons: '',
    disposal_method: '',
    reporting_period_start: '',
    reporting_period_end: '',
    disposal_date: '',
    contractor_name: '',
    regulatory_compliance: '',
    remarks: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        site_name: record.site_name || '',
        waste_type: record.waste_type || '',
        quantity_tons: record.quantity_tons?.toString() || '',
        disposal_method: record.disposal_method || '',
        reporting_period_start: record.reporting_period_start || '',
        reporting_period_end: record.reporting_period_end || '',
        disposal_date: record.disposal_date || '',
        contractor_name: record.contractor_name || '',
        regulatory_compliance: record.regulatory_compliance || '',
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
      const url = record ? `/api/waste/${record.id}` : '/api/waste';
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

      toast.success(record ? 'Waste record updated successfully' : 'Waste record created successfully');
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
          <Label htmlFor="waste_type">Waste Type *</Label>
          <Select
            value={formData.waste_type}
            onValueChange={(value) => handleChange('waste_type', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select waste type" />
            </SelectTrigger>
            <SelectContent>
              {WASTE_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.waste_type && (
            <p className="text-sm text-red-600">{errors.waste_type}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity_tons">Quantity (tons) *</Label>
          <Input
            id="quantity_tons"
            type="number"
            step="0.01"
            value={formData.quantity_tons}
            onChange={(e) => handleChange('quantity_tons', e.target.value)}
            disabled={loading}
          />
          {errors.quantity_tons && (
            <p className="text-sm text-red-600">{errors.quantity_tons}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="disposal_method">Disposal Method *</Label>
          <Select
            value={formData.disposal_method}
            onValueChange={(value) => handleChange('disposal_method', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select disposal method" />
            </SelectTrigger>
            <SelectContent>
              {DISPOSAL_METHODS.map(method => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.disposal_method && (
            <p className="text-sm text-red-600">{errors.disposal_method}</p>
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
          <Label htmlFor="disposal_date">Disposal Date</Label>
          <Input
            id="disposal_date"
            type="date"
            value={formData.disposal_date}
            onChange={(e) => handleChange('disposal_date', e.target.value)}
            disabled={loading}
          />
          {errors.disposal_date && (
            <p className="text-sm text-red-600">{errors.disposal_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractor_name">Contractor Name</Label>
          <Input
            id="contractor_name"
            value={formData.contractor_name}
            onChange={(e) => handleChange('contractor_name', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="regulatory_compliance">Regulatory Compliance *</Label>
          <Select
            value={formData.regulatory_compliance}
            onValueChange={(value) => handleChange('regulatory_compliance', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select compliance status" />
            </SelectTrigger>
            <SelectContent>
              {REGULATORY_COMPLIANCE.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.regulatory_compliance && (
            <p className="text-sm text-red-600">{errors.regulatory_compliance}</p>
          )}
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