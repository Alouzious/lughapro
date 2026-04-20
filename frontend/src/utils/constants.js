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
