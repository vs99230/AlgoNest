import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Flame, Medal, RefreshCw, Trophy, Zap } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import useAuth from '@/hooks/useAuth';
import usePageTitle from '@/hooks/usePageTitle';
import { getErrorMessage } from '@/services/api';
import { getLeaderboard } from '@/services/userService';
import { cn } from '@/utils/cn';
import { POINTS } from '@/utils/constants';

const PODIUM_STYLES = {
  1: {
    icon: Crown,
    iconClass: 'bg-sun-soft text-sun-text',
    cardClass: 'border-sun/20 bg-surface',
    medal: 'text-sun-text',
    label: 'Champion',
  },
  2: {
    icon: Medal,
    iconClass: 'bg-subtle text-muted',
    cardClass: 'border-line bg-surface',
    medal: 'text-muted',
    label: 'Runner-up',
  },
  3: {
    icon: Medal,
    iconClass: 'bg-subtle text-muted',
    cardClass: 'border-line bg-surface',
    medal: 'text-muted',
    label: 'Third place',
  },
};

const glassCard = 'rounded-2xl border border-line bg-surface';

function PodiumCard({ row, isYou }) {
  const style = PODIUM_STYLES[row.rank] ?? PODIUM_STYLES[3];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        glassCard,
        'group relative p-5 transition-colors duration-150 hover:border-muted/50',
        style.cardClass,
      )}
    >
      <div className="relative flex items-center justify-between">
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-2xl',
            style.iconClass,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        <span className="text-3xl font-black tabular-nums text-rank/50">
          #{row.rank}
        </span>
      </div>

      <div className="relative mt-5 flex items-center gap-3">
        <Avatar name={row.username} size="md" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold text-ink">{row.username}</p>

            {isYou && <Badge tone="accent">You</Badge>}
          </div>

          <p className={cn('text-xs font-semibold uppercase tracking-wide', style.medal)}>
            {style.label}
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 rounded-xl border border-line bg-subtle/50 p-3 text-center">
        <div>
          <p className="text-lg font-bold tabular-nums text-ink">{row.points}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Points
          </p>
        </div>

        <div className="border-x border-line/70">
          <p className="text-lg font-bold tabular-nums text-ink">{row.solved}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Solved
          </p>
        </div>

        <div>
          <p className="flex items-center justify-center gap-1 text-lg font-bold tabular-nums text-ink">
            {row.streak > 0 && (
              <Flame className="h-3.5 w-3.5 text-sun-text" aria-hidden="true" />
            )}
            {row.streak}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Streak
          </p>
        </div>
      </div>
    </div>
  );
}

function RankPill({ rank }) {
  if (rank <= 3) {
    const style = PODIUM_STYLES[rank];

    return (
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-xl',
          style.iconClass,
        )}
      >
        {rank}
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-subtle text-sm font-bold tabular-nums text-rank">
      {rank}
    </span>
  );
}

