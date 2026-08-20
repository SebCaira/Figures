import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/theme';
import { useSession } from '../lib/session';

const LARGE_SCALE = 1.15;

// "Grand texte" scales the whole app shell (text and UI alike), matching the
// original web app's `zoom` accessibility toggle — done via transform since
// RN has no CSS zoom equivalent, sized to counter-scale so content still
// fills the screen instead of clipping.
export function AppShell() {
  const { a11y } = useSession();
  const { width, height } = useWindowDimensions();
  const scale = a11y.large ? LARGE_SCALE : 1;

  return (
    <View
      style={{
        flex: 1,
        width: width / scale,
        height: height / scale,
        transform: [{ scale }],
        transformOrigin: [0, 0],
      }}
    >
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }} />
    </View>
  );
}
