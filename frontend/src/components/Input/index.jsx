import { forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';

/** Labelled text field with inline error/hint. `right` renders inside the field (e.g. a show-password toggle). */
const Input = forwardRef(function Input({ label, error, hint, right, id, className, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-lg border bg-surface px-3 text-sm transition-colors placeholder:text-placeholder',
            error ? 'border-hard' : 'border-line hover:border-muted/50',
            right && 'pr-11',
          )}
          {...props}
        />
        {right && <div className="absolute right-1 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-hard">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
