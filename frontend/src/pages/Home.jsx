import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronDown, LogIn, Search, SearchX, SlidersHorizontal, Shuffle, X } from 'lucide-react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import ProblemCard, { ProblemCardSkeleton } from '@/components/ProblemCard';
import Sidebar, { EMPTY_FILTERS, countActiveFilters } from '@/components/Sidebar';
import useAuth from '@/hooks/useAuth';
import useDebounce from '@/hooks/useDebounce';
import usePageTitle from '@/hooks/usePageTitle';
import { useProblems } from '@/hooks/useProblems';
import { DIFFICULTIES } from '@/utils/constants';
import { pluralize } from '@/utils/format';

const BAR_TONES = { Easy: 'bg-leaf', Medium: 'bg-sun', Hard: 'bg-hard' };

const SORT_OPTIONS = [
  { value: 'default', label: 'Default order' },
  { value: 'easiest', label: 'Easiest first' },
  { value: 'hardest', label: 'Hardest first' },
  { value: 'acceptance', label: 'Highest acceptance' },
];

/* -------------------------------------------------------------------------- */
/*  Progress summary                                                           */
/* -------------------------------------------------------------------------- */

const RING_RADIUS = 28;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressSummary({ problems, solved }) {
  const total = problems.length;
  const solvedCount = solved.size;
  const pct = total ? Math.round((solvedCount / total) * 100) : 0;

  const byLevel = useMemo(
    () =>
      DIFFICULTIES.map((level) => {
        const levelProblems = problems.filter((p) => p.difficulty === level);
        const levelSolved = levelProblems.filter((p) => solved.has(p.slug)).length;
        return { level, solved: levelSolved, total: levelProblems.length };
      }),
    [problems, solved],
  );

  return (
    <section
      aria-label="Your progress"
      className="rounded-xl border border-line bg-surface p-5"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden="true">
              <circle cx="32" cy="32" r={RING_RADIUS} fill="none" strokeWidth="6" className="stroke-current text-line" />
              <circle
                cx="32"
                cy="32"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - pct / 100)}
                className="stroke-current text-accent-text transition-[stroke-dashoffset] duration-150"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
              {pct}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">Your progress</p>
            <p className="mt-0.5 text-sm text-muted">
              <span className="font-semibold tabular-nums text-ink">{solvedCount}</span> of{' '}
              <span className="tabular-nums">{total}</span> solved
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-4 sm:gap-6">
          {byLevel.map(({ level, solved: s, total: t }) => (
            <div key={level}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium">{level}</span>
                <span className="tabular-nums text-muted">
                  {s}/{t}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
                <div
                  className={`h-full rounded-full transition-[width] duration-150 ${BAR_TONES[level]}`}
                  style={{ width: t ? `${(s / t) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

function QuickFilterChip({ active, onClick, children, count, dotClass }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors ${
        active
          ? 'border-accent-text/40 bg-accent-soft text-accent-text'
          : 'border-line bg-surface text-muted hover:border-muted/50 hover:text-ink'
      }`}
    >
      {dotClass && <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />}
      {children}
      {count !== undefined && <span className="text-xs tabular-nums opacity-70">{count}</span>}
    </button>
  );
}

function ActiveChip({ label, onRemove }) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-md bg-subtle pl-2.5 pr-1 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${label}`}
        className="flex h-5 w-5 items-center justify-center rounded text-muted transition-colors hover:bg-line hover:text-ink"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}

function StatePanel({ icon: Icon, title, description, children, tone = 'neutral' }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <span
        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
          tone === 'danger' ? 'bg-hard-soft text-hard' : 'bg-subtle text-muted'
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className={`mt-4 font-medium ${tone === 'danger' ? 'text-hard' : ''}`} role={tone === 'danger' ? 'alert' : undefined}>
        {title}
      </p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Home() {
  usePageTitle();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { problems, solved, loading, error, reload } = useProblems();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('default');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query.trim().toLowerCase(), 200);

  /* Press "/" anywhere to jump to search. */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const tags = useMemo(() => [...new Set(problems.flatMap((problem) => problem.tags))].sort(), [problems]);
  const counts = useMemo(
    () => Object.fromEntries(DIFFICULTIES.map((level) => [level, problems.filter((p) => p.difficulty === level).length])),
    [problems],
  );

  const visible = useMemo(
    () =>
      problems.filter((problem) => {
        if (
          debouncedQuery &&
          !problem.title.toLowerCase().includes(debouncedQuery) &&
          !problem.tags.some((tag) => tag.toLowerCase().includes(debouncedQuery))
        ) {
          return false;
        }
        if (filters.difficulties.length > 0 && !filters.difficulties.includes(problem.difficulty)) return false;
        if (filters.tags.length > 0 && !filters.tags.some((tag) => problem.tags.includes(tag))) return false;
        if (filters.status === 'solved' && !solved.has(problem.slug)) return false;
        if (filters.status === 'unsolved' && solved.has(problem.slug)) return false;
        return true;
      }),
    [problems, debouncedQuery, filters, solved],
  );

  const sorted = useMemo(() => {
    if (sort === 'default') return visible;
    const rank = (problem) => DIFFICULTIES.indexOf(problem.difficulty);
    const list = [...visible];
    if (sort === 'easiest') list.sort((a, b) => rank(a) - rank(b));
    if (sort === 'hardest') list.sort((a, b) => rank(b) - rank(a));
    if (sort === 'acceptance') list.sort((a, b) => (b.acceptance ?? 0) - (a.acceptance ?? 0));
    return list;
  }, [visible, sort]);

  const activeFilters = countActiveFilters(filters);
  const hasCriteria = activeFilters > 0 || debouncedQuery.length > 0;
  const statusActive = filters.status === 'solved' || filters.status === 'unsolved';

  const clearAll = () => {
    setQuery('');
    setFilters(EMPTY_FILTERS);
  };

  const toggleDifficulty = (level) =>
    setFilters((current) => ({
      ...current,
      difficulties: current.difficulties.includes(level)
        ? current.difficulties.filter((item) => item !== level)
        : [...current.difficulties, level],
    }));

  const activeChips = [
    ...filters.difficulties.map((level) => ({
      key: `difficulty-${level}`,
      label: level,
      onRemove: () =>
        setFilters((current) => ({ ...current, difficulties: current.difficulties.filter((item) => item !== level) })),
    })),
    ...filters.tags.map((tag) => ({
      key: `tag-${tag}`,
      label: tag,
      onRemove: () => setFilters((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) })),
    })),
    ...(statusActive
      ? [
          {
            key: 'status',
            label: filters.status === 'solved' ? 'Solved' : 'Unsolved',
            onRemove: () => setFilters((current) => ({ ...current, status: EMPTY_FILTERS.status })),
          },
        ]
      : []),
  ];

  const pickRandom = () => {
    const unsolved = sorted.filter((problem) => !solved.has(problem.slug));
    const pool = unsolved.length > 0 ? unsolved : sorted;
    if (pool.length === 0) return;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    navigate(`/problems/${choice.slug}`);
  };

  const subtitle = loading
    ? 'Loading problems'
    : isAuthenticated
      ? `${solved.size} of ${pluralize(problems.length, 'problem')} solved`
      : pluralize(problems.length, 'problem');

  const sidebar = (
    <Sidebar
      filters={filters}
      onChange={setFilters}
      counts={counts}
      tags={tags}
      canFilterStatus={isAuthenticated}
    />
  );

  const ready = !loading && !error;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Problems</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        </div>
        {ready && problems.length > 0 && (
          <Button variant="secondary" icon={Shuffle} onClick={pickRandom} disabled={sorted.length === 0}>
            Random problem
          </Button>
        )}
      </header>

      {/* Progress / login prompt */}
      {isAuthenticated && ready && problems.length > 0 && (
        <div className="mt-6">
          <ProgressSummary problems={problems} solved={solved} />
        </div>
      )}
      {!isAuthenticated && ready && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
            <LogIn className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-muted">
            <span className="font-medium text-ink">Track your progress.</span> Log in to save submissions and see which
            problems you have solved.
          </p>
          <Button as={Link} to="/login" size="sm">
            Log in
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Desktop filters */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-6 rounded-xl border border-line bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Filters</h2>
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-xs font-medium text-accent-text hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            {sidebar}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or topic"
                aria-label="Search problems"
                className="h-11 w-full rounded-lg border border-line bg-surface pl-10 pr-10 text-sm transition-colors placeholder:text-placeholder hover:border-muted/50"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-ink"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <kbd
                  className="pointer-events-none absolute right-3 top-1/2 hidden h-5 -translate-y-1/2 items-center rounded border border-line bg-subtle px-1.5 font-mono text-[11px] text-muted sm:inline-flex"
                  aria-hidden="true"
                >
                  /
                </kbd>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  aria-label="Sort problems"
                  className="h-11 w-full appearance-none rounded-lg border border-line bg-surface pl-3.5 pr-9 text-sm transition-colors hover:border-muted/50 sm:w-48"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
              </div>
              <Button
                variant="secondary"
                icon={SlidersHorizontal}
                onClick={() => setFiltersOpen(true)}
                className="h-11 lg:hidden"
              >
                Filters{activeFilters > 0 && ` (${activeFilters})`}
              </Button>
            </div>
          </div>

          {/* Quick difficulty filters */}
          {ready && problems.length > 0 && (
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Filter by difficulty">
              <QuickFilterChip active={filters.difficulties.length === 0} onClick={() => setFilters((c) => ({ ...c, difficulties: [] }))} count={problems.length}>
                All
              </QuickFilterChip>
              {DIFFICULTIES.map((level) => (
                <QuickFilterChip
                  key={level}
                  active={filters.difficulties.includes(level)}
                  onClick={() => toggleDifficulty(level)}
                  count={counts[level]}
                  dotClass={BAR_TONES[level]}
                >
                  {level}
                </QuickFilterChip>
              ))}
            </div>
          )}

          {/* Result summary + active filters */}
          {ready && (
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="text-sm text-muted" aria-live="polite">
                Showing <span className="font-medium tabular-nums text-ink">{sorted.length}</span> of{' '}
                <span className="tabular-nums">{problems.length}</span>
              </p>
              {activeChips.map((chip) => (
                <ActiveChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
              ))}
              {hasCriteria && (
                <button type="button" onClick={clearAll} className="text-xs font-medium text-accent-text hover:underline">
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* List */}
          <div className="mt-3">
            {loading ? (
              <ul className="space-y-2" aria-label="Loading problems">
                {Array.from({ length: 6 }, (_, index) => (
                  <li key={index}>
                    <ProblemCardSkeleton />
                  </li>
                ))}
              </ul>
            ) : error ? (
              <StatePanel
                icon={AlertCircle}
                tone="danger"
                title={error}
                description="Check your connection and try again."
              >
                <Button variant="secondary" size="sm" onClick={reload}>
                  Try again
                </Button>
              </StatePanel>
            ) : sorted.length === 0 ? (
              <StatePanel
                icon={SearchX}
                title="No problems match"
                description="Try a different search term or remove some filters."
              >
                {hasCriteria && (
                  <Button variant="secondary" size="sm" onClick={clearAll}>
                    Clear search and filters
                  </Button>
                )}
              </StatePanel>
            ) : (
              <ul className="space-y-2">
                {sorted.map((problem) => (
                  <li key={problem.slug}>
                    <ProblemCard problem={problem} solved={solved.has(problem.slug)} showStatus={isAuthenticated} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters */}
      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFilters(EMPTY_FILTERS)} disabled={activeFilters === 0}>
              Clear
            </Button>
            <Button onClick={() => setFiltersOpen(false)}>Show {pluralize(sorted.length, 'problem')}</Button>
          </>
        }
      >
        {sidebar}
      </Modal>
    </div>
  );
}
