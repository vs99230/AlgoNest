import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '@/services/authService';
import { UNAUTHORIZED_EVENT } from '@/services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  const login = useCallback(async (credentials) => {
    const nextUser = await authService.login(credentials);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signup = useCallback(async (details) => {
    const nextUser = await authService.signup(details);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // The API layer fires this when the backend answers 401 (expired or invalid token).
  useEffect(() => {
    const handleUnauthorized = () => {
      authService.clearSession();
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, signup, logout }),
    [user, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
