import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Flame,
  Sparkles,
  Terminal,
  Trophy,
  Zap,
} from 'lucide-react';
import Button from '@/components/Button';
import { DifficultyBadge } from '@/components/Badge';
import useAuth from '@/hooks/useAuth';
import usePageTitle from '@/hooks/usePageTitle';
import { problems } from '@/data/problems';

/* -------------------------------------------------------------------------- */
/*  Content                                                                    */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: Terminal,
    tone: 'sun',
    title: 'In-browser editor',
    description: 'Write, run and submit code in Python, JavaScript, C++ or Java with a full Monaco editor and instant console output.',
  },
  {
    icon: Flame,
    tone: 'leaf',
    title: 'Track your streak',
    description: 'Every accepted submission counts toward your daily streak, so consistent practice is easy to see and keep up.',
  },
  {
    icon: Trophy,
    tone: 'sun',
    title: 'Climb the leaderboard',
    description: 'Points scale with difficulty. Solve harder problems, earn more, and see exactly where you rank.',
  },
  {
    icon: BarChart3,
    tone: 'leaf',
    title: 'See your progress',
    description: 'Your profile breaks down solved problems by difficulty and keeps a full history of past submissions.',
  },
];

const STEPS = [
  { title: 'Pick a problem', description: 'Filter by difficulty or topic and find something that fits your level.' },
  { title: 'Write your solution', description: 'Code in the editor, run it against sample cases, and iterate until it clicks.' },
  { title: 'Submit and track it', description: 'Submit for the full test suite, then watch your stats and streak grow.' },
];

const TOPICS = [
  'Arrays',
  'Strings',
  'Hash Maps',
  'Two Pointers',
  'Linked Lists',
  'Stacks & Queues',
  'Binary Search',
  'Trees',
  'Graphs',
  'Recursion',
  'Dynamic Programming',
  'Sorting',
];

const TRUST_POINTS = ['4 languages', 'Instant feedback', 'Free to start'];

const TONE_CLASSES = {
  sun: 'bg-sun-soft text-sun-text',
  leaf: 'bg-leaf-soft text-leaf-text',
};

/* Syntax-highlighted snippet for the hero editor mock. Each line is a list of [text, color]. */
const C = {
  kw: '#ff7b72',
  fn: '#d2a8ff',
  num: '#79c0ff',
  plain: '#e6edf3',
  muted: '#8b949e',
  builtin: '#ffa657',
};

const CODE_LINES = [
  [['def ', C.kw], ['two_sum', C.fn], ['(nums, target):', C.plain]],
  [['    seen = {}', C.plain]],
  [['    for ', C.kw], ['i, n ', C.plain], ['in ', C.kw], ['enumerate', C.builtin], ['(nums):', C.plain]],
  [['        if ', C.kw], ['target - n ', C.plain], ['in ', C.kw], ['seen:', C.plain]],
  [['            return ', C.kw], ['[seen[target - n], i]', C.plain]],
  [['        seen[n] = i', C.plain]],
];

/* -------------------------------------------------------------------------- */
/*  Static presentation helpers                                                */
/* -------------------------------------------------------------------------- */

function Reveal({ className = '', children }) {
  return <div className={className}>{children}</div>;
}

