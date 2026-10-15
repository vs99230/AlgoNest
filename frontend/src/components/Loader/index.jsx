import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Loader({ label = 'Loading', size = 'md', fullPage = false, className }) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-center justify-center gap-2 text-muted',
        fullPage ? 'h-full min-h-[50vh] w-full' : 'py-8',
        className,
      )}
    >
      <Loader2 className={cn('animate-spin', size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')} aria-hidden="true" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

/** Placeholder block shown while content loads (fades in and out). */
export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-subtle', className)} />;
}
