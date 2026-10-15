import { buildStarterCode } from '@/utils/starterCode';

/**
 * Dummy problems for v1. Replace with API data later (see services/problemService.js).
 * Inline `code` in text is wrapped in backticks and rendered by utils/richText.jsx.
 */
const raw = [
  {
    id: 1,
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    acceptance: 51.2,
    description: [
      'You get an array of integers `nums` and an integer `target`. Find two different positions in the array whose values add up to `target`, and return those two indices.',
      'Every input has exactly one valid answer, and you cannot use the same element twice. The indices can be returned in any order.',
    ],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] equals 9, so the answer is [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Exactly one valid answer exists.'],
    signature: { name: 'twoSum', params: [['nums', 'int[]'], ['target', 'int']], returns: 'int[]' },
  },
  {
    id: 2,
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    acceptance: 40.3,
    description: [
      'You get a string `s` made only of the characters `(`, `)`, `{`, `}`, `[` and `]`. Decide whether the brackets are balanced.',
      'Brackets are balanced when every opening bracket is closed by the same type of bracket, in the right order, and no closing bracket appears without a matching opener.',
    ],
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's contains only the characters ()[]{}.'],
    signature: { name: 'isValid', params: [['s', 'string']], returns: 'boolean' },
  },
  {
    id: 3,
    slug: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    acceptance: 54.1,
    description: [
      'The array `prices` holds a stock price for each day, where `prices[i]` is the price on day `i`.',
      'You may buy once and sell once, and the sale must happen after the purchase. Return the largest profit you can make, or `0` if every possible trade loses money.',
    ],
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy at 1 and sell at 6 for a profit of 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'Prices only fall, so no profitable trade exists.' },
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    signature: { name: 'maxProfit', params: [['prices', 'int[]']], returns: 'int' },
  },
  {
    id: 4,
    slug: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    tags: ['Two Pointers', 'String'],
    acceptance: 47.8,
    description: [
      'Ignore letter case and skip every character that is not a letter or a digit. If the remaining text reads the same forwards and backwards, it is a palindrome.',
      'Given a string `s`, return `true` if it is a palindrome under these rules, otherwise return `false`.',
    ],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: 'The cleaned text "amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false', explanation: 'The cleaned text "raceacar" is not a palindrome.' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's contains printable ASCII characters only.'],
    signature: { name: 'isPalindrome', params: [['s', 'string']], returns: 'boolean' },
  },
  {
    id: 5,
    slug: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    acceptance: 50.2,
    description: [
      'Given an integer array `nums`, find the contiguous subarray (at least one element) with the largest sum and return that sum.',
    ],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum, 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    signature: { name: 'maxSubArray', params: [['nums', 'int[]']], returns: 'int' },
  },
  {
    id: 6,
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Sliding Window', 'String'],
    acceptance: 35.9,
    description: ['Given a string `s`, return the length of the longest substring that contains no repeated characters.'],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The longest such substring is "abc".' },
      { input: 's = "bbbbb"', output: '1' },
      { input: 's = "pwwkew"', output: '3', explanation: '"wke" works. "pwke" is a subsequence, not a substring.' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's contains letters, digits, symbols and spaces.'],
    signature: { name: 'lengthOfLongestSubstring', params: [['s', 'string']], returns: 'int' },
  },
  {
    id: 7,
    slug: 'three-sum',
    title: '3Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    acceptance: 33.7,
    description: [
      'Given an integer array `nums`, return every unique triplet of values `[a, b, c]` taken from three different positions that add up to `0`.',
      'The result must not contain the same triplet twice, but the triplets and the values inside them can be in any order.',
    ],
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,1,1]', output: '[]', explanation: 'The only possible triplet does not add up to 0.' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]' },
    ],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    signature: { name: 'threeSum', params: [['nums', 'int[]']], returns: 'int[][]' },
  },
  {
    id: 8,
    slug: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['DFS', 'BFS', 'Matrix'],
    acceptance: 62.0,
    description: [
      'You get a grid `grid` of `"1"` (land) and `"0"` (water) characters. An island is a group of land cells connected horizontally or vertically.',
      'Return how many islands the grid contains. Treat everything outside the grid as water.',
    ],
    examples: [
      { input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2' },
      { input: 'grid = [["1","0","1"],["0","1","0"],["1","0","1"]]', output: '5' },
    ],
    constraints: ['1 <= grid.length, grid[i].length <= 300', 'grid[i][j] is "0" or "1".'],
    signature: { name: 'numIslands', params: [['grid', 'char[][]']], returns: 'int' },
  },
  {
    id: 9,
    slug: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    acceptance: 45.6,
    description: [
      'You have coins of the denominations listed in `coins`, and you can use each denomination as many times as you like. Return the smallest number of coins needed to make exactly `amount`.',
      'If no combination of coins adds up to `amount`, return `-1`.',
    ],
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1.' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' },
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    signature: { name: 'coinChange', params: [['coins', 'int[]'], ['amount', 'int']], returns: 'int' },
  },
  {
    id: 10,
    slug: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Stack', 'Dynamic Programming'],
    acceptance: 62.5,
    description: [
      'The array `height` describes an elevation map where each bar is `1` unit wide. After it rains, water collects between the bars. Return the total units of water trapped.',
    ],
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' },
    ],
    constraints: ['1 <= height.length <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    signature: { name: 'trap', params: [['height', 'int[]']], returns: 'int' },
  },
  {
    id: 11,
    slug: 'median-of-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search'],
    acceptance: 43.4,
    description: [
      'Given two sorted arrays `nums1` and `nums2`, return the median of all their values combined.',
      'Your solution should run in `O(log(m + n))` time, where `m` and `n` are the lengths of the arrays.',
    ],
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0', explanation: 'Merged: [1,2,3]. The median is 2.' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.5', explanation: 'Merged: [1,2,3,4]. The median is (2 + 3) / 2.' },
    ],
    constraints: ['0 <= nums1.length, nums2.length <= 1000', '1 <= nums1.length + nums2.length <= 2000', '-10^6 <= nums1[i], nums2[i] <= 10^6'],
    signature: { name: 'findMedianSortedArrays', params: [['nums1', 'int[]'], ['nums2', 'int[]']], returns: 'double' },
  },
  {
    id: 12,
    slug: 'edit-distance',
    title: 'Edit Distance',
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming'],
    acceptance: 58.4,
    description: [
      'Given two strings `word1` and `word2`, return the minimum number of single-character edits needed to turn `word1` into `word2`.',
      'An edit is one of: insert a character, delete a character, or replace a character.',
    ],
    examples: [
      { input: 'word1 = "horse", word2 = "ros"', output: '3', explanation: 'Replace h with r, remove r, remove e.' },
      { input: 'word1 = "intention", word2 = "execution"', output: '5' },
    ],
    constraints: ['0 <= word1.length, word2.length <= 500', 'Both strings contain lowercase English letters only.'],
    signature: { name: 'minDistance', params: [['word1', 'string'], ['word2', 'string']], returns: 'int' },
  },
];

export const problems = raw.map(({ signature, ...problem }) => ({
  ...problem,
  starterCode: buildStarterCode(signature),
}));

export const allTags = [...new Set(problems.flatMap((problem) => problem.tags))].sort();
