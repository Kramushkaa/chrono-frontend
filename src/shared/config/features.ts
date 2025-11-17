export const featureFlags = {
  publicLists: import.meta.env.VITE_FEATURE_PUBLIC_LISTS === 'true',
  backendInfo:
    import.meta.env.VITE_SHOW_BACKEND_INFO === 'true' ||
    import.meta.env.MODE !== 'production',
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return Boolean(featureFlags[flag]);
}


