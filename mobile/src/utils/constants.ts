export const IMAGE_SIZE = 224;
export const MODEL_PATH = 'assets/models/peacock_egg_classifier.tflite';
export const CONFIDENCE_THRESHOLD = 0.7;

export const LABELS = {
  0: 'infertile',
  1: 'fertile',
} as const;

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

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
  SMALL: 12,
  MEDIUM: 14,
  LARGE: 16,
  XLARGE: 18,
  XXLARGE: 24,
  XXXLARGE: 28,
} as const;
