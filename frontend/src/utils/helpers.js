export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function createHttpError(message, status) {
  return Object.assign(new Error(message), { status });
}
