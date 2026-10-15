import api, { USE_MOCK } from './api';
import { getAllSubmissions } from './mockDb';
import { createHttpError, sleep } from '@/utils/helpers';

function requireExecutableJudge() {
  if (USE_MOCK) {
    throw createHttpError(
      'Code execution is disabled in mock mode. Set VITE_USE_MOCK=false and start the backend judge.',
      503,
    );
  }
}

/**
 * Expected API: POST /problems/{slug}/run  { language, code }
 * -> { status, runtimeMs, memoryMb, cases: [{ input, expected, output, passed }], error? }
 */
export async function runCode({ slug, language, code }) {
  if (USE_MOCK) {
    requireExecutableJudge();
  }
  const { data } = await api.post(`/problems/${encodeURIComponent(slug)}/run`, { language, code });
  return data;
}

/**
 * Expected API: POST /problems/{slug}/submit  { language, code }
 * -> { status, runtimeMs, memoryMb, passed, total, language }
 */
export async function submitCode({ slug, language, code }) {
  if (USE_MOCK) {
    requireExecutableJudge();
  }
  const { data } = await api.post(`/problems/${encodeURIComponent(slug)}/submit`, { language, code });
  return data;
}

/** Expected API: GET /users/me/solved -> ["two-sum", ...] (slugs of accepted problems) */
export async function getSolvedSlugs() {
  if (USE_MOCK) {
    await sleep(150);
    const solved = getAllSubmissions()
      .filter((submission) => submission.status === 'Accepted')
      .map((submission) => submission.problemSlug);
    return [...new Set(solved)];
  }
  const { data } = await api.get('/users/me/solved');
  return data;
}
