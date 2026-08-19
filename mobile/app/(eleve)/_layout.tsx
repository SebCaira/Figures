import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors, fonts } from '../../src/theme/theme';

export default function EleveLayout() {
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
        name="quizz"
        options={{ title: 'Quizz', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>◆</Text> }}
      />
      <Tabs.Screen
        name="fiches"
        options={{ title: 'Mes fiches', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>❏</Text> }}
      />
      <Tabs.Screen
        name="espace"
        options={{ title: 'Mon espace', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>●</Text> }}
      />
    </Tabs>
  );
}
