import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Loader from '@/components/Loader';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import Landing from '@/pages/Landing';
import Leaderboard from '@/pages/Leaderboard';
import Login from '@/pages/Login';
import Profile from '@/pages/Profile';
import Signup from '@/pages/Signup';
import ProtectedRoute from './ProtectedRoute';

// Monaco is heavy, so the problem page is loaded only when it is opened.
const Problem = lazy(() => import('@/pages/Problem'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Landing />} />
          <Route path="problems" element={<Home />} />
          <Route path="problems/:slug" element={<Problem />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

