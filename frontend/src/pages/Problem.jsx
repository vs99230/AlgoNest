import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, Code2, FileQuestion, FileText } from 'lucide-react';
import { Badge, DifficultyBadge } from '@/components/Badge';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import useAuth from '@/hooks/useAuth';
import useLocalStorage from '@/hooks/useLocalStorage';
import usePageTitle from '@/hooks/usePageTitle';
import { useProblem } from '@/hooks/useProblems';
import { getSolvedSlugs } from '@/services/submissionService';
import { cn } from '@/utils/cn';
import { clamp } from '@/utils/helpers';
import { renderInline } from '@/utils/richText';
import Editor from './Editor';

const MIN_SPLIT = 30;
const MAX_SPLIT = 70;
const DEFAULT_SPLIT = 45;

const TABS = [
  { id: 'statement', label: 'Statement', icon: FileText },
  { id: 'code', label: 'Code', icon: Code2 },
];

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

function SolvedPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-easy-soft px-2.5 py-1 text-xs font-medium text-easy">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      Solved
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="mb-3 mt-9 flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-muted">
      {children}
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
    </h2>
  );
}

function ExampleCard({ example, index }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <p className="border-b border-line bg-subtle/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Example {index + 1}
      </p>
      <dl className="space-y-3 p-4 text-sm">
        <div>
          <dt className="mb-1 text-xs font-medium text-muted">Input</dt>
          <dd className="break-words rounded-md bg-subtle px-3 py-2 font-mono text-[13px] leading-5">{example.input}</dd>
        </div>
        <div>
          <dt className="mb-1 text-xs font-medium text-muted">Output</dt>
          <dd className="break-words rounded-md bg-subtle px-3 py-2 font-mono text-[13px] leading-5">{example.output}</dd>
        </div>
        {example.explanation && (
          <div>
            <dt className="mb-1 text-xs font-medium text-muted">Explanation</dt>
            <dd className="leading-6 text-muted">{example.explanation}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function Statement({ problem }) {
  return (
    <article className="mx-auto max-w-[72ch] px-5 py-6 sm:px-7 sm:py-7">
      <h1 className="text-2xl font-semibold leading-tight tracking-tight">
        <span className="tabular-nums text-muted">{problem.id}.</span> {problem.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        {problem.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="mt-6 space-y-4 text-[15px] leading-7">
        {problem.description.map((paragraph, index) => (
          <p key={index}>{renderInline(paragraph)}</p>
        ))}
      </div>

      <SectionTitle>Examples</SectionTitle>
      <div className="space-y-4">
        {problem.examples.map((example, index) => (
          <ExampleCard key={index} example={example} index={index} />
        ))}
      </div>

      <SectionTitle>Constraints</SectionTitle>
      <ul className="space-y-2 text-sm">
        {problem.constraints.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted/60" aria-hidden="true" />
            <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[0.85em] leading-6">{item}</code>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ErrorState({ notFound, error, onRetry }) {
  const Icon = notFound ? FileQuestion : AlertCircle;
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-muted">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-xl font-semibold">{notFound ? 'Problem not found' : 'Could not load this problem'}</h1>
      <p className="mt-2 text-sm text-muted" role={notFound ? undefined : 'alert'}>
        {notFound ? 'It may have been removed or the link is wrong.' : error}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        {!notFound && (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button as={Link} to="/" icon={ArrowLeft}>
          Back to problems
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Problem() {
  const { slug } = useParams();
  const { problem, loading, error, notFound, reload } = useProblem(slug);
  const { isAuthenticated } = useAuth();

  const [solved, setSolved] = useState(false);
  const [tab, setTab] = useState('statement');
  const [isDragging, setIsDragging] = useState(false);
  const [split, setSplit] = useLocalStorage('algonest-split', DEFAULT_SPLIT);
  const containerRef = useRef(null);
  const statementRef = useRef(null);
  const dragging = useRef(false);

  usePageTitle(problem?.title);

  useEffect(() => {
    if (!isAuthenticated || !problem) {
      setSolved(false);
      return undefined;
    }
    let cancelled = false;
    getSolvedSlugs()
      .then((slugs) => !cancelled && setSolved(slugs.includes(problem.slug)))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, problem]);

  /* Start each problem at the top of the statement, on the statement tab. */
  const problemSlug = problem?.slug;
  useEffect(() => {
    statementRef.current?.scrollTo?.({ top: 0 });
    setTab('statement');
  }, [problemSlug]);

  if (loading) return <Loader fullPage label="Loading problem" />;

  if (notFound || error) {
    return <ErrorState notFound={notFound} error={error} onRetry={reload} />;
  }

  const safeSplit = clamp(Number(split) || DEFAULT_SPLIT, MIN_SPLIT, MAX_SPLIT);

  const onPointerDown = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    setIsDragging(true);
  };
  const onPointerMove = (event) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSplit(clamp(((event.clientX - rect.left) / rect.width) * 100, MIN_SPLIT, MAX_SPLIT));
  };
  const onPointerUp = (event) => {
    dragging.current = false;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };
  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') setSplit(clamp(safeSplit - 2, MIN_SPLIT, MAX_SPLIT));
    if (event.key === 'ArrowRight') setSplit(clamp(safeSplit + 2, MIN_SPLIT, MAX_SPLIT));
    if (event.key === 'Home' || event.key === 'Enter') setSplit(DEFAULT_SPLIT);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Breadcrumb bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-surface px-4 py-2.5 sm:px-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Problems</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted/60 sm:block" aria-hidden="true" />
        <p className="hidden min-w-0 flex-1 truncate text-sm font-medium sm:block">{problem.title}</p>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">{solved && <SolvedPill />}</div>
      </div>

      {/* Mobile tabs */}
      <div className="shrink-0 border-b border-line bg-surface p-2 lg:hidden">
        <div role="tablist" aria-label="Problem view" className="grid grid-cols-2 gap-1 rounded-lg bg-subtle p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                tab === id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace */}
      <div className="flex min-h-0 flex-1 flex-col p-3 lg:p-4">
        <div
          ref={containerRef}
          style={{ '--split': `${safeSplit}%` }}
          className={cn('flex min-h-0 flex-1 flex-col lg:flex-row', isDragging && 'select-none')}
        >
          <section
            ref={statementRef}
            role="tabpanel"
            aria-label="Problem statement"
            className={cn(
              'min-h-0 flex-1 overflow-y-auto rounded-xl border border-line bg-surface lg:w-[var(--split)] lg:flex-none',
              tab !== 'statement' && 'hidden lg:block',
            )}
          >
            <Statement problem={problem} />
          </section>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panels"
            aria-valuenow={Math.round(safeSplit)}
            aria-valuemin={MIN_SPLIT}
            aria-valuemax={MAX_SPLIT}
            title="Drag to resize, double-click to reset"
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            onDoubleClick={() => setSplit(DEFAULT_SPLIT)}
            className="group hidden w-4 shrink-0 cursor-col-resize touch-none items-center justify-center outline-none lg:flex"
          >
            <span
              className={cn(
                'h-12 w-1 rounded-full transition-colors group-hover:bg-accent group-focus-visible:bg-accent',
                isDragging ? 'bg-accent' : 'bg-line',
              )}
            />
          </div>

          <section
            role="tabpanel"
            aria-label="Code editor"
            className={cn('min-h-0 min-w-0 flex-1 flex-col', tab === 'code' ? 'flex' : 'hidden lg:flex')}
          >
            <Editor key={problem.slug} problem={problem} onAccepted={() => setSolved(true)} />
          </section>
        </div>
      </div>
    </div>
  );
}
