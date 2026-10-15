import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthPanel from '@/components/AuthPanel';
import Button, { IconButton } from '@/components/Button';
import Input from '@/components/Input';
import useAuth from '@/hooks/useAuth';
import usePageTitle from '@/hooks/usePageTitle';
import { USE_MOCK, getErrorMessage } from '@/services/api';
import { validateLogin } from '@/utils/validators';

export default function Login() {
  usePageTitle('Log in');
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/';

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not log in. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full">
      <AuthPanel />
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted">Log in to pick up where you left off.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            {formError && (
              <p role="alert" className="rounded-lg border border-hard/30 bg-hard-soft px-3 py-2 text-sm text-hard">
                {formError}
              </p>
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              right={
                <IconButton
                  icon={showPassword ? EyeOff : Eye}
                  label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                  className="h-8 w-8"
                />
              }
            />

            <Button type="submit" fullWidth loading={submitting} size="lg">
              Log in
            </Button>
          </form>

          {USE_MOCK && (
            <p className="mt-4 rounded-lg bg-sun-soft px-3 py-2 text-xs text-sun-text">
              Demo mode: use demo@algonest.dev with any password, or create an account.
            </p>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            New to AlgoNest?{' '}
            <Link to="/signup" state={location.state} className="font-medium text-accent-text hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