function CountUp({ to }) {
  return <span>{to}</span>;
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                   */
/* -------------------------------------------------------------------------- */

/** Decorative editor window shown in the hero. */
function EditorMock() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      {/* Editor window */}
      <div
        className="relative overflow-hidden rounded-2xl border border-line bg-[#0F172A]"
        role="img"
        aria-label="Preview of the AlgoNest code editor solving the Two Sum problem"
      >
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="ml-3 rounded-md bg-white/[0.06] px-2.5 py-1 font-mono text-[11px] text-[#8b949e]">
            two_sum.py
          </span>
          <span className="ml-auto font-mono text-[11px] text-[#8b949e]">Python</span>
        </div>

        <div className="px-4 py-5 font-mono text-[12.5px] leading-6 sm:text-[13px]">
          {CODE_LINES.map((tokens, index) => (
            <div
              key={index}
              className="flex whitespace-pre"
            >
              <span className="mr-4 w-4 shrink-0 select-none text-right text-[#484f58]">{index + 1}</span>
              <span>
                {tokens.map(([text, color], i) => (
                  <span key={i} style={{ color }}>
                    {text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-3 border-t border-white/10 bg-[#14532D] px-4 py-3"
        >
          <CheckCircle2 className="h-5 w-5 text-[#4ADE80]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#4ADE80]">Accepted</span>
          <span className="ml-auto font-mono text-xs text-[#8b949e]">57/57 tests · 42 ms</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, tone, title, description }) {
  return (
    <div className="h-full rounded-xl border border-line bg-surface p-6 transition-colors duration-150 hover:border-muted/50">
      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

/** A few real problems, shown read-only as a taste of what's inside. */
function PreviewList() {
  const preview = problems.slice(0, 4);
  return (
    <div className="space-y-2.5">
      {preview.map((problem) => (
        <Reveal key={problem.slug}>
          <Link
            to={`/problems/${problem.slug}`}
            className="group flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-sm transition-colors duration-150 hover:border-muted/50 hover:bg-subtle"
          >
            <span className="min-w-0 flex-1 truncate font-medium">
              <span className="tabular-nums text-muted">{problem.id}.</span> {problem.title}
            </span>
            <span className="hidden text-xs tabular-nums text-muted sm:block">{problem.acceptance.toFixed(1)}%</span>
            <DifficultyBadge difficulty={problem.difficulty} className="w-16 justify-center" />
            <ArrowRight
              className="h-4 w-4 shrink-0 text-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

function TopicMarquee() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
        {TOPICS.map((topic) => (
          <span
            key={topic}
            className="whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-muted/40 hover:text-current"
          >
            {topic}
          </span>
        ))}
      <span className="sr-only">Topics covered: {TOPICS.join(', ')}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Landing() {
  usePageTitle();
  const { isAuthenticated } = useAuth();

  const stats = [
    { value: problems.length, suffix: '+', label: 'Problems' },
    { value: 4, suffix: '', label: 'Languages' },
    { value: 3, suffix: '', label: 'Difficulty levels' },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {/* Hero */}
        <section className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sun-soft text-sun-text">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
              </span>
              {problems.length} problems and counting
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Sharpen your coding skills, <span className="text-accent-text">one problem</span> at a time
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg lg:mx-0">
              AlgoNest is a focused space to practice data structures and algorithms:
              solve problems in your browser, track your streak, and see how you stack up.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button as={Link} to="/problems" size="lg" icon={ArrowRight} className="sm:order-2">
                Start solving
              </Button>
              {!isAuthenticated && (
                <Button as={Link} to="/signup" variant="secondary" size="lg" className="sm:order-1">
                  Create a free account
                </Button>
              )}
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted lg:justify-start">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-leaf-text" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <EditorMock />
        </section>

        {/* Stat strip */}
        <Reveal className="mx-auto mt-20 max-w-3xl">
          <section className="grid grid-cols-3 divide-x divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {stats.map((stat) => (
              <div key={stat.label} className="px-2 py-6 text-center sm:py-7">
                <p className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
                  <CountUp to={stat.value} />
                  {stat.suffix}
                </p>
                <p className="mt-1 text-xs text-muted sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </section>
        </Reveal>

        {/* Topics marquee */}
        <Reveal className="mt-16">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-muted">
            Practice the topics that matter
          </p>
          <TopicMarquee />
        </Reveal>

        {/* Features */}
        <section className="mt-24">
          <Reveal className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-3 py-1 text-xs font-medium text-leaf-text">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Features
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">Everything you need to practice</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted sm:text-base">
              A simple, focused toolset built around actually solving problems.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Reveal key={feature.title}>
                <FeatureCard {...feature} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <Reveal className="mt-24">
          <section className="rounded-2xl border border-line bg-surface p-6 sm:p-12">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
                <ol className="relative mt-8 space-y-8">
                  <span
                    className="absolute bottom-4 left-4 top-4 w-px bg-line"
                    aria-hidden="true"
                  />
                  {STEPS.map((step, index) => (
                    <li key={step.title} className="relative flex gap-4">
                      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf-soft text-sm font-semibold text-leaf-text">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Button as={Link} to="/problems" icon={ArrowRight} className="mt-10">
                  Browse all problems
                </Button>
              </div>

              <div>
                <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted">
                  <Code2 className="h-4 w-4" aria-hidden="true" />
                  A few problems to start with
                </p>
                <PreviewList />
              </div>
            </div>
          </section>
        </Reveal>

        {/* Final CTA */}
        <Reveal className="mt-24">
          <section className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface px-6 py-14 text-center sm:px-12">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sun-soft">
                  <CheckCircle2 className="h-7 w-7 text-sun-text" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-4xl">
                Ready to write your first solution?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted sm:text-base">
                Jump straight into a problem. Logging in is only needed when you want your submissions saved.
              </p>
              <Button as={Link} to="/problems" size="lg" icon={ArrowRight} className="mt-8">
                Start solving now
              </Button>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
