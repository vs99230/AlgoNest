import api, { USE_MOCK } from './api';
import { leaderboardSeed } from '@/data/mockLeaderboard';
import { problems } from '@/data/problems';
import { getCurrentUser } from './authService';
import { getAllSubmissions } from './mockDb';
import { createHttpError, sleep } from '@/utils/helpers';
import { DIFFICULTIES, POINTS } from '@/utils/constants';
import { calculateStreaks, toDateKey } from '@/utils/streak';

function buildStats(submissions) {
  const solvedSlugs = new Set(
    submissions.filter((submission) => submission.status === 'Accepted').map((submission) => submission.problemSlug),
  );
  const solved = Object.fromEntries(DIFFICULTIES.map((level) => [level, 0]));
  const totals = Object.fromEntries(DIFFICULTIES.map((level) => [level, 0]));

  problems.forEach((problem) => {
    totals[problem.difficulty] += 1;
    if (solvedSlugs.has(problem.slug)) solved[problem.difficulty] += 1;
  });

  const totalSolved = DIFFICULTIES.reduce((sum, level) => sum + solved[level], 0);
  const points = DIFFICULTIES.reduce((sum, level) => sum + solved[level] * POINTS[level], 0);

  return { solved, totals, totalSolved, totalProblems: problems.length, points };
}

function buildActivity(submissions) {
  const activity = {};
  submissions.forEach((submission) => {
    const key = toDateKey(submission.submittedAt);
    activity[key] = (activity[key] ?? 0) + 1;
  });
  return activity;
}

/**
 * Expected API: GET /users/me/profile
 * -> { user: { username, email, joinedAt }, stats: { solved, totals, totalSolved, totalProblems, points },
 *      streak: { current, longest }, activity: { "YYYY-MM-DD": count },
 *      recentSubmissions: [{ id, problemSlug, problemTitle, status, language, runtimeMs, memoryMb, submittedAt }] }
 */
export async function getProfile() {
  if (!USE_MOCK) {
    const { data } = await api.get('/users/me/profile');
    return data;
  }

  await sleep(350);
  const user = getCurrentUser();
  if (!user) throw createHttpError('Log in to view your profile.', 401);

  const submissions = getAllSubmissions();
  const activity = buildActivity(submissions);

  return {
    user: { username: user.username, email: user.email, joinedAt: user.joinedAt },
    stats: buildStats(submissions),
    streak: calculateStreaks(Object.keys(activity)),
    activity,
    recentSubmissions: submissions.slice(0, 8).map((submission) => ({
      ...submission,
      problemTitle: problems.find((problem) => problem.slug === submission.problemSlug)?.title ?? submission.problemSlug,
    })),
  };
}

/**
 * Expected API: GET /leaderboard -> [{ rank, username, solved, points, streak, isYou? }]
 * (isYou is optional; the client also matches on the signed-in username.)
 */
export async function getLeaderboard() {
  if (!USE_MOCK) {
    const { data } = await api.get('/leaderboard');
    return data;
  }

  await sleep(350);
  const rows = [...leaderboardSeed];
  const user = getCurrentUser();

  if (user) {
    const submissions = getAllSubmissions();
    const stats = buildStats(submissions);
    const streak = calculateStreaks(Object.keys(buildActivity(submissions)));
    rows.push({ username: user.username, solved: stats.totalSolved, points: stats.points, streak: streak.current, isYou: true });
  }

  rows.sort((a, b) => b.points - a.points || b.solved - a.solved || a.username.localeCompare(b.username));

  // Standard competition ranking: equal points share a rank (1, 2, 2, 4).
  let currentRank = 0;
  return rows.map((row, index) => {
    if (index === 0 || row.points !== rows[index - 1].points) currentRank = index + 1;
    return { ...row, rank: currentRank };
  });
}
