import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Loader from '@/components/Loader';
import { cn } from '@/utils/cn';

function Field({ label, value, tone }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted">{label}</p>
      <pre className={cn('overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-subtle px-3 py-2 font-mono text-[13px] leading-5', tone)}>
        {value}
      </pre>
    </div>
  );
}

/**
 * Shows sample cases before a run, and the verdict + per-case output after it.
 * `state`: 'idle' | 'running' | 'done' | 'error'
 */
export default function Console({ id, state, result, error, samples }) {
  const cases = result?.cases ?? samples.map((sample) => ({ input: sample.input, expected: sample.output }));
  const firstFailed = result ? result.cases.findIndex((item) => !item.passed) : -1;
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(firstFailed >= 0 ? firstFailed : 0);
  }, [result, firstFailed]);

  const current = cases[Math.min(active, cases.length - 1)];
  const accepted = result?.status === 'Accepted';

  let body;
  if (state === 'running') {
    body = <Loader label="Running your code" size="sm" className="py-4" />;
  } else if (state === 'error') {
    body = (
      <p role="alert" className="rounded-md bg-hard-soft px-3 py-2 text-sm text-hard">
        {error}
      </p>
    );
  } else {
    body = (
      <div className="space-y-4">
        <div aria-live="polite">
          {result ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-base font-semibold',
                accepted ? 'bg-easy-soft text-easy' : 'bg-hard-soft text-hard',
              )}>
                {accepted ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : <XCircle className="h-5 w-5" aria-hidden="true" />}
                {result.status}
              </p>
              {accepted && (
                <p className="text-sm text-muted">
                  Runtime {result.runtimeMs} ms, memory {result.memoryMb} MB
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">Run your code to check it against the sample cases.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {cases.map((item, index) => (
            <button
              key={index}
              type="button"
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors',
                index === active ? 'bg-subtle font-medium text-ink' : 'text-muted hover:bg-subtle hover:text-ink',
              )}
            >
              {result && (
                <span
                  aria-hidden="true"
                  className={cn('h-1.5 w-1.5 rounded-full', item.passed ? 'bg-easy' : 'bg-hard')}
                />
              )}
              Case {index + 1}
              {result && <span className="sr-only">{item.passed ? ' passed' : ' failed'}</span>}
            </button>
          ))}
        </div>

        {current && (
          <div className="space-y-3">
            <Field label="Input" value={current.input} />
            {result && <Field label="Output" value={current.output} tone={current.passed ? undefined : 'text-hard'} />}
            <Field label="Expected" value={current.expected} />
            {result?.error && <Field label="Error" value={result.error} tone="text-hard" />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div id={id} role="region" aria-label="Console" className="h-56 shrink-0 overflow-y-auto border-t border-line bg-surface p-4">
      {body}
    </div>
  );
}
