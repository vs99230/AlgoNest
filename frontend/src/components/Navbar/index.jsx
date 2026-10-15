import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from 'lucide-react';
import Avatar from '@/components/Avatar';
import Button, { IconButton } from '@/components/Button';
import useAuth from '@/hooks/useAuth';
import useClickOutside from '@/hooks/useClickOutside';
import useTheme from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  {
    to: '/problems',
    label: 'Problems',
    isActive: (path) => path.startsWith('/problems'),
  },
  {
    to: '/leaderboard',
    label: 'Leaderboard',
    isActive: (path) => path.startsWith('/leaderboard'),
  },
];

const glassHeader = 'border-b border-line bg-navbar';

const glassPanel = 'border border-line bg-surface shadow-sm';

const menuItem =
  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors duration-150 hover:bg-selected hover:text-accent-text';

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();

  useClickOutside(ref, () => setOpen(false), open);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div
      ref={ref}
      className="relative"
      onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
            'group flex h-10 items-center gap-2 rounded-full border px-1.5 transition-colors duration-150 sm:pr-3',
          open
            ? 'border-accent/40 bg-selected'
            : 'border-line bg-surface hover:border-accent/30 hover:bg-selected',
        )}
      >
        <Avatar name={user.username} size="sm" />

        <span className="hidden max-w-[9rem] truncate text-sm font-semibold sm:inline">
          {user.username}
        </span>

        <ChevronDown
          className={cn(
            'hidden h-4 w-4 text-muted transition-transform duration-150 sm:block',
            open && 'rotate-180 text-accent',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-3 w-60 origin-top-right animate-fade-in overflow-hidden rounded-2xl p-1.5',
            glassPanel,
          )}
        >
          <div className="flex items-center gap-3 rounded-xl bg-subtle p-3">
            <Avatar name={user.username} size="md" />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.username}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>

          <div className="my-1.5 h-px bg-line" />

          <Link to="/profile" className={menuItem}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <User className="h-4 w-4" aria-hidden="true" />
            </span>
            Profile
          </Link>

          <button type="button" onClick={onLogout} className={menuItem}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-hard-soft text-hard">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </span>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useClickOutside(headerRef, () => setMenuOpen(false), menuOpen);
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header
      ref={headerRef}
      className={cn(
        'sticky top-0 z-40 shrink-0',
        glassHeader,
      )}
      onKeyDown={(event) => event.key === 'Escape' && setMenuOpen(false)}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link
          to="/"
          className="group flex items-center gap-2.5 rounded-xl px-1 py-1 text-base font-bold tracking-tight"
        >
          <span className="relative">
            <img
              src="/logo.svg"
              alt=""
              className="h-9 w-9 rounded-xl"
            />
          </span>

          <span className="text-ink">AlgoNest</span>
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-1 rounded-full border border-line bg-surface p-1 sm:flex"
        >
          {NAV_LINKS.map((link) => {
            const active = link.isActive(pathname);

            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150',
                  active
                    ? 'bg-selected text-accent-text'
                    : 'text-muted hover:bg-subtle hover:text-ink',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <IconButton
            icon={isDark ? Sun : Moon}
            label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
            className="rounded-full border border-line bg-surface transition-colors duration-150 hover:border-accent/30 hover:bg-selected"
          />

          {isAuthenticated ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                as={Link}
                to="/login"
                variant="ghost"
                size="sm"
                className="rounded-full border border-line bg-surface hover:bg-selected"
              >
                Log in
              </Button>

              <Button
                as={Link}
                to="/signup"
                size="sm"
                className="rounded-full"
              >
                Sign up
              </Button>
            </div>
          )}

          <IconButton
            icon={menuOpen ? X : Menu}
            label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-full border border-line bg-surface transition-colors duration-150 hover:border-accent/30 hover:bg-selected sm:hidden"
          />
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile"
          className={cn(
            'absolute inset-x-0 top-full animate-fade-in border-b p-3 sm:hidden',
            glassPanel,
            'rounded-b-2xl',
          )}
        >
          <div className="flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => {
              const active = link.isActive(pathname);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150',
                    active
                      ? 'bg-selected text-accent-text'
                      : 'text-muted hover:bg-subtle hover:text-ink',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {!isAuthenticated && (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <Button
                as={Link}
                to="/login"
                variant="secondary"
                className="rounded-xl"
              >
                Log in
              </Button>

              <Button
                as={Link}
                to="/signup"
                className="rounded-xl"
              >
                Sign up
              </Button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
