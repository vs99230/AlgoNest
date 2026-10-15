import { CheckCircle2, Code2, Flame, Trophy } from 'lucide-react';

const POINTS = [
  { icon: Code2, text: 'Solve problems in Python, JavaScript, C++ or Java' },
  { icon: Flame, text: 'Build a daily streak and watch it grow' },
  { icon: Trophy, text: 'Climb the leaderboard as you solve more' },
];

/**
 * Branded side panel shown next to the Login/Signup form on wide screens.
 * Purely decorative — hidden on small screens where the form takes the full width.
 */
export default function AuthPanel() {
  return (
    <div className="hidden border-r border-line bg-surface p-10 text-ink lg:flex lg:w-[26rem] lg:shrink-0 lg:flex-col lg:justify-between xl:w-[30rem]">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <img src="/logo.svg" alt="" className="h-8 w-8 rounded-[9px]" />
        AlgoNest
      </div>

      <div>
        <h2 className="text-2xl font-semibold leading-snug">
          Practice makes progress, one problem at a time.
        </h2>
        <ul className="mt-6 space-y-4">
          {POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-muted">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Free to use. No credit card required.
      </p>
    </div>
  );
}
