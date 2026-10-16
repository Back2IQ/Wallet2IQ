import { DeadManSwitch } from './wallet-store';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCrypto(amount: number, symbol: string, decimals = 4): string {
  return `${amount.toFixed(decimals)} ${symbol}`;
}

export function shortenAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatDate(timestamp: number, type: 'date' | 'time' | 'full' | 'longDate' = 'full'): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  };

  if (type === 'date') return new Date(timestamp).toLocaleDateString('en-US');
  if (type === 'time') return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (type === 'longDate') return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  
  return new Date(timestamp).toLocaleString('en-US', options);
}

export function getTimeUntilTrigger(dms: DeadManSwitch): string {
  const remaining = dms.nextCheckIn - Date.now();
  if (remaining <= 0) return 'Overdue';
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const months = Math.floor(days / 30);
  if (months > 0) return `${months} Month${months > 1 ? 's' : ''}`;
  if (days > 0) return `${days} Day${days > 1 ? 's' : ''}`;
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  if (hours > 0) return `${hours} Hour${hours > 1 ? 's' : ''}`;
  return '< 1 Hour';
}
