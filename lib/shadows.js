// ReviewBoostMobile/lib/shadows.js
// ✅ Reusable shadow styles that work on all platforms

import { Platform } from 'react-native';

export const shadows = {
  small: Platform.select({
    web: {
      boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  }),

  medium: Platform.select({
    web: {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.10)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      elevation: 4,
    },
  }),

  large: Platform.select({
    web: {
      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
  }),

  purple: Platform.select({
    web: {
      boxShadow: '0px 6px 20px rgba(124, 58, 237, 0.35)',
    },
    default: {
      shadowColor: '#7c3aed',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 6,
    },
  }),

  card: Platform.select({
    web: {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
  }),

  tab: Platform.select({
    web: {
      boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 10,
    },
  }),
};