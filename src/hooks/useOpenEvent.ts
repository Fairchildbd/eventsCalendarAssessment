import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export function useOpenEvent() {
  const router = useRouter();
  return useCallback(
    (id: string) => router.push({ pathname: '/event/[id]', params: { id } }),
    [router],
  );
}
