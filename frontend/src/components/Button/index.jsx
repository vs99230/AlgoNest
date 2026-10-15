import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const base =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

const variants = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-subtle',
  ghost: 'text-ink hover:bg-subtle',
  danger: 'border border-hard/30 bg-hard-soft text-hard hover:border-hard/50',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

/**
 * `icon` is a component (e.g. Play from lucide-react).
 * Pass `as={Link} to="/x"` to render a router link that looks like a button.
 */
const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'primary', size = 'md', icon: Icon, loading = false, fullWidth = false, className, children, disabled, type, ...props },
  ref,
) {
  const isNativeButton = Component === 'button';
  const inactive = disabled || loading;

  return (
    <Component
      ref={ref}
      type={isNativeButton ? type ?? 'button' : undefined}
      disabled={isNativeButton ? inactive : undefined}
      aria-disabled={!isNativeButton && inactive ? true : undefined}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      {children}
    </Component>
  );
});

export default Button;

const iconVariants = {
  ghost: 'text-muted hover:bg-subtle hover:text-ink',
  secondary: 'border border-line bg-surface text-ink hover:bg-subtle',
};

export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, variant = 'ghost', className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn('inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors', iconVariants[variant], className)}
      {...props}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </button>
  );
});
