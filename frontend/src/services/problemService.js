import api, { USE_MOCK } from './api';
import { problems } from '@/data/problems';
import { findProblemBySlug } from './mockDb';
import { createHttpError, sleep } from '@/utils/helpers';

/** Expected API: GET /problems -> [{ id, slug, title, difficulty, tags, acceptance }] */
export async function getProblems() {
  if (USE_MOCK) {
    await sleep(400);
    return problems.map(({ id, slug, title, difficulty, tags, acceptance }) => ({
      id,
      slug,
      title,
      difficulty,
      tags,
      acceptance,
    }));
  }
  const { data } = await api.get('/problems');
  return data;
}

/** Expected API: GET /problems/{slug} -> full problem incl. description, examples, constraints, starterCode */
export async function getProblemBySlug(slug) {
  if (USE_MOCK) {
    await sleep(250);
    const problem = findProblemBySlug(slug);
    if (!problem) throw createHttpError('Problem not found.', 404);
    return problem;
  }
  const { data } = await api.get(`/problems/${encodeURIComponent(slug)}`);
  return data;
}
