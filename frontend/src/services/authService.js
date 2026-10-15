import api, { TOKEN_KEY, USER_KEY, USE_MOCK } from './api';
import { findUserByEmail, isUsernameTaken, saveUser } from './mockDb';
import { createHttpError, sleep } from '@/utils/helpers';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

const mockToken = () => `mock.${Math.random().toString(36).slice(2)}`;

/** Expected API: POST /auth/login  { email, password } -> { token, user } */
export async function login({ email, password }) {
  let session;

  if (USE_MOCK) {
    await sleep(500);
    // Mock mode does not check the password: any password works for an existing account.
    const user = findUserByEmail(email);
    if (!user) throw createHttpError('No account found for this email. Sign up first.', 404);
    session = { token: mockToken(), user };
  } else {
    const { data } = await api.post('/auth/login', { email, password });
    session = data;
  }

  persistSession(session);
  return session.user;
}

/** Expected API: POST /auth/signup  { username, email, password } -> { token, user } */
export async function signup({ username, email, password }) {
  let session;

  if (USE_MOCK) {
    await sleep(600);
    if (findUserByEmail(email)) throw createHttpError('An account with this email already exists.', 409);
    if (isUsernameTaken(username)) throw createHttpError('That username is taken. Try another one.', 409);
    const user = { id: `u_${Date.now()}`, username, email: email.toLowerCase(), joinedAt: Date.now() };
    saveUser(user);
    session = { token: mockToken(), user };
  } else {
    const { data } = await api.post('/auth/signup', { username, email, password });
    session = data;
  }

  persistSession(session);
  return session.user;
}

export function logout() {
  clearSession();
}
