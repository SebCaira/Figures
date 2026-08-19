import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts } from '../../src/theme/theme';
import { useSession } from '../../src/lib/session';
import { useData } from '../../src/lib/data';
import { useQuizRun } from '../../src/lib/quizRun';
import { FicheDetail } from '../../src/components/FicheDetail';
import { BackButton, PrimaryButton } from '../../src/components/ui';

export default function FicheDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { collection, progress } = useSession();
  const { allQuizzes } = useData();
  const { startQuiz } = useQuizRun();
  const router = useRouter();

  const fiche = collection.find((f) => f.id === id);
  if (!fiche) return null;

  const quiz = allQuizzes[fiche.code?.toUpperCase() || fiche.id.toUpperCase()];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <BackButton onPress={() => router.back()} />
      <Text style={styles.header}>Fiche personnage</Text>
      <View style={{ marginTop: 16 }}>
        <FicheDetail fiche={fiche} progress={progress[fiche.id]} />
      </View>
      {quiz && (
        <View style={{ marginTop: 8 }}>
          <PrimaryButton
            label="↻ Refaire le quiz"
            dark={false}
            onPress={() => { startQuiz(quiz, 'character'); router.push('/quiz'); }}
          />
          <Text style={styles.hint}>Pour améliorer ton score et viser le 🏅 sans faute.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 8 },
  hint: { fontFamily: fonts.sans, fontSize: 11, color: colors.placeholder, textAlign: 'center', marginTop: 8 },
});
