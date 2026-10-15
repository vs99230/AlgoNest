import { Link } from 'react-router-dom';
import { Code2, Heart, Mail } from 'lucide-react';

const PRODUCT_LINKS = [
  { to: '/problems', label: 'Problems' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/profile', label: 'Profile' },
];

const PRACTICE_LINKS = [
  { to: '/problems', label: 'Practice DSA' },
  { to: '/leaderboard', label: 'Top Coders' },
  { to: '/profile', label: 'Your Progress' },
];

const ACCOUNT_LINKS = [
  { to: '/login', label: 'Log in' },
  { to: '/signup', label: 'Sign up' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://github.com',
    label: 'AlgoNest on GitHub',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-2.1c-3.2.7-3.88-1.36-3.88-1.36-.53-1.35-1.3-1.71-1.3-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.4-1.27.73-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12A11.5 11.5 0 0 0 12 .5Z" />
      </svg>
    ),
  },
  {
    href: 'https://twitter.com',
    label: 'AlgoNest on X',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.63l-5.2-6.8-5.94 6.8H1.73l7.49-8.56L1 2.25h6.8l4.83 6.38 5.61-6.38Zm-1.16 17.52h1.83L7.02 4.13H5.05l12.03 15.64Z" />
      </svg>
    ),
  },
  {
    href: 'mailto:hello@algonest.dev',
    label: 'Email AlgoNest',
    icon: <Mail className="h-[18px] w-[18px]" aria-hidden="true" />,
  },
];

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted">
        {title}
      </p>

      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              <span className="h-1 w-1 rounded-full bg-accent/0 transition-colors duration-150 group-hover:bg-accent" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto shrink-0 border-t border-line bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_1fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-base font-bold tracking-tight text-ink"
            >
              <span className="relative">
                <img
                  src="/logo.svg"
                  alt=""
                  className="h-9 w-9 rounded-xl"
                />
              </span>

              <span>AlgoNest</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              A focused space to practice data structures and algorithms,
              maintain your streak, and see how you stack up against other
              developers.
            </p>

            <div className="mt-5 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noreferrer' : undefined}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors duration-150 hover:border-accent/30 hover:bg-selected hover:text-accent-text"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Practice" links={PRACTICE_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line/70 pt-6 text-xs text-muted sm:flex-row">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} AlgoNest. Built for practice, not
            production.
          </p>

          <p className="flex items-center gap-1.5 text-center">
            Made with
            <Heart
              className="h-3.5 w-3.5 fill-hard text-hard"
              aria-hidden="true"
            />
            by
            <span className="font-semibold text-ink">Vaibhav</span>
          </p>

          <p className="flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            React · Tailwind CSS · Monaco Editor
          </p>
        </div>
      </div>
    </footer>
  );
}
