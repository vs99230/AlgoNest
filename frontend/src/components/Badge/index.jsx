import { cn } from '@/utils/cn';

const baseBadge =
  'relative inline-flex select-none items-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-150';

const tones = {
  neutral: {
    className: 'border-line bg-subtle text-muted',
    dot: 'bg-muted',
  },
  accent: {
    className: 'border-accent/25 bg-accent-soft text-accent-text',
    dot: 'bg-accent',
  },
  easy: {
    className: 'border-easy/25 bg-easy-soft text-easy',
    dot: 'bg-easy',
  },
  medium: {
    className: 'border-medium/25 bg-medium-soft text-medium',
    dot: 'bg-medium',
  },
  hard: {
    className: 'border-hard/25 bg-hard-soft text-hard',
    dot: 'bg-hard',
  },
};

const sizes = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-[11px]',
  md: 'px-3 py-1.5 text-xs',
};

export function Badge({
  tone = 'neutral',
  size = 'sm',
  dot = true,
  className,
  children,
  ...props
}) {
  const currentTone = tones[tone] ?? tones.neutral;

  return (
    <span
      className={cn(
        baseBadge,
        sizes[size],
        currentTone.className,
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            currentTone.dot,
          )}
        />
      )}

      <span className="relative">{children}</span>
    </span>
  );
}

export function DifficultyBadge({ difficulty, className }) {
  const tone = difficulty?.toLowerCase();

  return (
    <Badge
      tone={tone}
      className={className}
    >
      {difficulty}
    </Badge>
  );
}

const STATUS_TONES = {
  Accepted: 'easy',
  'Wrong Answer': 'hard',
  Pending: 'medium',
  'Time Limit Exceeded': 'hard',
  'Runtime Error': 'hard',
  'Compilation Error': 'hard',
};

export function StatusBadge({ status, className }) {
  return (
    <Badge
      tone={STATUS_TONES[status] ?? 'medium'}
      className={className}
    >
      {status}
    </Badge>
  );
}

export default Badge;
