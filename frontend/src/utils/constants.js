export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const POINTS = { Easy: 10, Medium: 20, Hard: 40 };

export const LANGUAGES = [
  { id: 'python', label: 'Python', monaco: 'python' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
  { id: 'java', label: 'Java', monaco: 'java' },
];

export const DEFAULT_LANGUAGE = 'python';

export const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'solved', label: 'Solved' },
  { id: 'unsolved', label: 'Unsolved' },
];

export const getLanguage = (id) => LANGUAGES.find((language) => language.id === id);

export const getLanguageLabel = (id) => getLanguage(id)?.label ?? id;
