import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors, fonts } from '../../src/theme/theme';

export default function ProfLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarStyle: { backgroundColor: colors.cream, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.sansBold, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="fiches"
        options={{ title: 'Fiches', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>❏</Text> }}
      />
      <Tabs.Screen
        name="classe"
        options={{ title: 'Classe', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>❒</Text> }}
      />
      <Tabs.Screen
        name="reglages"
        options={{ title: 'Réglages', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙</Text> }}
      />
    </Tabs>
  );
}
