import { cn } from '@/utils/cn';

const sizes = {
  xs: 'h-7 w-7 text-[11px] ring-1',
  sm: 'h-8 w-8 text-xs ring-1',
  md: 'h-10 w-10 text-sm ring-2',
  lg: 'h-14 w-14 text-lg ring-2',
  xl: 'h-20 w-20 text-2xl ring-2',
};

function getInitials(name = '') {
  const cleaned = name.trim();

  if (!cleaned) return '?';

  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function Avatar({
  name = '',
  src,
  size = 'md',
  status,
  className,
  imgClassName,
}) {
  const initials = getInitials(name);
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center',
        sizes[size],
        className,
      )}
    >
      <span
        aria-hidden={src ? undefined : 'true'}
        title={name || undefined}
        className={cn(
          'relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-accent font-bold text-white ring-surface',
          sizes[size],
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name || 'User avatar'}
            className={cn(
              'h-full w-full object-cover',
              imgClassName,
            )}
          />
        ) : (
          <span className="drop-shadow-sm">{initials}</span>
        )}
      </span>

      {status && (
        <span
          aria-label={`Status: ${status}`}
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-surface',
            size === 'xs' || size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3',
            status === 'online' && 'bg-easy',
            status === 'away' && 'bg-medium',
            status === 'offline' && 'bg-muted',
          )}
        />
      )}
    </span>
  );
}
