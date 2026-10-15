const HOUR = 3600 * 1000;

/** Demo activity so Profile, streaks and solved badges look alive in mock mode. */
const seed = [
  { problemSlug: 'two-sum', status: 'Accepted', language: 'python', runtimeMs: 52, memoryMb: 17.1, hoursAgo: 3 },
  { problemSlug: 'three-sum', status: 'Wrong Answer', language: 'python', runtimeMs: 0, memoryMb: 0, hoursAgo: 5 },
  { problemSlug: 'valid-parentheses', status: 'Accepted', language: 'python', runtimeMs: 44, memoryMb: 16.4, hoursAgo: 27 },
  { problemSlug: 'best-time-to-buy-and-sell-stock', status: 'Accepted', language: 'javascript', runtimeMs: 61, memoryMb: 52.3, hoursAgo: 31 },
  { problemSlug: 'maximum-subarray', status: 'Time Limit Exceeded', language: 'python', runtimeMs: 0, memoryMb: 0, hoursAgo: 52 },
  { problemSlug: 'maximum-subarray', status: 'Accepted', language: 'python', runtimeMs: 78, memoryMb: 30.6, hoursAgo: 55 },
  { problemSlug: 'longest-substring-without-repeating-characters', status: 'Accepted', language: 'python', runtimeMs: 49, memoryMb: 16.9, hoursAgo: 78 },
  { problemSlug: 'number-of-islands', status: 'Accepted', language: 'cpp', runtimeMs: 8, memoryMb: 14.2, hoursAgo: 104 },
  { problemSlug: 'coin-change', status: 'Wrong Answer', language: 'python', runtimeMs: 0, memoryMb: 0, hoursAgo: 130 },
  { problemSlug: 'valid-palindrome', status: 'Accepted', language: 'python', runtimeMs: 39, memoryMb: 17.3, hoursAgo: 200 },
];

export const seedSubmissions = seed.map(({ hoursAgo, ...item }, index) => ({
  ...item,
  id: `seed_${index + 1}`,
  submittedAt: Date.now() - hoursAgo * HOUR,
}));
