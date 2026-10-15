import { useEffect, useState } from 'react';
import useAuth from './useAuth';
import { getErrorMessage } from '@/services/api';
import { getProblemBySlug, getProblems } from '@/services/problemService';
import { getSolvedSlugs } from '@/services/submissionService';

/** Problem list plus the set of solved slugs (only fetched when logged in). */
export function useProblems() {
  const { isAuthenticated } = useAuth();
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ problems: [], solved: new Set(), loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((previous) => ({ ...previous, loading: true, error: null }));

    (async () => {
      try {
        const [problems, solvedSlugs] = await Promise.all([
          getProblems(),
          isAuthenticated ? getSolvedSlugs() : Promise.resolve([]),
        ]);
        if (!cancelled) setState({ problems, solved: new Set(solvedSlugs), loading: false, error: null });
      } catch (error) {
        if (!cancelled) {
          setState((previous) => ({
            ...previous,
            loading: false,
            error: getErrorMessage(error, 'Could not load problems.'),
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, reloadKey]);

  return { ...state, reload: () => setReloadKey((key) => key + 1) };
}

/** A single problem by slug. `notFound` is true for 404s. */
export function useProblem(slug) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ problem: null, loading: true, error: null, notFound: false });

  useEffect(() => {
    let cancelled = false;
    setState({ problem: null, loading: true, error: null, notFound: false });

    (async () => {
      try {
        const problem = await getProblemBySlug(slug);
        if (!cancelled) setState({ problem, loading: false, error: null, notFound: false });
      } catch (error) {
        if (cancelled) return;
        const status = error?.status ?? error?.response?.status;
        setState({
          problem: null,
          loading: false,
          notFound: status === 404,
          error: status === 404 ? null : getErrorMessage(error, 'Could not load this problem.'),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, reloadKey]);

  return { ...state, reload: () => setReloadKey((key) => key + 1) };
}
