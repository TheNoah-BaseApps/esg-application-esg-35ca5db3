import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return '';
  }
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    return `$${amount}`;
  }
}

export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '0';
  
  try {
    return parseFloat(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  } catch (error) {
    return num.toString();
  }
}

export function calculateReductionAchievement(target, actual) {
  if (!target || target === 0) return null;
  
  const reduction = target - actual;
  const percentage = (reduction / target) * 100;
  
  return {
    reduction,
    percentage: Math.round(percentage * 10) / 10,
    achieved: reduction >= 0
  };
}

export function calculateWasteDiversionRate(recycled, composted, total) {
  if (!total || total === 0) return 0;
  
  const diverted = (recycled || 0) + (composted || 0);
  return Math.round((diverted / total) * 1000) / 10;
}

export function getComplianceColor(status) {
  switch (status) {
    case 'Compliant':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Non-Compliant':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Pending Review':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function exportToCSV(data, filename) {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const stringValue = value.toString();
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function truncate(str, length = 50) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}