/**
 * Tiny localStorage "database" used only while VITE_USE_MOCK=true.
 * Mock mode provides demo data only; code execution requires the backend.
 */
import { seedSubmissions } from '@/data/mockSubmissions';
import { problems } from '@/data/problems';

const SUBMISSIONS_KEY = 'algonest-mock-submissions';
const USERS_KEY = 'algonest-mock-users';
const DAY = 86400 * 1000;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: mock data just will not persist */
  }
}

export const findProblemBySlug = (slug) => problems.find((problem) => problem.slug === slug);

export function getAllSubmissions() {
  return [...readJson(SUBMISSIONS_KEY, []), ...seedSubmissions].sort((a, b) => b.submittedAt - a.submittedAt);
}

export function addSubmission(submission) {
  const stored = readJson(SUBMISSIONS_KEY, []);
  stored.push(submission);
  writeJson(SUBMISSIONS_KEY, stored.slice(-200));
}

function getUsers() {
  return {
    'demo@algonest.dev': {
      id: 'u_demo',
      username: 'demo',
      email: 'demo@algonest.dev',
      joinedAt: Date.now() - 45 * DAY,
    },
    ...readJson(USERS_KEY, {}),
  };
}

export const findUserByEmail = (email) => getUsers()[email.toLowerCase()] ?? null;

export const isUsernameTaken = (username) =>
  Object.values(getUsers()).some((user) => user.username.toLowerCase() === username.toLowerCase());

export function saveUser(user) {
  const stored = readJson(USERS_KEY, {});
  stored[user.email.toLowerCase()] = user;
  writeJson(USERS_KEY, stored);
}
