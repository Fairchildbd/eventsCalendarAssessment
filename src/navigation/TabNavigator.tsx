import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';

import { colors, typography } from '@/utils/theme';

const TABS = [
  { name: 'index', title: 'Events', icon: 'calendar', iconInactive: 'calendar-outline' },
  { name: 'tickets', title: 'My Tickets', icon: 'ticket', iconInactive: 'ticket-outline' },
] as const;

export default function TabNavigator() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.onDarkMuted,
        tabBarStyle: { backgroundColor: colors.deepPurple, borderTopWidth: 0 },
        tabBarLabelStyle: { ...typography.small, fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons name={focused ? tab.icon : tab.iconInactive} size={size} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
