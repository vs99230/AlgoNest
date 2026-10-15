const relativeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatDate(timestamp, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat('en', options).format(new Date(timestamp));
}

export function formatRelativeTime(timestamp) {
  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return 'just now';
  if (abs < 3600) return relativeFormat.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return relativeFormat.format(Math.round(diffSeconds / 3600), 'hour');
  if (abs < 86400 * 7) return relativeFormat.format(Math.round(diffSeconds / 86400), 'day');
  return formatDate(timestamp);
}

export const pluralize = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
