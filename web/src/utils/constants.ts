export const IMAGE_SIZE = 224;
export const MODEL_PATH = '/models/peacock_egg_classifier_tfjs/model.json';
export const CONFIDENCE_THRESHOLD = 0.7;

export const LABELS = {
  0: 'fertile',
  1: 'infertile',
} as const;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const STORAGE_KEYS = {
  HISTORY: 'eggHistory',
} as const;

export const COLORS = {
  PRIMARY: '#22c55e',
  SECONDARY: '#16a34a',
  SUCCESS: '#22c55e',
  ERROR: '#ef4444',
  WARNING: '#eab308',
  BACKGROUND: '#f0fdf4',
  TEXT: '#1f2937',
  TEXT_SECONDARY: '#6b7280',
  BORDER: '#e5e7eb',
} as const;

export const FONT_SIZES = {
  SMALL: '0.75rem',
  MEDIUM: '0.875rem',
  LARGE: '1rem',
  XLARGE: '1.125rem',
  XXLARGE: '1.5rem',
  XXXLARGE: '1.75rem',
} as const;
