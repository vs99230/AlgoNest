import { useId } from 'react';
import { Filter, RotateCcw, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import { DIFFICULTIES, STATUS_FILTERS } from '@/utils/constants';
import { cn } from '@/utils/cn';

export const EMPTY_FILTERS = {
  difficulties: [],
  status: 'all',
  tags: [],
};

export const countActiveFilters = (filters) =>
  filters.difficulties.length +
  filters.tags.length +
  (filters.status !== 'all' ? 1 : 0);

const toggle = (list, value) =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

const difficultyStyles = {
  Easy: {
    dot: 'bg-easy',
    active: 'border-easy/30 bg-easy-soft text-easy',
  },
  Medium: {
    dot: 'bg-medium',
    active: 'border-medium/30 bg-medium-soft text-medium',
  },
  Hard: {
    dot: 'bg-hard',
    active: 'border-hard/30 bg-hard-soft text-hard',
  },
};

function Section({ title, icon: Icon, action, children }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 transition-colors duration-150 hover:border-muted/50">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          {Icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
          {title}
        </h3>

        {action}
      </div>

      {children}
    </section>
  );
}

function OptionRow({ active, disabled, onClick, children, className }) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors duration-150',
        active
          ? className
          : 'border-transparent bg-subtle/50 text-muted hover:border-line hover:bg-subtle hover:text-ink',
        disabled && 'cursor-not-allowed opacity-50 hover:border-transparent hover:bg-subtle/50',
      )}
    >
      {children}
    </label>
  );
}

function Check({ checked }) {
  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150',
        checked
          ? 'border-accent bg-accent text-white shadow-sm shadow-accent/30'
          : 'border-line bg-surface group-hover:border-muted/50',
      )}
    >
      {checked && (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.8a1 1 0 0 1 1.4 0Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </span>
  );
}

function Radio({ checked }) {
  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150',
        checked
          ? 'border-accent bg-accent/15'
          : 'border-line bg-surface group-hover:border-muted/50',
      )}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-sm shadow-accent/40" />}
    </span>
  );
}

export default function Sidebar({
  filters,
  onChange,
  counts,
  tags,
  canFilterStatus,
  className,
}) {
  const radioName = useId();
  const activeCount = countActiveFilters(filters);

  return (
    <aside
      aria-label="Problem filters"
      className={cn(
        'space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1',
        className,
      )}
    >
      <div className="flex items-center justify-between rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
            <Filter className="h-4 w-4" aria-hidden="true" />
          </span>

          <div>
            <p className="text-sm font-bold">Filters</p>
            <p className="text-xs text-muted">
              {activeCount > 0
                ? `${activeCount} active filter${activeCount > 1 ? 's' : ''}`
                : 'Refine your practice'}
            </p>
          </div>
        </div>

        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="rounded-full border border-line bg-surface"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </Button>
        )}
      </div>

      <Section title="Difficulty" icon={Sparkles}>
        <div className="space-y-2">
          {DIFFICULTIES.map((level) => {
            const active = filters.difficulties.includes(level);
            const style = difficultyStyles[level] ?? difficultyStyles.Easy;

            return (
              <OptionRow
                key={level}
                active={active}
                onClick={() =>
                  onChange({
                    ...filters,
                    difficulties: toggle(filters.difficulties, level),
                  })
                }
                className={style.active}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={active}
                  onChange={() =>
                    onChange({
                      ...filters,
                      difficulties: toggle(filters.difficulties, level),
                    })
                  }
                />

                <Check checked={active} />

                <span className="flex flex-1 items-center gap-2 font-medium">
                  <span
                    className={cn('h-2 w-2 rounded-full', style.dot)}
                    aria-hidden="true"
                  />
                  {level}
                </span>

                <span className="rounded-full bg-surface/80 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted">
                  {counts[level] ?? 0}
                </span>
              </OptionRow>
            );
          })}
        </div>
      </Section>

      <Section title="Status">
        <div role="radiogroup" aria-label="Status" className="space-y-2">
          {STATUS_FILTERS.map((option) => {
            const active = filters.status === option.id;
            const disabled = option.id !== 'all' && !canFilterStatus;

            return (
              <OptionRow
                key={option.id}
                active={active}
                disabled={disabled}
                className="border-accent/35 bg-selected text-accent-text"
              >
                <input
                  type="radio"
                  name={radioName}
                  className="sr-only"
                  checked={active}
                  disabled={disabled}
                  onChange={() => onChange({ ...filters, status: option.id })}
                />

                <Radio checked={active} />

                <span className="flex-1 font-medium">{option.label}</span>
              </OptionRow>
            );
          })}
        </div>

        {!canFilterStatus && (
          <p className="mt-3 rounded-xl border border-dashed border-line bg-subtle/50 px-3 py-2 text-xs leading-relaxed text-muted">
            Log in to filter problems by your solved status.
          </p>
        )}
      </Section>

      <Section title="Topics">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = filters.tags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({ ...filters, tags: toggle(filters.tags, tag) })
                }
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
                  active
                    ? 'border-accent/40 bg-selected text-accent-text'
                    : 'border-line bg-subtle text-muted hover:border-accent/30 hover:bg-surface hover:text-ink',
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </Section>

      {activeCount > 0 && (
        <Button
          variant="secondary"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="w-full rounded-2xl"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Clear all filters
        </Button>
      )}
    </aside>
  );
}