export default function Leaderboard() {
  usePageTitle('Leaderboard');

  const { user } = useAuth();
  const [state, setState] = useState({
    rows: [],
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setState((previous) => ({ ...previous, loading: true, error: null }));

    getLeaderboard()
      .then((rows) => {
        if (!cancelled) setState({ rows, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            rows: [],
            loading: false,
            error: getErrorMessage(
              error,
              'Could not load the leaderboard.',
            ),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, user?.username]);

  const { rows, loading, error } = state;
  const podium = rows.slice(0, 3);
  const others = rows.slice(3);

  return (
    <div className="min-h-full bg-bg">
      <div>
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6">
          <div className={cn(glassCard, 'p-6 sm:p-8')}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sun-soft text-sun-text">
                  <Trophy className="h-6 w-6" aria-hidden="true" />
                </span>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">
                    Global rankings
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    AlgoNest Leaderboard
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                    Ranked by total points. Earn{' '}
                    <span className="font-semibold text-ink">
                      {POINTS.Easy}
                    </span>{' '}
                    points for Easy,{' '}
                    <span className="font-semibold text-ink">
                      {POINTS.Medium}
                    </span>{' '}
                    for Medium and{' '}
                    <span className="font-semibold text-ink">
                      {POINTS.Hard}
                    </span>{' '}
                    for Hard problems.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-line bg-surface px-4 py-3 text-center">
                  <p className="text-lg font-bold tabular-nums text-ink">
                    {rows.length}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Coders
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="rounded-full border border-line bg-surface"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        {loading ? (
          <Loader label="Loading leaderboard" />
        ) : error ? (
          <div className={cn(glassCard, 'mx-auto max-w-lg p-8 text-center')}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-hard-soft text-hard">
              <Zap className="h-6 w-6" aria-hidden="true" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-ink">
              Leaderboard unavailable
            </h2>

            <p role="alert" className="mt-2 text-sm leading-relaxed text-muted">
              {error}
            </p>

            <Button
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-6 rounded-full"
            >
              Try again
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className={cn(glassCard, 'mx-auto max-w-lg p-10 text-center')}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Trophy className="h-6 w-6" aria-hidden="true" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-ink">
              No rankings yet
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Be the first coder on AlgoNest. Solve a problem to claim the top
              spot.
            </p>

            <Button as={Link} to="/problems" className="mt-6 rounded-full">
              Start solving
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {podium.map((row) => {
                const isYou =
                  row.isYou ||
                  (user && row.username === user.username);

                return (
                  <PodiumCard
                    key={row.username}
                    row={row}
                    isYou={isYou}
                  />
                );
              })}
            </div>

            {others.length > 0 && (
              <div className={cn(glassCard, 'mt-6 overflow-hidden')}>
                <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
                    Full rankings
                  </h2>

                  <span className="rounded-full bg-subtle px-3 py-1 text-xs font-semibold text-muted">
                    {others.length} more
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[36rem] border-separate border-spacing-y-2 px-3 text-sm">
                    <caption className="sr-only">
                      Top solvers ranked by points
                    </caption>

                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider text-muted">
                        <th scope="col" className="w-20 px-4 pb-2 font-semibold">
                          Rank
                        </th>
                        <th scope="col" className="px-4 pb-2 font-semibold">
                          Coder
                        </th>
                        <th
                          scope="col"
                          className="px-4 pb-2 text-right font-semibold"
                        >
                          Solved
                        </th>
                        <th
                          scope="col"
                          className="hidden px-4 pb-2 text-right font-semibold sm:table-cell"
                        >
                          Streak
                        </th>
                        <th
                          scope="col"
                          className="px-4 pb-2 text-right font-semibold"
                        >
                          Points
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {others.map((row) => {
                        const isYou =
                          row.isYou ||
                          (user && row.username === user.username);

                        return (
                          <tr
                            key={row.username}
                            aria-current={isYou ? 'true' : undefined}
                            className={cn(
                              'group transition-colors duration-150',
                              isYou
                                ? 'bg-selected ring-1 ring-accent/25'
                                : 'bg-surface hover:bg-selected',
                            )}
                          >
                            <td className="rounded-l-2xl border-y border-l border-line/70 py-3.5 pl-4 pr-4">
                              <RankPill rank={row.rank} />
                            </td>

                            <td className="border-y border-line/70 py-3.5 px-4">
                              <span className="flex items-center gap-3">
                                <Avatar name={row.username} size="sm" />

                                <span className="min-w-0">
                                  <span className="flex items-center gap-2">
                                    <span className="truncate font-semibold text-ink transition-colors group-hover:text-accent-text">
                                      {row.username}
                                    </span>

                                    {isYou && (
                                      <Badge tone="accent">You</Badge>
                                    )}
                                  </span>
                                </span>
                              </span>
                            </td>

                            <td className="border-y border-line/70 py-3.5 px-4 text-right font-semibold tabular-nums text-ink">
                              {row.solved}
                            </td>

                            <td className="hidden border-y border-line/70 py-3.5 px-4 text-right sm:table-cell">
                              <span className="inline-flex items-center justify-end gap-1.5 font-medium tabular-nums text-muted">
                                {row.streak > 0 && (
                                  <Flame
                                    className="h-3.5 w-3.5 text-sun-text"
                                    aria-hidden="true"
                                  />
                                )}
                                {row.streak}
                              </span>
                            </td>

                            <td className="rounded-r-2xl border-y border-r border-line/70 py-3.5 px-4 text-right">
                              <span className="inline-flex items-center justify-end gap-1.5 font-bold tabular-nums text-ink">
                                <Zap
                                  className="h-3.5 w-3.5 text-accent"
                                  aria-hidden="true"
                                />
                                {row.points}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
