import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Circle } from 'lucide-react';
import { Badge, DifficultyBadge } from '@/components/Badge';
import { Skeleton } from '@/components/Loader';
import { cn } from '@/utils/cn';

const VISIBLE_TAGS = 3;

export default function ProblemCard({
  problem,
  solved = false,
  showStatus = false,
  className,
}) {
  const visibleTags = problem.tags.slice(0, VISIBLE_TAGS);
  const hiddenCount = Math.max(problem.tags.length - visibleTags.length, 0);
  const acceptance = Number(problem.acceptance ?? 0);

  return (
    <Link
      to={`/problems/${problem.slug}`}
      className={cn(
        'group relative flex items-center gap-3 overflow-hidden rounded-xl border border-line bg-surface p-3.5 transition-colors duration-150',
        'hover:border-accent/30 hover:bg-selected',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        className,
      )}
    >
      {showStatus && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-subtle transition-colors duration-150 group-hover:border-accent/25">
          {solved ? (
            <CheckCircle2
              className="h-5 w-5 text-easy"
              aria-hidden="true"
            />
          ) : (
            <Circle className="h-5 w-5 text-line transition-colors duration-150 group-hover:text-muted" aria-hidden="true" />
          )}

          <span className="sr-only">{solved ? 'Solved' : 'Not solved'}</span>
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 rounded-md bg-subtle px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-muted">
            {problem.id}
          </span>

          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink transition-colors duration-150 group-hover:text-accent-text">
            {problem.title}
          </p>

          <ArrowUpRight
            className="ml-auto hidden h-4 w-4 shrink-0 text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100 sm:block"
            aria-hidden="true"
          />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {visibleTags.map((tag) => (
            <Badge key={tag} size="xs" dot={false}>
              {tag}
            </Badge>
          ))}

          {hiddenCount > 0 && (
            <Badge tone="neutral" size="xs" dot={false}>
              +{hiddenCount}
            </Badge>
          )}
        </div>
      </div>

      <div className="hidden w-24 shrink-0 flex-col items-end gap-1.5 sm:flex">
        <span className="text-xs font-semibold tabular-nums text-muted">
          {acceptance.toFixed(1)}%
        </span>

        <span className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
          <span
            className="block h-full rounded-full bg-accent transition-[width] duration-150"
            style={{ width: `${Math.min(Math.max(acceptance, 0), 100)}%` }}
          />
        </span>

        <span className="text-[10px] uppercase tracking-wide text-muted">
          Accepted
        </span>
      </div>

      <DifficultyBadge
        difficulty={problem.difficulty}
        size="sm"
        className="shrink-0 justify-center"
      />
    </Link>
  );
}

export function ProblemCardSkeleton() {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5"
      aria-hidden="true"
    >
      <Skeleton className="h-9 w-9 rounded-xl" />

      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-10 rounded-md" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>

      <div className="hidden w-24 space-y-2 sm:block">
        <Skeleton className="ml-auto h-3 w-10" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>

      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}
