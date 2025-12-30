export const ENERGY_TYPES = [
  'Electricity',
  'Natural Gas',
  'Diesel',
  'Solar',
  'Wind',
  'Other'
];

export const WASTE_TYPES = [
  'Hazardous',
  'Non-Hazardous',
  'Recyclable',
  'Organic',
  'Electronic'
];

export const DISPOSAL_METHODS = [
  'Landfill',
  'Incineration',
  'Recycling',
  'Composting',
  'Other'
];

export const REGULATORY_COMPLIANCE = [
  'Compliant',
  'Non-Compliant',
  'Pending Review'
];

export function validateEnergyRecord(data) {
  const errors = {};

  if (!data.site_name?.trim()) {
    errors.site_name = 'Site name is required';
  }

  if (!data.reporting_period_start) {
    errors.reporting_period_start = 'Reporting period start is required';
  }

  if (!data.reporting_period_end) {
    errors.reporting_period_end = 'Reporting period end is required';
  }

  if (data.reporting_period_start && data.reporting_period_end) {
    if (new Date(data.reporting_period_end) <= new Date(data.reporting_period_start)) {
      errors.reporting_period_end = 'Reporting period end must be after start date';
    }
  }

  if (!data.energy_type) {
    errors.energy_type = 'Energy type is required';
  } else if (!ENERGY_TYPES.includes(data.energy_type)) {
    errors.energy_type = 'Invalid energy type';
  }

  if (data.consumption_mwh !== undefined && data.consumption_mwh !== null) {
    const consumption = parseFloat(data.consumption_mwh);
    if (isNaN(consumption) || consumption < 0) {
      errors.consumption_mwh = 'Consumption must be a positive number';
    }
  } else {
    errors.consumption_mwh = 'Consumption is required';
  }

  if (data.cost !== undefined && data.cost !== null) {
    const cost = parseFloat(data.cost);
    if (isNaN(cost) || cost < 0) {
      errors.cost = 'Cost must be a positive number';
    }
  }

  if (data.reduction_target_mwh !== undefined && data.reduction_target_mwh !== null && data.reduction_target_mwh !== '') {
    const target = parseFloat(data.reduction_target_mwh);
    if (isNaN(target) || target < 0) {
      errors.reduction_target_mwh = 'Reduction target must be a positive number';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateWasteRecord(data) {
  const errors = {};

  if (!data.site_name?.trim()) {
    errors.site_name = 'Site name is required';
  }

  if (!data.waste_type) {
    errors.waste_type = 'Waste type is required';
  } else if (!WASTE_TYPES.includes(data.waste_type)) {
    errors.waste_type = 'Invalid waste type';
  }

  if (data.quantity_tons !== undefined && data.quantity_tons !== null) {
    const quantity = parseFloat(data.quantity_tons);
    if (isNaN(quantity) || quantity < 0) {
      errors.quantity_tons = 'Quantity must be a positive number';
    }
  } else {
    errors.quantity_tons = 'Quantity is required';
  }

  if (!data.disposal_method) {
    errors.disposal_method = 'Disposal method is required';
  } else if (!DISPOSAL_METHODS.includes(data.disposal_method)) {
    errors.disposal_method = 'Invalid disposal method';
  }

  if (!data.reporting_period_start) {
    errors.reporting_period_start = 'Reporting period start is required';
  }

  if (!data.reporting_period_end) {
    errors.reporting_period_end = 'Reporting period end is required';
  }

  if (data.reporting_period_start && data.reporting_period_end) {
    if (new Date(data.reporting_period_end) <= new Date(data.reporting_period_start)) {
      errors.reporting_period_end = 'Reporting period end must be after start date';
    }
  }

  if (data.disposal_date) {
    if (data.reporting_period_start && new Date(data.disposal_date) < new Date(data.reporting_period_start)) {
      errors.disposal_date = 'Disposal date must be on or after reporting period start';
    }
  }

  if (!data.regulatory_compliance) {
    errors.regulatory_compliance = 'Regulatory compliance status is required';
  } else if (!REGULATORY_COMPLIANCE.includes(data.regulatory_compliance)) {
    errors.regulatory_compliance = 'Invalid regulatory compliance status';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateUser(data) {
  const errors = {};

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}