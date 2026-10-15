/** Local calendar day as YYYY-MM-DD. */
export function toDateKey(input) {
  const date = input instanceof Date ? input : new Date(input);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function dayDiff(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

/**
 * Current and longest streak from a list of active day keys.
 * The current streak survives until the end of the day after your last activity.
 */
export function calculateStreaks(dateKeys) {
  const days = [...new Set(dateKeys)].sort();
  if (days.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    run = dayDiff(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  let current = 0;
  if (dayDiff(days[days.length - 1], toDateKey(new Date())) <= 1) {
    current = 1;
    for (let i = days.length - 1; i > 0; i -= 1) {
      if (dayDiff(days[i - 1], days[i]) !== 1) break;
      current += 1;
    }
  }

  return { current, longest };
}
