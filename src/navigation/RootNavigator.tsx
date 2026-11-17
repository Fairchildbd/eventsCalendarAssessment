import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { EventCatalogProvider } from '@/store/EventCatalogContext';
import { EventFiltersProvider } from '@/store/EventFiltersContext';
import { ReservationsProvider } from '@/store/ReservationsContext';
import { colors } from '@/utils/theme';

export default function RootNavigator() {
  return (
    <ReservationsProvider>
      <EventCatalogProvider>
        <EventFiltersProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="reservation/[id]" options={{ gestureEnabled: false }} />
          </Stack>
        </EventFiltersProvider>
      </EventCatalogProvider>
    </ReservationsProvider>
  );
}
