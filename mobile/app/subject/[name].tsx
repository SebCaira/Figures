import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fonts, radii, subjectMeta } from '../../src/theme/theme';
import { useData } from '../../src/lib/data';
import { famName } from '../../src/lib/text';
import { BackButton, PrimaryButton } from '../../src/components/ui';

export default function SubjectDetail() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const subject = decodeURIComponent(name || '');
  const { customQuizzes } = useData();
  const router = useRouter();
  const meta = subjectMeta(subject);

  const chars = useMemo(
    () => Object.values(customQuizzes).filter((q) => q.subject === subject),
    [customQuizzes, subject]
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
      <BackButton onPress={() => router.back()} />
      <View style={styles.headerRow}>
        <View style={[styles.dot, { backgroundColor: meta.color }]} />
        <Text style={styles.title}>{subject}</Text>
      </View>
      <Text style={styles.count}>{chars.length} personnage{chars.length > 1 ? 's' : ''}</Text>

      <View style={{ marginTop: 18, gap: 10 }}>
        {chars.map((c) => (
          <View key={c.code} style={styles.card}>
            <Text style={styles.name}>{famName(c.name)}</Text>
            <Text style={styles.meta}>{c.niveau} · {c.langue} · {c.questions.length} questions · par {c.by}</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeLabel}>Code</Text>
              <Text style={styles.code}>{c.code}</Text>
            </View>
            <PrimaryButton
              label="✎ Modifier la fiche"
              dark={false}
              onPress={() => router.push(`/create?edit=${c.code}`)}
              style={{ marginTop: 10 }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontFamily: fonts.serifSemiBold, fontSize: 22, color: colors.navy },
  count: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, marginTop: 4 },
  card: { backgroundColor: colors.cardWhite, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: 14 },
  name: { fontFamily: fonts.serifSemiBold, fontSize: 16, color: colors.navy },
  meta: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, marginTop: 3 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  codeLabel: { fontFamily: fonts.sans, fontSize: 11, color: colors.placeholder },
  code: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.navy, letterSpacing: 1 },
});
