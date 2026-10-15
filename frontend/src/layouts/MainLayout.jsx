import { Outlet, useLocation } from 'react-router-dom';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

// The problem workspace (editor + console) needs the full viewport with no page
// scroll. The auth pages have their own full-height branded split layout.
// Both skip the footer.
const NO_FOOTER = (path) => /^\/problems\/[^/]+$/.test(path) || path === '/login' || path === '/signup';

export default function MainLayout() {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER(pathname);

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div key={pathname} className="flex min-h-full flex-1 flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          {showFooter && <Footer />}
        </div>
      </main>
    </div>
  );
}

