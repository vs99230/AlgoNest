const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Enter your email.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export function validateSignup({ username, email, password, confirmPassword }) {
  const errors = {};
  const name = username.trim();

  if (!name) errors.username = 'Choose a username.';
  else if (name.length < 3 || name.length > 20) errors.username = 'Use 3 to 20 characters.';
  else if (!USERNAME_PATTERN.test(name)) errors.username = 'Use only letters, numbers and underscores.';

  if (!email.trim()) errors.email = 'Enter your email.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address.';

  if (!password) errors.password = 'Create a password.';
  else if (password.length < 8) errors.password = 'Use at least 8 characters.';
  else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Include at least one letter and one number.';
  }

  if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}
