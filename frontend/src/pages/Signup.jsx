import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthPanel from '@/components/AuthPanel';
import Button, { IconButton } from '@/components/Button';
import Input from '@/components/Input';
import useAuth from '@/hooks/useAuth';
import usePageTitle from '@/hooks/usePageTitle';
import { getErrorMessage } from '@/services/api';
import { validateSignup } from '@/utils/validators';

export default function Signup() {
  usePageTitle('Sign up');
  const { signup, isAuthenticated } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/';

  const [values, setValues] = useState({ username: '', email: '', password: '', confirmPassword: '' });
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

    const nextErrors = validateSignup(values);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signup({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not create your account. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full">
      <AuthPanel />
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted">Start solving problems and building a streak.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            {formError && (
              <p role="alert" className="rounded-lg border border-hard/30 bg-hard-soft px-3 py-2 text-sm text-hard">
                {formError}
              </p>
            )}

            <Input
              label="Username"
              name="username"
              autoComplete="username"
              value={values.username}
              onChange={handleChange}
              error={errors.username}
              hint="3 to 20 characters: letters, numbers, underscores."
            />
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
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              hint="At least 8 characters with a letter and a number."
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
            <Input
              label="Confirm password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <Button type="submit" fullWidth loading={submitting} size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" state={location.state} className="font-medium text-accent-text hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

