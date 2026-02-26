export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format a YYYY-MM-DD string using a token-based format (DD, MM, YYYY). */
export function formatDateCustom(dateStr: string, format: string): string {
  const [year, month, day] = dateStr.split('-');
  return format
    .replace('DD', (day ?? '??').padStart(2, '0'))
    .replace('MM', (month ?? '??').padStart(2, '0'))
    .replace('YYYY', year ?? '????');
}

export function nowISO(): string {
  return new Date().toISOString();
}
