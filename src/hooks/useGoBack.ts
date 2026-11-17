import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';

export function useGoBack(fallback: Href) {
  const router = useRouter();
  return useCallback(
    () => (router.canGoBack() ? router.back() : router.replace(fallback)),
    [router, fallback],
  );
}
