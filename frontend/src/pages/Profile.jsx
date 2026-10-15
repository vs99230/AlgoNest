import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { StatusBadge } from '@/components/Badge';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import usePageTitle from '@/hooks/usePageTitle';
import { getErrorMessage } from '@/services/api';
import { getProfile } from '@/services/userService';
import { cn } from '@/utils/cn';
import { DIFFICULTIES, getLanguageLabel } from '@/utils/constants';
import { formatDate, formatRelativeTime, pluralize } from '@/utils/format';
import { toDateKey } from '@/utils/streak';

const WEEKS = 16;

const LEVEL_STYLE = {
  Easy: {
    bar: 'bg-easy',
    text: 'text-easy',
    dot: 'bg-easy',
  },
  Medium: {
    bar: 'bg-medium',
    text: 'text-medium',
    dot: 'bg-medium',
  },
  Hard: {
    bar: 'bg-hard',
    text: 'text-hard',
    dot: 'bg-hard',
  },
};

const cardClass =
  'rounded-2xl border border-line bg-surface';

function StatCard({ icon: Icon, label, value, hint, accent = 'accent' }) {
  const accents = {
    accent: 'bg-accent-soft text-accent',
    amber: 'bg-sun-soft text-sun-text',
    emerald: 'bg-easy-soft text-easy',
    rose: 'bg-hard-soft text-hard',
  };

  return (
    <div
      className={cn(cardClass, 'p-5 transition-colors duration-150 hover:border-muted/50')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tabular-nums leading-none text-ink sm:text-3xl">
            {value}
          </p>

          {hint && (
            <p className="mt-2 text-xs leading-relaxed text-muted">{hint}</p>
          )}
        </div>

        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            accents[accent],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children, className, action }) {
  return (
    <section className={cn(cardClass, 'p-5 sm:p-6', className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-base font-bold text-ink">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          {title}
        </h2>

        {action}
      </div>

      <div>{children}</div>
    </section>
  );
}

function ProgressRing({ solved, total, size = 132 }) {
  const percent = total ? Math.round((solved / total) * 100) : 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex h-[132px] w-[132px] items-center justify-center">
      <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-subtle"
        />

        <circle
          cx="66"
          cy="66"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-accent transition-all duration-150"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-ink">
          {percent}%
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
          Completed
        </span>
      </div>
    </div>
  );
}

function ActivityGrid({ activity }) {
  const { weeks, activeDays, best } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);

    let active = 0;
    let max = 0;

    const cells = Array.from({ length: WEEKS * 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      const key = toDateKey(date);
      const count = activity[key] ?? 0;

      if (count > 0) active += 1;
      max = Math.max(max, count);

      return { key, count, future: date > today };
    });

    const grouped = Array.from({ length: WEEKS }, (_, week) =>
      cells.slice(week * 7, week * 7 + 7),
    );

    return { weeks: grouped, activeDays: active, best: max };
  }, [activity]);

  const shade = (count) => {
    if (count === 0) return 'bg-subtle';
    if (best <= 1) return 'bg-easy';

    const ratio = count / best;

    if (ratio > 0.66) return 'bg-easy';
    if (ratio > 0.33) return 'bg-easy/60';
    return 'bg-easy/30';
  };

  return (
    <div>
      <div
        role="img"
        aria-label={`Submission activity for the last ${WEEKS} weeks: ${pluralize(activeDays, 'active day')}`}
        className="flex gap-1.5 overflow-x-auto pb-2"
      >
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-1.5">
            {week.map((cell) => (
              <span
                key={cell.key}
                title={
                  cell.future
                    ? undefined
                    : `${cell.key}: ${pluralize(cell.count, 'submission')}`
                }
                className={cn(
                  'h-3.5 w-3.5 rounded-md',
                  cell.future ? 'bg-transparent' : shade(cell.count),
                )}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span className="font-medium">
          {pluralize(activeDays, 'active day')} in the last {WEEKS} weeks
        </span>

        <span className="flex items-center gap-1.5">
          Less
          <span className="h-3 w-3 rounded-md bg-subtle" />
          <span className="h-3 w-3 rounded-md bg-easy/30" />
          <span className="h-3 w-3 rounded-md bg-easy/60" />
          <span className="h-3 w-3 rounded-md bg-easy" />
          More
        </span>
      </div>
    </div>
  );
}

function ProfileError({ error, onRetry }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-hard-soft text-hard">
        <Zap className="h-6 w-6" aria-hidden="true" />
      </div>

      <h1 className="mt-5 text-xl font-bold">Profile unavailable</h1>
      <p role="alert" className="mt-2 text-sm leading-relaxed text-muted">
        {error}
      </p>

      <Button onClick={onRetry} className="mt-6 rounded-full">
        Try again
      </Button>
    </div>
  );
}

export default function Profile() {
  usePageTitle('Profile');

  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setState((previous) => ({ ...previous, loading: true, error: null }));

    getProfile()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: getErrorMessage(
              error,
              'Could not load your profile.',
            ),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const { data, loading, error } = state;

  if (loading) return <Loader fullPage label="Loading profile" />;

  if (error || !data) {
    return (
      <ProfileError
        error={error}
        onRetry={() => setReloadKey((key) => key + 1)}
      />
    );
  }

  const { user, stats, streak, activity, recentSubmissions } = data;
  const initial = (user.username.trim()[0] ?? '?').toUpperCase();
  const completionRate = stats.totalProblems
    ? Math.round((stats.totalSolved / stats.totalProblems) * 100)
    : 0;

  return (
    <div className="min-h-full bg-bg">
      <div>
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
          <div className={cn(cardClass, 'p-6 sm:p-8')}>
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:text-left">
              <div>
                <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-accent text-4xl font-bold text-white">
                  {initial}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {user.username}
                  </h1>

                  {streak.current > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1 text-xs font-bold text-sun-text">
                      <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                      {pluralize(streak.current, 'day')} streak
                    </span>
                  )}
                </div>

                <p className="mt-1 truncate text-sm text-muted">{user.email}</p>

                <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted lg:justify-start">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  Joined{' '}
                  {formatDate(user.joinedAt, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-5 rounded-2xl border border-line bg-surface p-4">
                <ProgressRing
                  solved={stats.totalSolved}
                  total={stats.totalProblems}
                />

                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Overall progress
                  </p>

                  <p className="mt-1 text-lg font-bold tabular-nums text-ink">
                    {stats.totalSolved}
                    <span className="text-muted"> / {stats.totalProblems}</span>
                  </p>

                  <p className="mt-1 text-xs text-muted">problems solved</p>

                  <Button
                    as={Link}
                    to="/problems"
                    size="sm"
                    className="mt-3 rounded-full"
                  >
                    Continue practicing
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Trophy}
            accent="accent"
            label="Problems solved"
            value={stats.totalSolved}
            hint={`${completionRate}% of ${stats.totalProblems} problems`}
          />

          <StatCard
            icon={Flame}
            accent="amber"
            label="Current streak"
            value={pluralize(streak.current, 'day')}
            hint="Keep solving daily to extend it"
          />

          <StatCard
            icon={Award}
            accent="emerald"
            label="Best streak"
            value={pluralize(streak.longest, 'day')}
            hint="Your longest consistent run"
          />

          <StatCard
            icon={Zap}
            accent="rose"
            label="Total points"
            value={stats.points}
            hint="Earned from accepted solutions"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Card title="Difficulty progress" icon={Target}>
            <ul className="space-y-5">
              {DIFFICULTIES.map((level) => {
                const total = stats.totals[level];
                const solved = stats.solved[level];
                const style = LEVEL_STYLE[level];
                const percent = total ? Math.round((solved / total) * 100) : 0;

                return (
                  <li key={level}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-semibold text-ink">
                        <span
                          className={cn('h-2.5 w-2.5 rounded-full', style.dot)}
                          aria-hidden="true"
                        />
                        {level}
                      </span>

                      <span className="rounded-full bg-subtle px-2.5 py-1 text-xs font-bold tabular-nums text-muted">
                        {solved} / {total}
                      </span>
                    </div>

                    <div
                      role="progressbar"
                      aria-label={`${level} problems solved`}
                      aria-valuemin={0}
                      aria-valuemax={total}
                      aria-valuenow={solved}
                      className="h-2.5 overflow-hidden rounded-full bg-subtle"
                    >
                      <div
                        className={cn('h-full rounded-full transition-[width] duration-150', style.bar)}
                        style={{
                          width: `${percent}%`,
                        }}
                      />
                    </div>

                    <p className={cn('mt-1.5 text-right text-xs font-semibold', style.text)}>
                      {percent}%
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-easy/20 bg-easy-soft p-4">
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-easy"
                aria-hidden="true"
              />

              <p className="text-sm leading-relaxed text-muted">
                You have earned{' '}
                <span className="font-bold text-ink">{stats.points} points</span>{' '}
                from{' '}
                <span className="font-bold text-ink">
                  {stats.totalSolved} solved problems
                </span>
                .
              </p>
            </div>
          </Card>

          <Card
            title="Activity"
            icon={Activity}
            action={
              <span className="rounded-full bg-subtle px-3 py-1 text-xs font-semibold text-muted">
                Last {WEEKS} weeks
              </span>
            }
          >
            <ActivityGrid activity={activity} />
          </Card>
        </div>

        <Card
          title="Recent submissions"
          icon={Trophy}
          className="mt-4"
          action={
            <Button
              as={Link}
              to="/problems"
              variant="ghost"
              size="sm"
              className="rounded-full border border-line bg-surface"
            >
              Browse problems
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          }
        >
          {recentSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-subtle/40 px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Target className="h-5 w-5" aria-hidden="true" />
              </div>

              <p className="mt-4 text-sm font-semibold text-ink">
                No submissions yet
              </p>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">
                Solve your first problem and your submission history will appear
                here.
              </p>

              <Button
                as={Link}
                to="/problems"
                size="sm"
                className="mt-5 rounded-full"
              >
                Start solving
              </Button>
            </div>
          ) : (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-separate border-spacing-y-2 text-sm">
                <caption className="sr-only">
                  Your most recent submissions
                </caption>

                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted">
                    <th scope="col" className="px-4 pb-2 font-semibold">
                      Problem
                    </th>
                    <th scope="col" className="px-4 pb-2 font-semibold">
                      Status
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 pb-2 font-semibold sm:table-cell"
                    >
                      Language
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 pb-2 text-right font-semibold sm:table-cell"
                    >
                      Runtime
                    </th>
                    <th scope="col" className="px-4 pb-2 text-right font-semibold">
                      Submitted
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentSubmissions.map((item) => (
                    <tr
                      key={item.id}
                      className="group bg-surface transition-colors duration-150 hover:bg-selected"
                    >
                      <td className="rounded-l-2xl border-y border-l border-line/70 py-3.5 pl-4 pr-4">
                        <Link
                          to={`/problems/${item.problemSlug}`}
                          className="font-semibold text-ink transition-colors group-hover:text-accent"
                        >
                          {item.problemTitle}
                        </Link>
                      </td>

                      <td className="border-y border-line/70 py-3.5 px-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="hidden border-y border-line/70 py-3.5 px-4 text-muted sm:table-cell">
                        {getLanguageLabel(item.language)}
                      </td>

                      <td className="hidden border-y border-line/70 py-3.5 px-4 text-right font-medium tabular-nums text-muted sm:table-cell">
                        {item.status === 'Accepted'
                          ? `${item.runtimeMs} ms`
                          : '—'}
                      </td>

                      <td className="rounded-r-2xl border-y border-r border-line/70 py-3.5 px-4 text-right text-muted">
                        {formatRelativeTime(item.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
