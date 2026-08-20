import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import {
  useFonts,
  Newsreader_400Regular,
  Newsreader_500Medium,
  Newsreader_500Medium_Italic,
  Newsreader_600SemiBold,
  Newsreader_700Bold,
} from '@expo-google-fonts/newsreader';
import {
  useFonts as usePublicSansFonts,
  PublicSans_400Regular,
  PublicSans_700Bold,
} from '@expo-google-fonts/public-sans';
import {
  useFonts as useAtkinsonFonts,
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { colors } from '../src/theme/theme';
import { SessionProvider } from '../src/lib/session';
import { DataProvider } from '../src/lib/data';
import { ToastProvider } from '../src/lib/toast';
import { QuizRunProvider } from '../src/lib/quizRun';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [newsreaderLoaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_500Medium,
    Newsreader_500Medium_Italic,
    Newsreader_600SemiBold,
    Newsreader_700Bold,
  });
  const [publicSansLoaded] = usePublicSansFonts({
    PublicSans_400Regular,
    PublicSans_700Bold,
  });
  const [atkinsonLoaded] = useAtkinsonFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });
  const fontsLoaded = newsreaderLoaded && publicSansLoaded && atkinsonLoaded;

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.navy }} />;

  return (
    <ErrorBoundary>
      <SessionProvider>
        <DataProvider>
          <ToastProvider>
            <QuizRunProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }} />
            </QuizRunProvider>
          </ToastProvider>
        </DataProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
