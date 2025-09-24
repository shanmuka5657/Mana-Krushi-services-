
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CURRENCY_MAP: { [key: string]: string } = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
};
const DEFAULT_CURRENCY_INFO = { code: 'INR', symbol: '₹' };

const CURRENCY_INFO_MAP: { [key: string]: { code: string, symbol: string } } = {
  IN: DEFAULT_CURRENCY_INFO,
  US: { code: 'USD', symbol: '$' },
  GB: { code: 'GBP', symbol: '£' },
  CA: { code: 'CAD', symbol: '$' },
  AU: { code: 'AUD', symbol: '$' },
  PH: { code: 'PHP', symbol: '₱' },
};


export function formatCurrency(amount: number, countryCode?: string) {
    const countryInfo = CURRENCY_INFO_MAP[countryCode || 'IN'] || DEFAULT_CURRENCY_INFO;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: countryInfo.code,
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function exportToCsv(filename: string, rows: object[], headers?: string[]) {
  if (!rows || !rows.length) {
    return;
  }
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    (headers ? headers.join(separator) : keys.join(separator)) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
        cell = cell instanceof Date 
          ? cell.toLocaleString()
          : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
