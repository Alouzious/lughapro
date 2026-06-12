export const APP_NAME = import.meta.env.VITE_APP_NAME || 'LughaPro';

export const ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
};

export const FEATURES = {
  GROQ_ENABLED: import.meta.env.VITE_GROQ_ENABLED === 'true',
  BLOCKCHAIN_ENABLED: import.meta.env.VITE_BLOCKCHAIN_ENABLED === 'true',
};

// CEFR levels and the cumulative credits required to unlock each.
export const LEVELS = [
  { code: 'A1', threshold: 0 },
  { code: 'A2', threshold: 150 },
  { code: 'B1', threshold: 300 },
  { code: 'B2', threshold: 500 },
  { code: 'C1', threshold: 800 },
  { code: 'C2', threshold: 1200 },
];

export const LEVEL_CODES = LEVELS.map((l) => l.code);

// Per-level badge colors (background, text).
export const LEVEL_COLORS = {
  A1: { bg: '#E8F5F0', fg: '#1A8C6A' },
  A2: { bg: '#D6F0EA', fg: '#0B5E47' },
  B1: { bg: '#E0ECFB', fg: '#2563EB' },
  B2: { bg: '#EDE6FB', fg: '#7C3AED' },
  C1: { bg: 'rgba(244,168,48,0.15)', fg: '#C9921A' },
  C2: { bg: 'linear-gradient(90deg,#C9921A,#F4A830)', fg: '#3D2A00' },
};

export const CREDIT_RULES = [
  { reason: 'Complete a module', credits: 10 },
  { reason: 'Pass a module quiz', credits: 20 },
  { reason: 'Complete a full course', credits: 100 },
  { reason: 'Complete a live session', credits: 50 },
  { reason: 'Daily AI practice (10+ msgs)', credits: 5 },
  { reason: 'Weekly streak (5+ days)', credits: 100 },
  { reason: 'Refer a student', credits: 200 },
];
